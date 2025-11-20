<?php

namespace App\Modules\Videos\Models;

use Illuminate\Database\Eloquent\Model;

class VideoHashtag extends Model
{
    protected $fillable = ['video_id', 'hashtag'];

    public function video()
    {
        return $this->belongsTo(Video::class);
    }
}
