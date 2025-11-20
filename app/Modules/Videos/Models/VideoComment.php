<?php

namespace App\Modules\Videos\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VideoComment extends Model
{
    use SoftDeletes;

    protected $fillable = ['video_id', 'user_id', 'parent_id', 'comment_text', 'like_count'];

    protected function casts(): array
    {
        return [
            'like_count' => 'integer',
        ];
    }

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(VideoComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(VideoComment::class, 'parent_id');
    }
}
