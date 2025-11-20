<?php

namespace App\Modules\Videos\Services;

use App\Jobs\ProcessVideo;
use App\Modules\Videos\Models\Video;
use App\Modules\Videos\Models\VideoComment;
use App\Modules\Videos\Models\VideoHashtag;
use App\Modules\Videos\Models\VideoLike;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VideoService
{
    /**
     * Get video feed (TikTok-style infinite scroll).
     */
    public function getVideoFeed(array $filters = [], int $limit = 20): Collection
    {
        $query = Video::with(['business.user', 'hashtags'])
            ->where('status', 'published')
            ->where('is_public', true);

        // Filter by business type
        if (isset($filters['business_type'])) {
            $query->whereHas('business', function ($q) use ($filters) {
                $q->where('business_type', $filters['business_type']);
            });
        }

        // Filter by hashtag
        if (isset($filters['hashtag'])) {
            $query->whereHas('hashtags', function ($q) use ($filters) {
                $q->where('hashtag', $filters['hashtag']);
            });
        }

        // Cursor-based pagination
        if (isset($filters['cursor'])) {
            $query->where('id', '<', $filters['cursor']);
        }

        // Order by - default is newest first, can be changed to trending
        $orderBy = $filters['order_by'] ?? 'created_at';
        $query->orderBy($orderBy, 'desc');

        return $query->limit($limit)->get();
    }

    /**
     * Get a single video by UUID.
     */
    public function getVideoByUuid(string $uuid): Video
    {
        $video = Video::with([
            'business.user',
            'hashtags',
            'comments.user',
        ])->where('uuid', $uuid)->firstOrFail();

        // Increment view count
        $video->incrementViews();

        return $video;
    }

    /**
     * Create a new video.
     */
    public function createVideo(int $businessId, array $data): Video
    {
        return DB::transaction(function () use ($businessId, $data) {
            $video = Video::create([
                'business_id' => $businessId,
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'video_url' => $data['video_url'],
                'thumbnail_url' => $data['thumbnail_url'] ?? null,
                'duration' => $data['duration'] ?? null,
                'is_public' => $data['is_public'] ?? true,
                'status' => $data['status'] ?? 'published', // Set to published immediately for development
            ]);

            // Add hashtags if provided
            if (isset($data['hashtags']) && is_array($data['hashtags'])) {
                foreach ($data['hashtags'] as $hashtag) {
                    VideoHashtag::create([
                        'video_id' => $video->id,
                        'hashtag' => $hashtag,
                    ]);
                }
            }

            // Skip video processing for development (no FFMpeg installed)
            // In production, uncomment this line to enable video processing:
            // ProcessVideo::dispatch($video->id);

            return $video->load('hashtags');
        });
    }

    /**
     * Update video information.
     */
    public function updateVideo(Video $video, array $data): Video
    {
        return DB::transaction(function () use ($video, $data) {
            $video->update([
                'title' => $data['title'] ?? $video->title,
                'description' => $data['description'] ?? $video->description,
                'thumbnail_url' => $data['thumbnail_url'] ?? $video->thumbnail_url,
                'is_public' => $data['is_public'] ?? $video->is_public,
                'status' => $data['status'] ?? $video->status,
            ]);

            // Update hashtags if provided
            if (isset($data['hashtags']) && is_array($data['hashtags'])) {
                // Delete existing hashtags
                $video->hashtags()->delete();

                // Create new hashtags
                foreach ($data['hashtags'] as $hashtag) {
                    VideoHashtag::create([
                        'video_id' => $video->id,
                        'hashtag' => $hashtag,
                    ]);
                }
            }

            return $video->fresh(['hashtags']);
        });
    }

    /**
     * Delete video (soft delete).
     */
    public function deleteVideo(Video $video): bool
    {
        return $video->delete();
    }

    /**
     * Like a video.
     */
    public function likeVideo(Video $video, int $userId): VideoLike
    {
        $like = VideoLike::create([
            'video_id' => $video->id,
            'user_id' => $userId,
        ]);

        Video::where('id', $video->id)->increment('like_count');

        return $like;
    }

    /**
     * Unlike a video.
     */
    public function unlikeVideo(Video $video, int $userId): void
    {
        VideoLike::where('video_id', $video->id)
            ->where('user_id', $userId)
            ->delete();

        Video::where('id', $video->id)->decrement('like_count');
    }

    /**
     * Check if user has liked a video.
     */
    public function isLiked(Video $video, int $userId): bool
    {
        return VideoLike::where('video_id', $video->id)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Add a comment to video.
     */
    public function addComment(Video $video, int $userId, string $commentText, ?int $parentId = null): VideoComment
    {
        $comment = VideoComment::create([
            'video_id' => $video->id,
            'user_id' => $userId,
            'comment_text' => $commentText,
            'parent_id' => $parentId,
        ]);

        Video::where('id', $video->id)->increment('comment_count');

        return $comment->load('user');
    }

    /**
     * Get video comments.
     */
    public function getVideoComments(Video $video): Collection
    {
        return $video->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id') // Only top-level comments
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Delete a comment.
     */
    public function deleteComment(VideoComment $comment): bool
    {
        $videoId = $comment->video_id;
        $deleted = $comment->delete();

        if ($deleted) {
            Video::where('id', $videoId)->decrement('comment_count');
        }

        return $deleted;
    }

    /**
     * Increment share count.
     */
    public function shareVideo(Video $video): void
    {
        Video::where('id', $video->id)->increment('share_count');
    }

    /**
     * Get videos by business.
     */
    public function getBusinessVideos(int $businessId): Collection
    {
        return Video::with(['hashtags'])
            ->where('business_id', $businessId)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get trending videos (most viewed/liked in last 7 days).
     */
    public function getTrendingVideos(int $limit = 20): Collection
    {
        return Video::with(['business.user', 'hashtags'])
            ->where('status', 'published')
            ->where('is_public', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByRaw('(view_count * 0.3) + (like_count * 0.5) + (comment_count * 0.2) DESC')
            ->limit($limit)
            ->get();
    }

    /**
     * Search videos by title, description, or hashtag.
     */
    public function searchVideos(string $query, int $limit = 20): Collection
    {
        return Video::with(['business.user', 'hashtags'])
            ->where('status', 'published')
            ->where('is_public', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhereHas('hashtags', function ($hq) use ($query) {
                        $hq->where('hashtag', 'like', "%{$query}%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
