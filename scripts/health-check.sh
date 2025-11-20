#!/bin/bash

# Health Check Script
# Monitors application health and sends alerts

set -e

APP_URL=${APP_URL:-"http://localhost"}
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}
EMAIL=${ALERT_EMAIL:-""}

check_web_service() {
    echo "🌐 Checking web service..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)
    
    if [ $HTTP_CODE -eq 200 ]; then
        echo "✅ Web service is healthy (HTTP $HTTP_CODE)"
        return 0
    else
        echo "❌ Web service is down (HTTP $HTTP_CODE)"
        return 1
    fi
}

check_database() {
    echo "🗄️ Checking database connection..."
    if php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';" | grep -q "OK"; then
        echo "✅ Database connection is healthy"
        return 0
    else
        echo "❌ Database connection failed"
        return 1
    fi
}

check_redis() {
    echo "📮 Checking Redis connection..."
    if php artisan tinker --execute="Redis::ping(); echo 'OK';" | grep -q "OK"; then
        echo "✅ Redis connection is healthy"
        return 0
    else
        echo "❌ Redis connection failed"
        return 1
    fi
}

check_queue() {
    echo "⚙️ Checking queue workers..."
    QUEUE_COUNT=$(ps aux | grep "queue:work" | grep -v grep | wc -l)
    
    if [ $QUEUE_COUNT -gt 0 ]; then
        echo "✅ Queue workers are running ($QUEUE_COUNT workers)"
        return 0
    else
        echo "❌ No queue workers found"
        return 1
    fi
}

check_disk_space() {
    echo "💾 Checking disk space..."
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $DISK_USAGE -lt 80 ]; then
        echo "✅ Disk space is sufficient (${DISK_USAGE}% used)"
        return 0
    else
        echo "⚠️ Warning: Disk space is running low (${DISK_USAGE}% used)"
        return 1
    fi
}

send_alert() {
    MESSAGE=$1
    
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Alert: $MESSAGE\"}" \
            $SLACK_WEBHOOK
    fi
    
    if [ ! -z "$EMAIL" ]; then
        echo "$MESSAGE" | mail -s "Application Health Alert" $EMAIL
    fi
    
    echo "📧 Alert sent: $MESSAGE"
}

# Run all checks
FAILED_CHECKS=""

check_web_service || FAILED_CHECKS="$FAILED_CHECKS web"
check_database || FAILED_CHECKS="$FAILED_CHECKS database"
check_redis || FAILED_CHECKS="$FAILED_CHECKS redis"
check_queue || FAILED_CHECKS="$FAILED_CHECKS queue"
check_disk_space || FAILED_CHECKS="$FAILED_CHECKS disk"

# Send alert if any check failed
if [ ! -z "$FAILED_CHECKS" ]; then
    send_alert "Health check failed for:$FAILED_CHECKS"
    exit 1
fi

echo "✅ All health checks passed!"
exit 0
