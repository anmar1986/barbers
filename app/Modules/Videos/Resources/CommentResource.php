<?php

namespace App\Modules\Videos\Resources;

use App\Modules\Videos\Models\VideoComment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VideoComment
 */
class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'video_id' => $this->video_id,
            'user_id' => $this->user_id,
            'parent_id' => $this->parent_id,
            'comment_text' => $this->comment_text,
            'like_count' => $this->like_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Add whether the current user can delete this comment
            'can_delete' => $user ? $this->user_id === $user->id : false,

            // Include relationships if loaded
            'user' => $this->whenLoaded('user'),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
