# Video Processing Pipeline Setup

This document explains how to set up the video processing pipeline for thumbnail generation and transcoding.

## Prerequisites

### 1. Install FFmpeg

FFmpeg is required for video processing (thumbnail generation, transcoding, duration extraction).

#### Windows:
1. Download FFmpeg from: https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add to PATH or note the full paths to:
   - `C:\ffmpeg\bin\ffmpeg.exe`
   - `C:\ffmpeg\bin\ffprobe.exe`

#### Mac:
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# FFmpeg Configuration
FFMPEG_BINARIES=ffmpeg
FFPROBE_BINARIES=ffprobe

# If FFmpeg is not in PATH, specify full paths:
# Windows example:
# FFMPEG_BINARIES="C:\ffmpeg\bin\ffmpeg.exe"
# FFPROBE_BINARIES="C:\ffmpeg\bin\ffprobe.exe"

# Queue Configuration
QUEUE_CONNECTION=database
```

### 3. Run Database Migrations

The queue system uses the database:

```bash
php artisan queue:table
php artisan migrate
```

### 4. Start Queue Worker

To process videos in the background, start the queue worker:

```bash
php artisan queue:work
```

For development, use `queue:listen` for auto-reloading:

```bash
php artisan queue:listen
```

## How It Works

### 1. Video Upload
When a video is uploaded:
- Video is saved to storage
- Video record is created with status `processing`
- `ProcessVideo` job is dispatched to queue

### 2. Video Processing Job
The job performs:
- **Thumbnail Generation**: Extracts frame at 1 second
- **Duration Extraction**: Gets video length in seconds
- **Transcoding (Optional)**: Converts to standard format (H.264/AAC)
- Status updated to `published` or `failed`

### 3. Processing Service Features

#### Thumbnail Generation
- Extracts frame at 1 second mark
- Saves as JPEG in `storage/app/public/thumbnails/`
- Updates video record with thumbnail URL

#### Duration Extraction
- Uses FFprobe to get video duration
- Stores duration in seconds

#### Transcoding (Optional)
- Converts videos to H.264 video codec
- AAC audio codec
- Standardized bitrates
- Saves to `storage/app/public/videos/transcoded/`

## Storage Structure

```
storage/app/public/
├── videos/
│   ├── uploads/          # Original uploaded videos
│   └── transcoded/       # Processed/transcoded videos
└── thumbnails/           # Generated thumbnails
```

## Queue Management

### View Failed Jobs
```bash
php artisan queue:failed
```

### Retry Failed Jobs
```bash
php artisan queue:retry all
```

### Clear Failed Jobs
```bash
php artisan queue:flush
```

## Monitoring

Check logs for processing status:
```bash
tail -f storage/logs/laravel.log
```

Look for:
- `ProcessVideo job started`
- `Thumbnail generated`
- `Video processing completed`
- `ProcessVideo job failed`

## Troubleshooting

### FFmpeg Not Found
Error: `FFMpeg initialization failed`

Solution:
1. Verify FFmpeg is installed: `ffmpeg -version`
2. Check paths in `.env`
3. Restart queue worker

### Queue Not Processing
Problem: Videos stuck in `processing` status

Solution:
1. Check queue worker is running: `ps aux | grep queue:work`
2. Check failed jobs: `php artisan queue:failed`
3. Restart queue worker

### Thumbnail Generation Fails
Problem: No thumbnail created

Solution:
1. Verify video file exists and is accessible
2. Check storage permissions (775 for directories)
3. Check FFmpeg can read video format
4. Review logs for specific error

### Memory Issues
Problem: Job times out or runs out of memory

Solution:
1. Increase PHP memory limit in `php.ini`
2. Increase job timeout in `ProcessVideo.php`
3. Process videos in smaller batches

## Production Deployment

For production, use a process manager like Supervisor:

### Supervisor Configuration

Create `/etc/supervisor/conf.d/laravel-worker.conf`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/app/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/app/storage/logs/worker.log
stopwaitsecs=3600
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

## Performance Optimization

### 1. Use Redis for Queues
```env
QUEUE_CONNECTION=redis
```

### 2. Multiple Workers
Run multiple queue workers for parallel processing:
```bash
php artisan queue:work --queue=high,default
php artisan queue:work --queue=default
```

### 3. Separate Video Queue
Create dedicated queue for video processing:
```php
ProcessVideo::dispatch($video->id)->onQueue('video-processing');
```

## API Endpoints

### Upload Video
```
POST /api/videos
```

### Check Video Status
```
GET /api/videos/{uuid}
```

Response includes status:
- `processing`: Video is being processed
- `published`: Video is ready
- `failed`: Processing failed

## Testing

Test the pipeline manually:

```bash
# Create a test video
php artisan tinker

# In tinker:
$video = \App\Modules\Videos\Models\Video::first();
\App\Jobs\ProcessVideo::dispatch($video->id);
```

Then check logs and database for results.
