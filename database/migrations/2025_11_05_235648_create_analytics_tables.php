<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Analytics Events - Track all user interactions
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('event_type'); // page_view, click, search, purchase, video_view, etc.
            $table->string('event_category')->nullable(); // business, video, product, etc.
            $table->string('event_label')->nullable();
            $table->unsignedBigInteger('event_value')->nullable(); // Numeric value (e.g., price, duration)
            $table->json('metadata')->nullable(); // Additional data
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamps();

            $table->index(['event_type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('created_at');
        });

        // Daily Analytics Summary - Aggregated daily stats
        Schema::create('analytics_daily_summary', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('entity_type'); // business, video, product, platform
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->unsignedInteger('page_views')->default(0);
            $table->unsignedInteger('unique_visitors')->default(0);
            $table->unsignedInteger('actions')->default(0); // likes, comments, purchases
            $table->decimal('revenue', 10, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['date', 'entity_type', 'entity_id']);
            $table->index('date');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily_summary');
        Schema::dropIfExists('analytics_events');
    }
};
