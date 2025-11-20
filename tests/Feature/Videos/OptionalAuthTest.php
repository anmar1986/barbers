<?php

namespace Tests\Feature\Videos;

use Tests\TestCase;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Videos\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OptionalAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that unauthenticated users can view video feed
     */
    public function test_unauthenticated_users_can_view_feed(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create(['user_id' => $businessUser->id]);

        $video = Video::create([
            'business_id' => $business->id,
            'title' => 'Test Video',
            'video_url' => 'https://example.com/video.mp4',
            'status' => 'published',
            'is_public' => true,
        ]);

        $response = $this->getJson('/api/videos/feed');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $videos = $response->json('data');
        $this->assertNotEmpty($videos);
        $this->assertArrayHasKey('is_liked', $videos[0]);
        $this->assertFalse($videos[0]['is_liked']); // Not authenticated, so always false
    }

    /**
     * Test that authenticated users get is_liked status in feed
     */
    public function test_authenticated_users_get_is_liked_in_feed(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create(['user_id' => $businessUser->id]);

        $video = Video::create([
            'business_id' => $business->id,
            'title' => 'Test Video',
            'video_url' => 'https://example.com/video.mp4',
            'status' => 'published',
            'is_public' => true,
        ]);

        // Like the video
        $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/like");

        // Fetch feed as authenticated user
        $response = $this->actingAsUser($user)
            ->getJson('/api/videos/feed');

        $response->assertStatus(200);

        $videos = $response->json('data');
        $likedVideo = collect($videos)->firstWhere('uuid', $video->uuid);

        $this->assertNotNull($likedVideo);
        $this->assertTrue($likedVideo['is_liked']); // Should be true for authenticated user
        $this->assertEquals(1, $likedVideo['like_count']);
    }

    /**
     * Test that unauthenticated users can view video detail
     */
    public function test_unauthenticated_users_can_view_video_detail(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create(['user_id' => $businessUser->id]);

        $video = Video::create([
            'business_id' => $business->id,
            'title' => 'Test Video',
            'video_url' => 'https://example.com/video.mp4',
            'status' => 'published',
            'is_public' => true,
        ]);

        $response = $this->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'uuid' => $video->uuid,
                    'title' => 'Test Video',
                    'is_liked' => false,
                ],
            ]);
    }

    /**
     * Test that authenticated users get correct is_liked in video detail
     */
    public function test_authenticated_users_get_correct_is_liked_in_video_detail(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create(['user_id' => $businessUser->id]);

        $video = Video::create([
            'business_id' => $business->id,
            'title' => 'Test Video',
            'video_url' => 'https://example.com/video.mp4',
            'status' => 'published',
            'is_public' => true,
        ]);

        // Like the video
        $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/like");

        // Fetch video detail as authenticated user
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'uuid' => $video->uuid,
                    'is_liked' => true,
                    'like_count' => 1,
                ],
            ]);
    }
}
