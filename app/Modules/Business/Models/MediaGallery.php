<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;

class MediaGallery extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_id',
        'media_type',
        'media_url',
        'thumbnail_url',
        'caption',
        'display_order',
        'is_featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * Get the business that owns the media.
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Check if media is an image.
     *
     * @return bool
     */
    public function isImage(): bool
    {
        return $this->media_type === 'image';
    }

    /**
     * Check if media is a video.
     *
     * @return bool
     */
    public function isVideo(): bool
    {
        return $this->media_type === 'video';
    }
}
