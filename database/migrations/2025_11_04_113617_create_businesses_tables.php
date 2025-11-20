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
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('business_name');
            $table->enum('business_type', ['barber', 'nail_studio', 'hair_salon', 'massage']);
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->string('country', 100)->default('USA');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->enum('status', ['pending', 'active', 'suspended', 'closed'])->default('active');
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('follower_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('business_type');
            $table->index('slug');
            $table->index('is_active');
            $table->index('city');

            // Add fulltext index only for MySQL (not SQLite for testing)
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $table->fullText(['business_name', 'description']);
            }
        });

        Schema::create('business_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->tinyInteger('day_of_week')->comment('0=Sunday, 6=Saturday');
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->unique(['business_id', 'day_of_week'], 'unique_business_day');
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('duration_minutes')->nullable()->comment('Duration in minutes');
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index('business_id');
        });

        Schema::create('media_gallery', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->enum('media_type', ['image', 'video']);
            $table->string('media_url', 500);
            $table->string('thumbnail_url', 500)->nullable();
            $table->text('caption')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index('business_id');
            $table->index('media_type');
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('rating')->comment('1-5 stars');
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            $table->text('review_text')->nullable(); // Deprecated, use 'comment'
            $table->timestamps();
            $table->softDeletes();

            $table->index('business_id');
            $table->index('user_id');
            $table->index('rating');
        });

        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['follower_id', 'business_id'], 'unique_follow');
            $table->index('follower_id');
            $table->index('business_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('media_gallery');
        Schema::dropIfExists('services');
        Schema::dropIfExists('business_hours');
        Schema::dropIfExists('businesses');
    }
};
