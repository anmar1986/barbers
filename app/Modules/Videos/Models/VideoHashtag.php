<?php

namespace App\Modules\Videos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoHashtag extends Model
{
    protected $fillable = ['video_id', 'hashtag'];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }
}
