<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessHours extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'is_closed' => 'boolean',
        ];
    }

    /**
     * Get the business that owns the hours.
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get day name from day_of_week number.
     */
    public function getDayNameAttribute(): string
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return $days[$this->day_of_week] ?? '';
    }
}
