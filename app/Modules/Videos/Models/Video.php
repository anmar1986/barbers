<?php

namespace App\Modules\Videos\Models;

use App\Models\User;
use App\Modules\Business\Models\Business;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Video extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'business_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'duration',
        'video_format',
        'resolution',
        'file_size',
        'view_count',
        'like_count',
        'comment_count',
        'share_count',
        'is_public',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'file_size' => 'integer',
            'view_count' => 'integer',
            'like_count' => 'integer',
            'comment_count' => 'integer',
            'share_count' => 'integer',
            'is_public' => 'boolean',
        ];
    }

    /**
     * Boot function for model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($video) {
            if (empty($video->uuid)) {
                $video->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    /**
     * Get the business that posted the video.
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get the hashtags for the video.
     */
    public function hashtags()
    {
        return $this->hasMany(VideoHashtag::class);
    }

    /**
     * Get the likes for the video.
     */
    public function likes()
    {
        return $this->hasMany(VideoLike::class);
    }

    /**
     * Get the comments for the video.
     */
    public function comments()
    {
        return $this->hasMany(VideoComment::class)->whereNull('parent_id');
    }

    /**
     * Get all comments including replies.
     */
    public function allComments()
    {
        return $this->hasMany(VideoComment::class);
    }

    /**
     * Check if user has liked this video.
     */
    public function isLikedBy(int $userId): bool
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    /**
     * Increment view count.
     */
    public function incrementViews()
    {
        $this->increment('view_count');
    }

    /**
     * Check if video is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->is_public;
    }

    /**
     * Check if video is still processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }
}
