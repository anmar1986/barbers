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
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('video_url', 500);
            $table->string('thumbnail_url', 500)->nullable();
            $table->integer('duration')->nullable()->comment('Duration in seconds');
            $table->string('video_format', 10)->nullable();
            $table->string('resolution', 20)->nullable();
            $table->bigInteger('file_size')->nullable()->comment('Size in bytes');
            $table->bigInteger('view_count')->default(0);
            $table->bigInteger('like_count')->default(0);
            $table->bigInteger('comment_count')->default(0);
            $table->bigInteger('share_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->enum('status', ['processing', 'published', 'failed', 'removed'])->default('processing');
            $table->timestamps();
            $table->softDeletes();

            $table->index('business_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('video_hashtags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained('videos')->onDelete('cascade');
            $table->string('hashtag', 100);
            $table->timestamps();

            $table->index('hashtag');
            $table->index('video_id');
        });

        Schema::create('video_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained('videos')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['video_id', 'user_id'], 'unique_like');
            $table->index('user_id');
        });

        Schema::create('video_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained('videos')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('video_comments')->onDelete('cascade');
            $table->text('comment_text');
            $table->integer('like_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('video_id');
            $table->index('user_id');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_comments');
        Schema::dropIfExists('video_likes');
        Schema::dropIfExists('video_hashtags');
        Schema::dropIfExists('videos');
    }
};
