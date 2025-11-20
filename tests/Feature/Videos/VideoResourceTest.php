<?php

namespace Tests\Feature\Videos;

use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Videos\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VideoResourceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that video resource includes is_liked field when user is authenticated.
     */
    public function test_video_resource_includes_is_liked_for_authenticated_user(): void
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

        // User has not liked the video yet
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'uuid' => $video->uuid,
                    'is_liked' => false,
                ],
            ]);

        // Now user likes the video via API (not manually)
        $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/like");

        // Check that is_liked is now true
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'uuid' => $video->uuid,
                    'is_liked' => true,
                ],
            ]);
    }

    /**
     * Test that video feed includes is_liked for each video.
     */
    public function test_video_feed_includes_is_liked(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create(['user_id' => $businessUser->id]);

        $video1 = Video::create([
            'business_id' => $business->id,
            'title' => 'Video 1',
            'video_url' => 'https://example.com/video1.mp4',
            'status' => 'published',
            'is_public' => true,
        ]);

        $video2 = Video::create([
            'business_id' => $business->id,
            'title' => 'Video 2',
            'video_url' => 'https://example.com/video2.mp4',
            'status' => 'published',
            'is_public' => true,
        ]);

        // User likes only video1 via API
        $this->actingAsUser($user)
            ->postJson("/api/videos/{$video1->uuid}/like");

        $response = $this->actingAsUser($user)
            ->getJson('/api/videos/feed');

        $response->assertStatus(200);

        $videos = $response->json('data');

        // Find our videos in the response
        $returnedVideo1 = collect($videos)->firstWhere('uuid', $video1->uuid);
        $returnedVideo2 = collect($videos)->firstWhere('uuid', $video2->uuid);

        $this->assertNotNull($returnedVideo1);
        $this->assertNotNull($returnedVideo2);
        $this->assertTrue($returnedVideo1['is_liked']);
        $this->assertFalse($returnedVideo2['is_liked']);
    }

    /**
     * Test complete like/unlike flow with resource responses.
     */
    public function test_complete_like_unlike_flow_with_resources(): void
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

        // Step 1: Get video - should not be liked
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertJson(['data' => ['is_liked' => false]]);

        // Step 2: Like the video
        $response = $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/like");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Step 3: Get video again - should be liked
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertJson(['data' => ['is_liked' => true, 'like_count' => 1]]);

        // Step 4: Unlike the video
        $response = $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/unlike");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Step 5: Get video again - should not be liked
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertJson(['data' => ['is_liked' => false, 'like_count' => 0]]);
    }
}
