<?php

namespace App\Modules\Videos\Repositories;

use App\Modules\Videos\Models\Video;
use App\Modules\Videos\Models\VideoComment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class VideoRepository
{
    /**
     * Get video feed with cursor-based pagination.
     */
    public function getFeed(array $filters = [], int $limit = 20): Collection
    {
        $query = Video::query()
            ->with([
                'business:id,uuid,business_name,business_type,logo,is_verified',
                'hashtags',
            ])
            ->where('status', 'published');

        // Filter by business type
        if (! empty($filters['business_type'])) {
            $query->whereHas('business', function ($q) use ($filters) {
                $q->where('business_type', $filters['business_type']);
            });
        }

        // Filter by hashtag
        if (! empty($filters['hashtag'])) {
            $query->whereHas('hashtags', function ($q) use ($filters) {
                $q->where('hashtag', $filters['hashtag']);
            });
        }

        // Cursor-based pagination
        if (! empty($filters['cursor'])) {
            $query->where('id', '<', $filters['cursor']);
        }

        // Order by
        $orderBy = $filters['order_by'] ?? 'created_at';
        $allowedOrders = ['created_at', 'view_count', 'like_count'];

        if (in_array($orderBy, $allowedOrders)) {
            $query->orderBy($orderBy, 'desc');
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get trending videos.
     */
    public function getTrending(int $limit = 20): Collection
    {
        return Video::query()
            ->with([
                'business:id,uuid,business_name,business_type,logo,is_verified',
                'hashtags',
            ])
            ->where('status', 'published')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByRaw('(like_count * 2 + comment_count + share_count) DESC')
            ->orderBy('view_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search videos by title/description.
     */
    public function search(string $query, int $limit = 20): Collection
    {
        return Video::query()
            ->with([
                'business:id,uuid,business_name,business_type,logo,is_verified',
                'hashtags',
            ])
            ->where('status', 'published')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', '%'.$query.'%')
                    ->orWhere('description', 'like', '%'.$query.'%')
                    ->orWhereHas('hashtags', function ($hq) use ($query) {
                        $hq->where('hashtag', 'like', '%'.$query.'%');
                    });
            })
            ->orderBy('view_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Find video by UUID.
     */
    public function findByUuid(string $uuid): ?Video
    {
        return Video::with([
            'business:id,uuid,business_name,business_type,logo,is_verified,follower_count',
            'business.user:id,first_name,last_name',
            'hashtags',
            'comments' => function ($q) {
                $q->with('user:id,first_name,last_name,profile_picture')
                    ->whereNull('parent_id')
                    ->orderBy('created_at', 'desc')
                    ->limit(20);
            },
        ])->where('uuid', $uuid)->first();
    }

    /**
     * Get videos by business.
     */
    public function getByBusiness(int $businessId, int $perPage = 20): LengthAwarePaginator
    {
        return Video::query()
            ->with(['hashtags'])
            ->where('business_id', $businessId)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get video comments with pagination.
     */
    public function getComments(Video $video, int $perPage = 20): LengthAwarePaginator
    {
        return VideoComment::query()
            ->with([
                'user:id,first_name,last_name,profile_picture',
                'replies' => function ($q) {
                    $q->with('user:id,first_name,last_name,profile_picture')
                        ->orderBy('created_at', 'asc');
                },
            ])
            ->where('video_id', $video->id)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get videos by hashtag.
     */
    public function getByHashtag(string $hashtag, int $limit = 20): Collection
    {
        return Video::query()
            ->with([
                'business:id,uuid,business_name,business_type,logo,is_verified',
                'hashtags',
            ])
            ->where('status', 'published')
            ->whereHas('hashtags', function ($q) use ($hashtag) {
                $q->where('hashtag', $hashtag);
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get popular hashtags.
     */
    public function getPopularHashtags(int $limit = 10): array
    {
        return DB::table('video_hashtags')
            ->select('hashtag', DB::raw('COUNT(*) as count'))
            ->groupBy('hashtag')
            ->orderBy('count', 'desc')
            ->limit($limit)
            ->pluck('count', 'hashtag')
            ->toArray();
    }

    /**
     * Increment view count.
     */
    public function incrementViews(Video $video): void
    {
        $video->increment('view_count');
    }

    /**
     * Increment share count.
     */
    public function incrementShares(Video $video): void
    {
        $video->increment('share_count');
    }
}
