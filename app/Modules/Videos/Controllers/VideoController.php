<?php

namespace App\Modules\Videos\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Business\Models\Business;
use App\Modules\Videos\Models\Video;
use App\Modules\Videos\Models\VideoComment;
use App\Modules\Videos\Requests\AddCommentRequest;
use App\Modules\Videos\Requests\CreateVideoRequest;
use App\Modules\Videos\Requests\UpdateVideoRequest;
use App\Modules\Videos\Resources\CommentResource;
use App\Modules\Videos\Resources\VideoResource;
use App\Modules\Videos\Services\VideoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function __construct(
        private VideoService $videoService
    ) {}

    /**
     * Get video feed (TikTok-style).
     */
    public function feed(Request $request): JsonResponse
    {
        $filters = $request->only([
            'business_type',
            'hashtag',
            'cursor',
            'order_by',
        ]);

        $limit = $request->input('limit', 20);
        $videos = $this->videoService->getVideoFeed($filters, $limit);

        /** @var \App\Modules\Videos\Models\Video|null $lastVideo */
        $lastVideo = $videos->last();

        return response()->json([
            'success' => true,
            'data' => VideoResource::collection($videos),
            'cursor' => $lastVideo?->id,
        ]);
    }

    /**
     * Get trending videos.
     */
    public function trending(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $videos = $this->videoService->getTrendingVideos($limit);

        return response()->json([
            'success' => true,
            'data' => VideoResource::collection($videos),
        ]);
    }

    /**
     * Search videos.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');

        if (! $query) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required',
            ], 400);
        }

        $limit = $request->input('limit', 20);
        $videos = $this->videoService->searchVideos($query, $limit);

        return response()->json([
            'success' => true,
            'data' => VideoResource::collection($videos),
        ]);
    }

    /**
     * Get a single video by UUID.
     */
    public function show(string $uuid): JsonResponse
    {
        $video = $this->videoService->getVideoByUuid($uuid);

        return response()->json([
            'success' => true,
            'data' => new VideoResource($video),
        ]);
    }

    /**
     * Create a new video.
     */
    public function store(CreateVideoRequest $request): JsonResponse
    {
        // Verify user owns the business
        $business = Business::findOrFail($request->input('business_id'));

        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $video = $this->videoService->createVideo(
            $request->input('business_id'),
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Video created successfully',
            'data' => $video,
        ], 201);
    }

    /**
     * Update video information.
     */
    public function update(UpdateVideoRequest $request, string $uuid): JsonResponse
    {
        /** @var \App\Modules\Videos\Models\Video $video */
        $video = Video::where('uuid', $uuid)->firstOrFail();

        // Verify user owns the business
        /** @var \App\Modules\Business\Models\Business $business */
        $business = $video->business;
        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $video = $this->videoService->updateVideo($video, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Video updated successfully',
            'data' => $video,
        ]);
    }

    /**
     * Delete video.
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        /** @var \App\Modules\Videos\Models\Video $video */
        $video = Video::where('uuid', $uuid)->firstOrFail();

        // Verify user owns the business
        /** @var \App\Modules\Business\Models\Business $business */
        $business = $video->business;
        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $this->videoService->deleteVideo($video);

        return response()->json([
            'success' => true,
            'message' => 'Video deleted successfully',
        ]);
    }

    /**
     * Like a video.
     */
    public function like(Request $request, string $uuid): JsonResponse
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();

        // Check if already liked
        if ($this->videoService->isLiked($video, $request->user()->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Already liked this video',
            ], 400);
        }

        $this->videoService->likeVideo($video, $request->user()->id);

        // Refresh video to get updated like_count
        $video->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Video liked successfully',
            'data' => [
                'like_count' => $video->like_count,
                'is_liked' => true,
            ],
        ]);
    }

    /**
     * Unlike a video.
     */
    public function unlike(Request $request, string $uuid): JsonResponse
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();

        // Check if not liked
        if (! $this->videoService->isLiked($video, $request->user()->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Not liked this video',
            ], 400);
        }

        $this->videoService->unlikeVideo($video, $request->user()->id);

        // Refresh video to get updated like_count
        $video->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Video unliked successfully',
            'data' => [
                'like_count' => $video->like_count,
                'is_liked' => false,
            ],
        ]);
    }

    /**
     * Get video comments.
     */
    public function comments(string $uuid): JsonResponse
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();
        $comments = $this->videoService->getVideoComments($video);

        return response()->json([
            'success' => true,
            'data' => CommentResource::collection($comments),
        ]);
    }

    /**
     * Add a comment to video.
     */
    public function addComment(AddCommentRequest $request, string $uuid): JsonResponse
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();

        $comment = $this->videoService->addComment(
            $video,
            $request->user()->id,
            $request->input('comment_text'),
            $request->input('parent_id')
        );

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => new CommentResource($comment),
        ], 201);
    }

    /**
     * Delete a comment.
     */
    public function deleteComment(Request $request, string $uuid, int $commentId): JsonResponse
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();
        $comment = VideoComment::findOrFail($commentId);

        // Verify comment belongs to video and user owns the comment
        if ($comment->video_id !== $video->id || $comment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $this->videoService->deleteComment($comment);

        // Refresh video to get updated comment_count
        $video->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully',
            'data' => [
                'comment_count' => $video->comment_count,
            ],
        ]);
    }

    /**
     * Share a video (increment share count).
     */
    public function share(Request $request, string $uuid): JsonResponse
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();
        $this->videoService->shareVideo($video);

        return response()->json([
            'success' => true,
            'message' => 'Share count incremented',
        ]);
    }

    /**
     * Get videos by business UUID.
     */
    public function businessVideos(string $businessUuid): JsonResponse
    {
        $business = Business::where('uuid', $businessUuid)->firstOrFail();
        $videos = $this->videoService->getBusinessVideos($business->id);

        return response()->json([
            'success' => true,
            'data' => VideoResource::collection($videos),
        ]);
    }
}
