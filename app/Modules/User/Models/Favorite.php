<?php

namespace App\Modules\User\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'favoritable_type',
        'favoritable_id',
    ];

    /**
     * Get the user who favorited.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the favoritable model (polymorphic).
     */
    public function favoritable()
    {
        return $this->morphTo();
    }

    /**
     * Scope to filter by favoritable type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('favoritable_type', $type);
    }

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
