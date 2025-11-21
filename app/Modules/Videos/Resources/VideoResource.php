<?php

namespace App\Modules\Videos\Resources;

use App\Modules\Videos\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Video
 */
class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        // Check if the current user has liked this video
        $isLiked = false;
        if ($user) {
            $isLiked = $this->isLikedBy($user->id);
        }

        // Convert relative URLs to full URLs
        $videoUrl = $this->video_url;
        if ($videoUrl && ! str_starts_with($videoUrl, 'http')) {
            $videoUrl = url($videoUrl);
        }

        $thumbnailUrl = $this->thumbnail_url;
        if ($thumbnailUrl && ! str_starts_with($thumbnailUrl, 'http')) {
            $thumbnailUrl = url($thumbnailUrl);
        }

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'business_id' => $this->business_id,
            'title' => $this->title,
            'description' => $this->description,
            'video_url' => $videoUrl,
            'thumbnail_url' => $thumbnailUrl,
            'duration' => $this->duration,
            'video_format' => $this->video_format,
            'resolution' => $this->resolution,
            'file_size' => $this->file_size,
            'view_count' => $this->view_count,
            'like_count' => $this->like_count,
            'comment_count' => $this->comment_count,
            'share_count' => $this->share_count,
            'is_published' => $this->isPublished(),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Add whether the current user has liked this video
            'is_liked' => $isLiked,

            // Include relationships if loaded
            'business' => $this->whenLoaded('business'),
            'hashtags' => $this->whenLoaded('hashtags'),
            'comments' => $this->whenLoaded('comments'),
        ];
    }
}
