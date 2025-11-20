<?php

namespace Tests\Feature\Videos;

use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Videos\Models\Video;
use App\Modules\Videos\Models\VideoComment;
use App\Modules\Videos\Models\VideoLike;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VideoLikeCommentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Business $business;

    private Video $video;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a business user and business
        $businessUser = $this->createBusinessUser();
        $this->business = Business::factory()->create(['user_id' => $businessUser->id]);

        // Create a video
        $this->video = Video::create([
            'business_id' => $this->business->id,
            'title' => 'Test Video',
            'description' => 'Test Description',
            'video_url' => 'https://example.com/video.mp4',
            'thumbnail_url' => 'https://example.com/thumb.jpg',
            'duration' => 120,
            'status' => 'published',
            'is_public' => true,
        ]);

        // Create a regular user for testing
        $this->user = $this->createUser();
    }

    /**
     * Test user can like a video.
     */
    public function test_user_can_like_video(): void
    {
        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/like");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Video liked successfully',
            ]);

        $this->assertDatabaseHas('video_likes', [
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
        ]);

        // Check like count incremented
        $this->video->refresh();
        $this->assertEquals(1, $this->video->like_count);
    }

    /**
     * Test user cannot like video twice.
     */
    public function test_user_cannot_like_video_twice(): void
    {
        // First like
        VideoLike::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
        ]);

        // Try to like again
        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/like");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Already liked this video',
            ]);
    }

    /**
     * Test user can unlike a video.
     */
    public function test_user_can_unlike_video(): void
    {
        // First like the video
        VideoLike::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
        ]);
        $this->video->increment('like_count');

        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/unlike");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Video unliked successfully',
            ]);

        $this->assertDatabaseMissing('video_likes', [
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
        ]);

        // Check like count decremented
        $this->video->refresh();
        $this->assertEquals(0, $this->video->like_count);
    }

    /**
     * Test user cannot unlike video that wasn't liked.
     */
    public function test_user_cannot_unlike_not_liked_video(): void
    {
        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/unlike");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Not liked this video',
            ]);
    }

    /**
     * Test unauthenticated user cannot like video.
     */
    public function test_unauthenticated_user_cannot_like_video(): void
    {
        $response = $this->postJson("/api/videos/{$this->video->uuid}/like");

        $response->assertStatus(401);
    }

    /**
     * Test like requires authentication.
     */
    public function test_unlike_requires_authentication(): void
    {
        $response = $this->postJson("/api/videos/{$this->video->uuid}/unlike");

        $response->assertStatus(401);
    }

    /**
     * Test user can add comment to video.
     */
    public function test_user_can_add_comment(): void
    {
        $commentData = [
            'comment_text' => 'Great video! Love the haircut techniques.',
        ];

        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/comments", $commentData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Comment added successfully',
                'data' => [
                    'comment_text' => 'Great video! Love the haircut techniques.',
                ],
            ]);

        $this->assertDatabaseHas('video_comments', [
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
            'comment_text' => 'Great video! Love the haircut techniques.',
        ]);

        // Check comment count incremented
        $this->video->refresh();
        $this->assertEquals(1, $this->video->comment_count);
    }

    /**
     * Test user can add reply to comment.
     */
    public function test_user_can_reply_to_comment(): void
    {
        // Create parent comment
        $parentComment = VideoComment::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
            'comment_text' => 'Original comment',
        ]);

        $replyData = [
            'comment_text' => 'Thanks for your comment!',
            'parent_id' => $parentComment->id,
        ];

        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/comments", $replyData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Comment added successfully',
                'data' => [
                    'comment_text' => 'Thanks for your comment!',
                ],
            ]);

        $this->assertDatabaseHas('video_comments', [
            'video_id' => $this->video->id,
            'parent_id' => $parentComment->id,
            'comment_text' => 'Thanks for your comment!',
        ]);
    }

    /**
     * Test comment validation - comment_text required.
     */
    public function test_comment_requires_text(): void
    {
        $response = $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/comments", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['comment_text']);
    }

    /**
     * Test user can retrieve video comments.
     */
    public function test_can_retrieve_video_comments(): void
    {
        // Create multiple comments
        VideoComment::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
            'comment_text' => 'First comment',
        ]);

        VideoComment::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
            'comment_text' => 'Second comment',
        ]);

        $response = $this->getJson("/api/videos/{$this->video->uuid}/comments");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test user can delete their own comment.
     */
    public function test_user_can_delete_own_comment(): void
    {
        $comment = VideoComment::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
            'comment_text' => 'Comment to delete',
        ]);

        $response = $this->actingAsUser($this->user)
            ->deleteJson("/api/videos/{$this->video->uuid}/comments/{$comment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Comment deleted successfully',
            ]);

        $this->assertSoftDeleted('video_comments', [
            'id' => $comment->id,
        ]);
    }

    /**
     * Test user cannot delete another user's comment.
     */
    public function test_user_cannot_delete_others_comment(): void
    {
        $otherUser = $this->createUser();

        $comment = VideoComment::create([
            'video_id' => $this->video->id,
            'user_id' => $otherUser->id,
            'comment_text' => 'Other user comment',
        ]);

        $response = $this->actingAsUser($this->user)
            ->deleteJson("/api/videos/{$this->video->uuid}/comments/{$comment->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthorized',
            ]);
    }

    /**
     * Test unauthenticated user cannot add comment.
     */
    public function test_unauthenticated_user_cannot_add_comment(): void
    {
        $response = $this->postJson("/api/videos/{$this->video->uuid}/comments", [
            'comment_text' => 'Trying to comment',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test public can view comments without authentication.
     */
    public function test_public_can_view_comments(): void
    {
        VideoComment::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
            'comment_text' => 'Public comment',
        ]);

        $response = $this->getJson("/api/videos/{$this->video->uuid}/comments");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    /**
     * Test like and unlike toggle correctly.
     */
    public function test_like_unlike_toggle(): void
    {
        // Like
        $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/like")
            ->assertStatus(200);

        $this->video->refresh();
        $this->assertEquals(1, $this->video->like_count);

        // Unlike
        $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/unlike")
            ->assertStatus(200);

        $this->video->refresh();
        $this->assertEquals(0, $this->video->like_count);
    }

    /**
     * Test multiple users can like same video.
     */
    public function test_multiple_users_can_like_video(): void
    {
        $user2 = $this->createUser(['email' => 'user2@example.com']);
        $user3 = $this->createUser(['email' => 'user3@example.com']);

        // Create likes directly through the model for this test
        VideoLike::create([
            'video_id' => $this->video->id,
            'user_id' => $this->user->id,
        ]);
        $this->video->increment('like_count');

        VideoLike::create([
            'video_id' => $this->video->id,
            'user_id' => $user2->id,
        ]);
        $this->video->increment('like_count');

        VideoLike::create([
            'video_id' => $this->video->id,
            'user_id' => $user3->id,
        ]);
        $this->video->increment('like_count');

        // Verify counts
        $this->video->refresh();
        $this->assertEquals(3, $this->video->like_count);
        $this->assertEquals(3, VideoLike::where('video_id', $this->video->id)->count());
    }

    /**
     * Test comment count increments correctly.
     */
    public function test_comment_count_increments(): void
    {
        $this->assertEquals(0, $this->video->comment_count);

        // Add first comment
        $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/comments", [
                'comment_text' => 'First',
            ]);

        $this->video->refresh();
        $this->assertEquals(1, $this->video->comment_count);

        // Add second comment
        $this->actingAsUser($this->user)
            ->postJson("/api/videos/{$this->video->uuid}/comments", [
                'comment_text' => 'Second',
            ]);

        $this->video->refresh();
        $this->assertEquals(2, $this->video->comment_count);
    }
}
