<?php

namespace Tests\Feature\Business;

use App\Models\User;
use App\Modules\Business\Models\Business;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test listing all businesses.
     */
    public function test_can_list_all_businesses(): void
    {
        $businessUser = $this->createBusinessUser();

        // Create multiple businesses
        Business::factory()->count(5)->create(['user_id' => $businessUser->id]);

        $response = $this->getJson('/api/businesses');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'uuid',
                            'business_name',
                            'business_type',
                            'slug',
                            'description',
                            'address',
                            'phone',
                            'is_verified',
                            'average_rating',
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Test listing businesses with barber filter.
     */
    public function test_can_filter_businesses_by_type_barber(): void
    {
        $businessUser = $this->createBusinessUser();

        Business::factory()->count(3)->create([
            'user_id' => $businessUser->id,
            'business_type' => 'barber',
        ]);

        Business::factory()->count(2)->create([
            'user_id' => $businessUser->id,
            'business_type' => 'nail_studio',
        ]);

        $response = $this->getJson('/api/businesses?business_type=barber');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json('data.data');
        $this->assertCount(3, $data);

        foreach ($data as $business) {
            $this->assertEquals('barber', $business['business_type']);
        }
    }

    /**
     * Test listing businesses with beauty filter.
     */
    public function test_can_filter_businesses_by_type_beauty(): void
    {
        $businessUser = $this->createBusinessUser();

        Business::factory()->count(2)->create([
            'user_id' => $businessUser->id,
            'business_type' => 'hair_salon',
        ]);

        Business::factory()->count(3)->create([
            'user_id' => $businessUser->id,
            'business_type' => 'nail_studio',
        ]);

        $response = $this->getJson('/api/businesses?business_type=hair_salon');

        $response->assertStatus(200);

        $data = $response->json('data.data');
        $this->assertCount(2, $data);
    }

    /**
     * Test viewing a single business.
     */
    public function test_can_view_single_business(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
            'business_name' => 'Elite Barber Shop',
            'business_type' => 'barber',
        ]);

        $response = $this->getJson("/api/businesses/{$business->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'uuid' => $business->uuid,
                    'business_name' => 'Elite Barber Shop',
                    'business_type' => 'barber',
                ],
            ]);
    }

    /**
     * Test viewing non-existent business returns 404.
     */
    public function test_viewing_non_existent_business_returns_404(): void
    {
        $response = $this->getJson('/api/businesses/non-existent-uuid');

        $response->assertStatus(404);
    }

    /**
     * Test business user can create a business.
     */
    public function test_business_user_can_create_business(): void
    {
        $businessUser = $this->createBusinessUser();

        $businessData = [
            'business_name' => 'My Barber Shop',
            'business_type' => 'barber',
            'description' => 'The best barber shop in town',
            'address' => '123 Main St',
            'city' => 'New York',
            'state' => 'NY',
            'zip_code' => '10001',
            'country' => 'USA',
            'phone' => '555-1234',
            'email' => 'info@mybarbershop.com',
        ];

        $response = $this->actingAsUser($businessUser)
            ->postJson('/api/businesses', $businessData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Business created successfully',
                'data' => [
                    'business_name' => 'My Barber Shop',
                    'business_type' => 'barber',
                ],
            ]);

        $this->assertDatabaseHas('businesses', [
            'business_name' => 'My Barber Shop',
            'business_type' => 'barber',
            'user_id' => $businessUser->id,
        ]);
    }

    /**
     * Test normal user cannot create business.
     */
    public function test_normal_user_cannot_create_business(): void
    {
        $normalUser = $this->createUser(['user_type' => 'normal']);

        $businessData = [
            'business_name' => 'My Barber Shop',
            'business_type' => 'barber',
            'description' => 'The best barber shop in town',
        ];

        $response = $this->actingAsUser($normalUser)
            ->postJson('/api/businesses', $businessData);

        $response->assertStatus(403);
    }

    /**
     * Test creating business validation - business name required.
     */
    public function test_creating_business_requires_business_name(): void
    {
        $businessUser = $this->createBusinessUser();

        $businessData = [
            'business_type' => 'barber',
            'description' => 'Description',
        ];

        $response = $this->actingAsUser($businessUser)
            ->postJson('/api/businesses', $businessData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['business_name']);
    }

    /**
     * Test creating business validation - business type required.
     */
    public function test_creating_business_requires_business_type(): void
    {
        $businessUser = $this->createBusinessUser();

        $businessData = [
            'business_name' => 'My Barber Shop',
            'description' => 'Description',
        ];

        $response = $this->actingAsUser($businessUser)
            ->postJson('/api/businesses', $businessData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['business_type']);
    }

    /**
     * Test business owner can update their business.
     */
    public function test_business_owner_can_update_business(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
            'business_name' => 'Old Name',
        ]);

        $updateData = [
            'business_name' => 'New Name',
            'description' => 'Updated description',
        ];

        $response = $this->actingAsUser($businessUser)
            ->putJson("/api/businesses/{$business->uuid}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Business updated successfully',
                'data' => [
                    'business_name' => 'New Name',
                ],
            ]);

        $this->assertDatabaseHas('businesses', [
            'uuid' => $business->uuid,
            'business_name' => 'New Name',
        ]);
    }

    /**
     * Test non-owner cannot update business.
     */
    public function test_non_owner_cannot_update_business(): void
    {
        $businessUser1 = $this->createBusinessUser();
        $businessUser2 = $this->createBusinessUser();

        $business = Business::factory()->create([
            'user_id' => $businessUser1->id,
        ]);

        $updateData = [
            'business_name' => 'Hacked Name',
        ];

        $response = $this->actingAsUser($businessUser2)
            ->putJson("/api/businesses/{$business->uuid}", $updateData);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthorized',
            ]);
    }

    /**
     * Test business owner can delete their business.
     */
    public function test_business_owner_can_delete_business(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        $response = $this->actingAsUser($businessUser)
            ->deleteJson("/api/businesses/{$business->uuid}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Business deleted successfully',
            ]);

        $this->assertSoftDeleted('businesses', [
            'uuid' => $business->uuid,
        ]);
    }

    /**
     * Test non-owner cannot delete business.
     */
    public function test_non_owner_cannot_delete_business(): void
    {
        $businessUser1 = $this->createBusinessUser();
        $businessUser2 = $this->createBusinessUser();

        $business = Business::factory()->create([
            'user_id' => $businessUser1->id,
        ]);

        $response = $this->actingAsUser($businessUser2)
            ->deleteJson("/api/businesses/{$business->uuid}");

        $response->assertStatus(403);
    }

    /**
     * Test business owner can add service.
     */
    public function test_business_owner_can_add_service(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        $serviceData = [
            'name' => 'Haircut',
            'description' => 'Professional haircut',
            'price' => 25.00,
            'duration' => 30,
        ];

        $response = $this->actingAsUser($businessUser)
            ->postJson("/api/businesses/{$business->uuid}/services", $serviceData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Service added successfully',
                'data' => [
                    'name' => 'Haircut',
                    'price' => '25.00',
                ],
            ]);

        $this->assertDatabaseHas('services', [
            'business_id' => $business->id,
            'name' => 'Haircut',
        ]);
    }

    /**
     * Test non-owner cannot add service.
     */
    public function test_non_owner_cannot_add_service(): void
    {
        $businessUser1 = $this->createBusinessUser();
        $businessUser2 = $this->createBusinessUser();

        $business = Business::factory()->create([
            'user_id' => $businessUser1->id,
        ]);

        $serviceData = [
            'name' => 'Haircut',
            'price' => 25.00,
        ];

        $response = $this->actingAsUser($businessUser2)
            ->postJson("/api/businesses/{$business->uuid}/services", $serviceData);

        $response->assertStatus(403);
    }

    /**
     * Test user can follow a business.
     */
    public function test_user_can_follow_business(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        $response = $this->actingAsUser($user)
            ->postJson("/api/businesses/{$business->uuid}/follow");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Business followed successfully',
            ]);

        $this->assertDatabaseHas('follows', [
            'follower_id' => $user->id,
            'business_id' => $business->id,
        ]);
    }

    /**
     * Test user can unfollow a business.
     */
    public function test_user_can_unfollow_business(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        // First follow the business
        $business->followers()->attach($user->id);

        $response = $this->actingAsUser($user)
            ->postJson("/api/businesses/{$business->uuid}/unfollow");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Business unfollowed successfully',
            ]);

        $this->assertDatabaseMissing('follows', [
            'follower_id' => $user->id,
            'business_id' => $business->id,
        ]);
    }

    /**
     * Test cannot follow business twice.
     */
    public function test_cannot_follow_business_twice(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        // Follow once
        $business->followers()->attach($user->id);

        // Try to follow again
        $response = $this->actingAsUser($user)
            ->postJson("/api/businesses/{$business->uuid}/follow");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Already following this business',
            ]);
    }

    /**
     * Test user can add review to business.
     */
    public function test_user_can_add_review_to_business(): void
    {
        $user = $this->createUser();
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        $reviewData = [
            'rating' => 5,
            'title' => 'Excellent Service',
            'comment' => 'Best barber shop ever!',
        ];

        $response = $this->actingAsUser($user)
            ->postJson("/api/businesses/{$business->uuid}/reviews", $reviewData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Review added successfully',
                'data' => [
                    'rating' => 5,
                ],
            ]);

        $this->assertDatabaseHas('reviews', [
            'business_id' => $business->id,
            'user_id' => $user->id,
            'rating' => 5,
        ]);
    }

    /**
     * Test can retrieve business reviews.
     */
    public function test_can_retrieve_business_reviews(): void
    {
        $businessUser = $this->createBusinessUser();
        $business = Business::factory()->create([
            'user_id' => $businessUser->id,
        ]);

        // Create some reviews
        $user1 = $this->createUser();
        $user2 = $this->createUser();

        $business->reviews()->create([
            'user_id' => $user1->id,
            'rating' => 5,
            'title' => 'Great',
            'comment' => 'Loved it',
        ]);

        $business->reviews()->create([
            'user_id' => $user2->id,
            'rating' => 4,
            'title' => 'Good',
            'comment' => 'Nice place',
        ]);

        $response = $this->getJson("/api/businesses/{$business->uuid}/reviews");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test unauthenticated user cannot create business.
     */
    public function test_unauthenticated_user_cannot_create_business(): void
    {
        $businessData = [
            'business_name' => 'My Barber Shop',
            'business_type' => 'barber',
        ];

        $response = $this->postJson('/api/businesses', $businessData);

        $response->assertStatus(401);
    }

    /**
     * Test verified businesses can be filtered.
     */
    public function test_can_filter_verified_businesses(): void
    {
        $businessUser = $this->createBusinessUser();

        Business::factory()->count(3)->create([
            'user_id' => $businessUser->id,
            'is_verified' => true,
        ]);

        Business::factory()->count(2)->create([
            'user_id' => $businessUser->id,
            'is_verified' => false,
        ]);

        $response = $this->getJson('/api/businesses?verified=1');

        $response->assertStatus(200);

        $data = $response->json('data.data');
        foreach ($data as $business) {
            $this->assertTrue((bool) $business['is_verified']);
        }
    }
}
