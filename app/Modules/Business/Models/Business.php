<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use App\Modules\Videos\Models\Video;
use App\Modules\Shop\Models\Product;
use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return BusinessFactory::new();
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'user_id',
        'business_name',
        'business_type',
        'slug',
        'description',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'latitude',
        'longitude',
        'phone',
        'email',
        'website',
        'cover_image',
        'logo',
        'is_verified',
        'average_rating',
        'total_reviews',
        'view_count',
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
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_verified' => 'boolean',
            'average_rating' => 'decimal:2',
            'total_reviews' => 'integer',
            'view_count' => 'integer',
        ];
    }

    /**
     * Boot function for model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($business) {
            if (empty($business->uuid)) {
                $business->uuid = (string) Str::uuid();
            }
            if (empty($business->slug)) {
                $business->slug = Str::slug($business->business_name);
            }
        });

        static::updating(function ($business) {
            if ($business->isDirty('business_name') && empty($business->slug)) {
                $business->slug = Str::slug($business->business_name);
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
     * Get the user that owns the business.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the business hours for the business.
     */
    public function hours()
    {
        return $this->hasMany(BusinessHours::class);
    }

    /**
     * Get the services offered by the business.
     */
    public function services()
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get the media gallery for the business.
     */
    public function gallery()
    {
        return $this->hasMany(MediaGallery::class);
    }

    /**
     * Get the videos posted by the business.
     */
    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    /**
     * Get the products sold by the business.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the reviews for the business.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the followers of the business.
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'business_id', 'follower_id');
    }

    /**
     * Check if business is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if business is verified.
     *
     * @return bool
     */
    public function isVerified(): bool
    {
        return $this->is_verified === true;
    }

    /**
     * Increment view count.
     */
    public function incrementViews()
    {
        $this->increment('view_count');
    }
}
