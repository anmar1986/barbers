<?php

namespace App\Modules\Videos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class VideoLike extends Model
{
    public $timestamps = true;

    protected $fillable = ['video_id', 'user_id'];

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
