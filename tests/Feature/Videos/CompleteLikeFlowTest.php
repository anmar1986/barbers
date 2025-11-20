<?php

namespace Tests\Feature\Videos;

use Tests\TestCase;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Videos\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CompleteLikeFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the complete like flow: like, refresh, unlike
     */
    public function test_complete_like_flow_with_refresh(): void
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

        // STEP 1: Initial state - not liked
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'like_count' => 0,
                    'is_liked' => false,
                ],
            ]);

        // STEP 2: Like the video
        $response = $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/like");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'like_count' => 1,
                    'is_liked' => true,
                ],
            ]);

        // STEP 3: Refresh (fetch video again) - should still be liked
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'like_count' => 1,
                    'is_liked' => true, // Heart should be red
                ],
            ]);

        // STEP 4: Unlike the video
        $response = $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/unlike");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'like_count' => 0,
                    'is_liked' => false,
                ],
            ]);

        // STEP 5: Refresh again - should be unliked
        $response = $this->actingAsUser($user)
            ->getJson("/api/videos/{$video->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'like_count' => 0,
                    'is_liked' => false, // Heart should be gray
                ],
            ]);
    }

    /**
     * Test like state in video feed
     */
    public function test_video_feed_shows_correct_like_state(): void
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

        // Check feed shows liked state
        $response = $this->actingAsUser($user)
            ->getJson('/api/videos/feed');

        $response->assertStatus(200);

        $videos = $response->json('data');
        $likedVideo = collect($videos)->firstWhere('uuid', $video->uuid);

        $this->assertNotNull($likedVideo);
        $this->assertTrue($likedVideo['is_liked']);
        $this->assertEquals(1, $likedVideo['like_count']);

        // Unlike the video
        $this->actingAsUser($user)
            ->postJson("/api/videos/{$video->uuid}/unlike");

        // Check feed shows unliked state
        $response = $this->actingAsUser($user)
            ->getJson('/api/videos/feed');

        $response->assertStatus(200);

        $videos = $response->json('data');
        $unlikedVideo = collect($videos)->firstWhere('uuid', $video->uuid);

        $this->assertNotNull($unlikedVideo);
        $this->assertFalse($unlikedVideo['is_liked']);
        $this->assertEquals(0, $unlikedVideo['like_count']);
    }
}
