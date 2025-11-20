<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Service extends Model
{
    /**
     * Boot function to auto-generate UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_id',
        'name',
        'description',
        'price',
        'duration',
        'duration_minutes',
        'is_active',
        'is_available',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_minutes' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    /**
     * Attributes to append to model's array/JSON form
     */
    protected $appends = ['duration', 'is_active'];

    /**
     * Get the business that offers this service.
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Accessor for 'duration' (alias for duration_minutes)
     */
    public function getDurationAttribute()
    {
        return $this->duration_minutes;
    }

    /**
     * Mutator for 'duration' (alias for duration_minutes)
     */
    public function setDurationAttribute($value)
    {
        $this->attributes['duration_minutes'] = $value;
    }

    /**
     * Accessor for 'is_active' (alias for is_available)
     */
    public function getIsActiveAttribute()
    {
        return $this->is_available;
    }

    /**
     * Mutator for 'is_active' (alias for is_available)
     */
    public function setIsActiveAttribute($value)
    {
        $this->attributes['is_available'] = $value;
    }

    /**
     * Get formatted price.
     *
     * @return string
     */
    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format($this->price, 2);
    }

    /**
     * Get duration in hours and minutes.
     *
     * @return string
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration_minutes) {
            return 'N/A';
        }

        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }
}
