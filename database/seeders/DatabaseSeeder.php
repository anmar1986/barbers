<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Clear existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate tables in correct order
        DB::table('notifications')->truncate();
        DB::table('favorites')->truncate();
        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();
        DB::table('product_images')->truncate();
        DB::table('products')->truncate();
        DB::table('product_categories')->truncate();
        DB::table('video_comments')->truncate();
        DB::table('video_likes')->truncate();
        DB::table('video_hashtags')->truncate();
        DB::table('videos')->truncate();
        DB::table('follows')->truncate();
        DB::table('reviews')->truncate();
        DB::table('media_gallery')->truncate();
        DB::table('services')->truncate();
        DB::table('business_hours')->truncate();
        DB::table('businesses')->truncate();
        DB::table('users')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Users (Normal Users and Business Owners)
        $this->createUsers();

        // 2. Create Businesses
        $this->createBusinesses();

        // 3. Create Business Hours
        $this->createBusinessHours();

        // 4. Create Services
        $this->createServices();

        // 5. Create Media Gallery
        $this->createMediaGallery();

        // 6. Create Reviews
        $this->createReviews();

        // 7. Create Follows
        $this->createFollows();

        // 8. Create Videos
        $this->createVideos();

        // 9. Create Video Interactions
        $this->createVideoInteractions();

        // 10. Create Product Categories
        $this->createProductCategories();

        // 11. Create Products
        $this->createProducts();

        // 12. Create Orders
        $this->createOrders();

        // 13. Create Favorites
        $this->createFavorites();

        // 14. Create Notifications
        $this->createNotifications();

        $this->command->info('Database seeded successfully!');
    }

    private function createUsers(): void
    {
        $this->command->info('Creating users...');

        // Admin user
        DB::table('users')->insert([
            'uuid' => Str::uuid(),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@barbersocial.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567890',
            'user_type' => 'admin',
            'date_of_birth' => '1990-01-01',
            'email_verified_at' => now(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Business owners
        $businessOwners = [
            ['first_name' => 'John', 'last_name' => 'Smith', 'email' => 'john@barbershop.com'],
            ['first_name' => 'Maria', 'last_name' => 'Garcia', 'email' => 'maria@nailstudio.com'],
            ['first_name' => 'David', 'last_name' => 'Johnson', 'email' => 'david@hairsalon.com'],
            ['first_name' => 'Sarah', 'last_name' => 'Wilson', 'email' => 'sarah@massagecenter.com'],
            ['first_name' => 'Michael', 'last_name' => 'Brown', 'email' => 'michael@cutshop.com'],
            ['first_name' => 'Lisa', 'last_name' => 'Anderson', 'email' => 'lisa@beautystudio.com'],
            ['first_name' => 'James', 'last_name' => 'Martinez', 'email' => 'james@fadehouse.com'],
            ['first_name' => 'Emma', 'last_name' => 'Taylor', 'email' => 'emma@glamstudio.com'],
        ];

        foreach ($businessOwners as $owner) {
            DB::table('users')->insert(array_merge($owner, [
                'uuid' => Str::uuid(),
                'password' => Hash::make('password'),
                'phone' => '+1'.rand(2000000000, 9999999999),
                'user_type' => 'business',
                'date_of_birth' => '1985-'.rand(1, 12).'-'.rand(1, 28),
                'email_verified_at' => now(),
                'is_active' => true,
                'created_at' => now()->subDays(rand(30, 365)),
                'updated_at' => now(),
            ]));
        }

        // Normal users
        $normalUsers = [
            ['first_name' => 'Robert', 'last_name' => 'Davis', 'email' => 'robert@example.com'],
            ['first_name' => 'Jennifer', 'last_name' => 'Miller', 'email' => 'jennifer@example.com'],
            ['first_name' => 'William', 'last_name' => 'Moore', 'email' => 'william@example.com'],
            ['first_name' => 'Linda', 'last_name' => 'Jackson', 'email' => 'linda@example.com'],
            ['first_name' => 'Richard', 'last_name' => 'White', 'email' => 'richard@example.com'],
            ['first_name' => 'Patricia', 'last_name' => 'Harris', 'email' => 'patricia@example.com'],
            ['first_name' => 'Charles', 'last_name' => 'Martin', 'email' => 'charles@example.com'],
            ['first_name' => 'Barbara', 'last_name' => 'Thompson', 'email' => 'barbara@example.com'],
            ['first_name' => 'Joseph', 'last_name' => 'Garcia', 'email' => 'joseph@example.com'],
            ['first_name' => 'Susan', 'last_name' => 'Martinez', 'email' => 'susan@example.com'],
        ];

        foreach ($normalUsers as $user) {
            DB::table('users')->insert(array_merge($user, [
                'uuid' => Str::uuid(),
                'password' => Hash::make('password'),
                'phone' => '+1'.rand(2000000000, 9999999999),
                'user_type' => 'normal',
                'date_of_birth' => '1990-'.rand(1, 12).'-'.rand(1, 28),
                'profile_picture' => 'https://ui-avatars.com/api/?name='.urlencode($user['first_name'].'+'.$user['last_name']),
                'email_verified_at' => now(),
                'is_active' => true,
                'created_at' => now()->subDays(rand(1, 180)),
                'updated_at' => now(),
            ]));
        }
    }

    private function createBusinesses(): void
    {
        $this->command->info('Creating businesses...');

        $businesses = [
            [
                'user_id' => 2,
                'business_name' => 'Elite Barber Shop',
                'business_type' => 'barber',
                'description' => 'Premium barber shop offering classic and modern haircuts, beard trims, and hot towel shaves. Expert barbers with 10+ years of experience.',
                'address' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10001',
                'phone' => '+1234567890',
                'email' => 'contact@elitebarber.com',
                'website' => 'https://elitebarber.com',
                'average_rating' => 4.8,
                'is_verified' => true,
            ],
            [
                'user_id' => 3,
                'business_name' => 'Glamour Nail Studio',
                'business_type' => 'nail_studio',
                'description' => 'Full-service nail salon specializing in manicures, pedicures, nail art, and spa treatments.',
                'address' => '456 Fashion Ave',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip_code' => '90001',
                'phone' => '+1987654321',
                'email' => 'info@glamournails.com',
                'average_rating' => 4.9,
                'is_verified' => true,
            ],
            [
                'user_id' => 4,
                'business_name' => 'Luxe Hair Salon',
                'business_type' => 'hair_salon',
                'description' => 'Modern hair salon offering cuts, color, highlights, balayage, and styling services.',
                'address' => '789 Beauty Blvd',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60601',
                'phone' => '+1555123456',
                'email' => 'hello@luxehair.com',
                'average_rating' => 4.7,
                'is_verified' => true,
            ],
            [
                'user_id' => 5,
                'business_name' => 'Zen Massage Center',
                'business_type' => 'massage',
                'description' => 'Relaxing massage therapy center offering Swedish, deep tissue, hot stone, and aromatherapy massages.',
                'address' => '321 Wellness Way',
                'city' => 'Miami',
                'state' => 'FL',
                'zip_code' => '33101',
                'phone' => '+1444555666',
                'email' => 'relax@zenmassage.com',
                'average_rating' => 4.9,
                'is_verified' => true,
            ],
            [
                'user_id' => 6,
                'business_name' => 'The Cut Shop',
                'business_type' => 'barber',
                'description' => 'Urban barber shop specializing in fades, tapers, and modern mens grooming.',
                'address' => '555 Urban Street',
                'city' => 'Atlanta',
                'state' => 'GA',
                'zip_code' => '30301',
                'phone' => '+1777888999',
                'average_rating' => 4.6,
                'is_verified' => true,
            ],
            [
                'user_id' => 7,
                'business_name' => 'Beauty Bliss Studio',
                'business_type' => 'nail_studio',
                'description' => 'Trendy nail studio with expert nail technicians and the latest nail art trends.',
                'address' => '888 Style Lane',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip_code' => '98101',
                'phone' => '+1222333444',
                'average_rating' => 4.8,
                'is_verified' => false,
            ],
            [
                'user_id' => 8,
                'business_name' => 'Fade House Barbershop',
                'business_type' => 'barber',
                'description' => 'Premium barbershop known for perfect fades, lineup, and beard sculpting.',
                'address' => '999 Barber Road',
                'city' => 'Houston',
                'state' => 'TX',
                'zip_code' => '77001',
                'phone' => '+1666777888',
                'average_rating' => 4.9,
                'is_verified' => true,
            ],
            [
                'user_id' => 9,
                'business_name' => 'Glam & Glow Salon',
                'business_type' => 'hair_salon',
                'description' => 'Full-service salon offering haircuts, coloring, extensions, and bridal styling.',
                'address' => '777 Glamour Street',
                'city' => 'Phoenix',
                'state' => 'AZ',
                'zip_code' => '85001',
                'phone' => '+1999888777',
                'average_rating' => 4.7,
                'is_verified' => true,
            ],
        ];

        foreach ($businesses as $business) {
            $slug = Str::slug($business['business_name']);
            $uuid = Str::uuid();

            DB::table('businesses')->insert(array_merge($business, [
                'uuid' => $uuid,
                'slug' => $slug,
                'latitude' => rand(25000000, 48000000) / 1000000,
                'longitude' => rand(-125000000, -70000000) / 1000000,
                'total_reviews' => rand(10, 150),
                'follower_count' => rand(50, 1000),
                'view_count' => rand(500, 5000),
                'created_at' => now()->subDays(rand(60, 730)),
                'updated_at' => now(),
            ]));
        }
    }

    private function createBusinessHours(): void
    {
        $this->command->info('Creating business hours...');

        for ($businessId = 1; $businessId <= 8; $businessId++) {
            for ($day = 0; $day <= 6; $day++) {
                $isClosed = $day == 0; // Closed on Sunday

                DB::table('business_hours')->insert([
                    'business_id' => $businessId,
                    'day_of_week' => $day,
                    'open_time' => $isClosed ? null : '09:00:00',
                    'close_time' => $isClosed ? null : '18:00:00',
                    'is_closed' => $isClosed,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createServices(): void
    {
        $this->command->info('Creating services...');

        $services = [
            // Barber services (business 1, 5, 7)
            1 => [
                ['name' => 'Classic Haircut', 'price' => 30.00, 'duration_minutes' => 30],
                ['name' => 'Fade Cut', 'price' => 35.00, 'duration_minutes' => 45],
                ['name' => 'Beard Trim', 'price' => 15.00, 'duration_minutes' => 20],
                ['name' => 'Hot Towel Shave', 'price' => 25.00, 'duration_minutes' => 30],
                ['name' => 'Haircut + Beard', 'price' => 40.00, 'duration_minutes' => 50],
            ],
            5 => [
                ['name' => 'Taper Fade', 'price' => 32.00, 'duration_minutes' => 40],
                ['name' => 'Buzz Cut', 'price' => 20.00, 'duration_minutes' => 15],
                ['name' => 'Beard Shaping', 'price' => 18.00, 'duration_minutes' => 25],
            ],
            7 => [
                ['name' => 'Premium Fade', 'price' => 45.00, 'duration_minutes' => 60],
                ['name' => 'Kids Haircut', 'price' => 20.00, 'duration_minutes' => 25],
                ['name' => 'Line Up', 'price' => 15.00, 'duration_minutes' => 15],
            ],
            // Nail services (business 2, 6)
            2 => [
                ['name' => 'Classic Manicure', 'price' => 25.00, 'duration_minutes' => 45],
                ['name' => 'Gel Manicure', 'price' => 40.00, 'duration_minutes' => 60],
                ['name' => 'Spa Pedicure', 'price' => 50.00, 'duration_minutes' => 75],
                ['name' => 'Nail Art', 'price' => 60.00, 'duration_minutes' => 90],
                ['name' => 'Acrylic Nails', 'price' => 55.00, 'duration_minutes' => 90],
            ],
            6 => [
                ['name' => 'Basic Manicure', 'price' => 20.00, 'duration_minutes' => 40],
                ['name' => 'Deluxe Pedicure', 'price' => 45.00, 'duration_minutes' => 70],
                ['name' => 'French Tips', 'price' => 35.00, 'duration_minutes' => 50],
            ],
            // Hair salon services (business 3, 8)
            3 => [
                ['name' => 'Womens Cut', 'price' => 50.00, 'duration_minutes' => 60],
                ['name' => 'Mens Cut', 'price' => 35.00, 'duration_minutes' => 45],
                ['name' => 'Color Service', 'price' => 80.00, 'duration_minutes' => 120],
                ['name' => 'Highlights', 'price' => 120.00, 'duration_minutes' => 150],
                ['name' => 'Balayage', 'price' => 150.00, 'duration_minutes' => 180],
                ['name' => 'Blowout', 'price' => 30.00, 'duration_minutes' => 30],
            ],
            8 => [
                ['name' => 'Haircut & Style', 'price' => 55.00, 'duration_minutes' => 65],
                ['name' => 'Full Color', 'price' => 90.00, 'duration_minutes' => 130],
                ['name' => 'Hair Extensions', 'price' => 200.00, 'duration_minutes' => 180],
            ],
            // Massage services (business 4)
            4 => [
                ['name' => 'Swedish Massage', 'price' => 70.00, 'duration_minutes' => 60],
                ['name' => 'Deep Tissue Massage', 'price' => 85.00, 'duration_minutes' => 60],
                ['name' => 'Hot Stone Massage', 'price' => 100.00, 'duration_minutes' => 75],
                ['name' => 'Aromatherapy Massage', 'price' => 90.00, 'duration_minutes' => 60],
                ['name' => 'Couples Massage', 'price' => 180.00, 'duration_minutes' => 90],
            ],
        ];

        foreach ($services as $businessId => $businessServices) {
            foreach ($businessServices as $service) {
                DB::table('services')->insert([
                    'uuid' => Str::uuid(),
                    'business_id' => $businessId,
                    'name' => $service['name'],
                    'description' => 'Professional '.strtolower($service['name']).' service',
                    'price' => $service['price'],
                    'duration_minutes' => $service['duration_minutes'],
                    'is_available' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createMediaGallery(): void
    {
        $this->command->info('Creating media gallery...');

        for ($businessId = 1; $businessId <= 8; $businessId++) {
            for ($i = 1; $i <= rand(3, 6); $i++) {
                DB::table('media_gallery')->insert([
                    'business_id' => $businessId,
                    'media_type' => 'image',
                    'media_url' => 'https://picsum.photos/800/600?random='.($businessId * 100 + $i),
                    'thumbnail_url' => 'https://picsum.photos/200/150?random='.($businessId * 100 + $i),
                    'caption' => 'Portfolio image '.$i,
                    'display_order' => $i,
                    'is_featured' => $i == 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createReviews(): void
    {
        $this->command->info('Creating reviews...');

        $reviewTexts = [
            'Amazing service! Highly recommend.',
            'Very professional and talented staff.',
            'Great experience, will definitely come back!',
            'The best in town! Love the atmosphere.',
            'Excellent quality and reasonable prices.',
            'Super friendly staff and clean environment.',
            'Exceeded my expectations!',
            'Perfect results every time!',
        ];

        for ($businessId = 1; $businessId <= 8; $businessId++) {
            for ($i = 0; $i < rand(5, 12); $i++) {
                DB::table('reviews')->insert([
                    'business_id' => $businessId,
                    'user_id' => rand(10, 19), // Normal users
                    'rating' => rand(4, 5),
                    'review_text' => $reviewTexts[array_rand($reviewTexts)],
                    'created_at' => now()->subDays(rand(1, 180)),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createFollows(): void
    {
        $this->command->info('Creating follows...');

        for ($userId = 10; $userId <= 19; $userId++) {
            $businessesToFollow = range(1, 8);
            shuffle($businessesToFollow);
            $businessesToFollow = array_slice($businessesToFollow, 0, rand(2, 5));

            foreach ($businessesToFollow as $businessId) {
                DB::table('follows')->insert([
                    'follower_id' => $userId,
                    'business_id' => $businessId,
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createVideos(): void
    {
        $this->command->info('Creating videos...');

        $videoTitles = [
            'Perfect Fade Tutorial',
            'Classic Haircut Technique',
            'Beard Grooming Tips',
            'Nail Art Design',
            'Balayage Hair Coloring',
            'Hot Towel Shave Demo',
            'Modern Mens Haircut',
            'Gel Manicure Process',
            'Hair Styling Tutorial',
            'Massage Techniques',
        ];

        for ($businessId = 1; $businessId <= 8; $businessId++) {
            for ($i = 0; $i < rand(3, 8); $i++) {
                $videoId = DB::table('videos')->insertGetId([
                    'uuid' => Str::uuid(),
                    'business_id' => $businessId,
                    'title' => $videoTitles[array_rand($videoTitles)],
                    'description' => 'Watch this amazing tutorial! #barber #tutorial #hairstyle',
                    'video_url' => 'https://example.com/videos/'.Str::random(16).'.mp4',
                    'thumbnail_url' => 'https://picsum.photos/720/1280?random='.($businessId * 10 + $i),
                    'duration' => rand(15, 180),
                    'video_format' => 'mp4',
                    'resolution' => '1080x1920',
                    'file_size' => rand(5000000, 50000000),
                    'view_count' => rand(100, 10000),
                    'like_count' => rand(10, 1000),
                    'comment_count' => rand(5, 100),
                    'share_count' => rand(1, 50),
                    'status' => 'published',
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now(),
                ]);

                // Add hashtags
                $hashtags = ['barber', 'hairstyle', 'tutorial', 'beauty', 'grooming'];
                foreach (array_rand(array_flip($hashtags), rand(2, 4)) as $hashtag) {
                    DB::table('video_hashtags')->insert([
                        'video_id' => $videoId,
                        'hashtag' => $hashtag,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    private function createVideoInteractions(): void
    {
        $this->command->info('Creating video interactions...');

        $videoCount = DB::table('videos')->count();

        // Video likes
        for ($videoId = 1; $videoId <= $videoCount; $videoId++) {
            for ($i = 0; $i < rand(5, 20); $i++) {
                try {
                    DB::table('video_likes')->insert([
                        'video_id' => $videoId,
                        'user_id' => rand(10, 19),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    // Skip duplicate likes
                }
            }
        }

        // Video comments
        $comments = [
            'Great tutorial!',
            'Love this!',
            'Amazing skills!',
            'Thanks for sharing!',
            'This is helpful!',
            'Wow, impressive!',
        ];

        for ($videoId = 1; $videoId <= $videoCount; $videoId++) {
            for ($i = 0; $i < rand(3, 10); $i++) {
                DB::table('video_comments')->insert([
                    'video_id' => $videoId,
                    'user_id' => rand(10, 19),
                    'comment_text' => $comments[array_rand($comments)],
                    'like_count' => rand(0, 20),
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createProductCategories(): void
    {
        $this->command->info('Creating product categories...');

        $categories = [
            ['name' => 'Hair Care', 'slug' => 'hair-care'],
            ['name' => 'Styling Products', 'slug' => 'styling-products'],
            ['name' => 'Grooming Tools', 'slug' => 'grooming-tools'],
            ['name' => 'Beard Care', 'slug' => 'beard-care'],
            ['name' => 'Nail Products', 'slug' => 'nail-products'],
            ['name' => 'Accessories', 'slug' => 'accessories'],
        ];

        foreach ($categories as $category) {
            DB::table('product_categories')->insert(array_merge($category, [
                'description' => 'Professional '.strtolower($category['name']),
                'display_order' => array_search($category, $categories) + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    private function createProducts(): void
    {
        $this->command->info('Creating products...');

        $products = [
            ['name' => 'Premium Hair Pomade', 'category_id' => 2, 'price' => 24.99, 'business_id' => 1],
            ['name' => 'Professional Scissors', 'category_id' => 3, 'price' => 89.99, 'business_id' => 1],
            ['name' => 'Beard Oil', 'category_id' => 4, 'price' => 19.99, 'business_id' => 5],
            ['name' => 'Hair Gel Strong Hold', 'category_id' => 2, 'price' => 15.99, 'business_id' => 7],
            ['name' => 'Nail Polish Set', 'category_id' => 5, 'price' => 29.99, 'business_id' => 2],
            ['name' => 'Professional Nail Kit', 'category_id' => 5, 'price' => 49.99, 'business_id' => 6],
            ['name' => 'Hair Shampoo', 'category_id' => 1, 'price' => 22.99, 'business_id' => 3],
            ['name' => 'Hair Conditioner', 'category_id' => 1, 'price' => 22.99, 'business_id' => 3],
            ['name' => 'Styling Brush', 'category_id' => 3, 'price' => 34.99, 'business_id' => 8],
            ['name' => 'Beard Balm', 'category_id' => 4, 'price' => 17.99, 'business_id' => 1],
        ];

        foreach ($products as $product) {
            $productId = DB::table('products')->insertGetId(array_merge($product, [
                'uuid' => Str::uuid(),
                'slug' => Str::slug($product['name']),
                'description' => 'High-quality '.strtolower($product['name']).' for professional results.',
                'compare_price' => $product['price'] * 1.2,
                'stock_quantity' => rand(10, 100),
                'created_at' => now()->subDays(rand(30, 180)),
                'updated_at' => now(),
            ]));

            // Add product images
            for ($i = 1; $i <= rand(2, 4); $i++) {
                DB::table('product_images')->insert([
                    'product_id' => $productId,
                    'image_url' => 'https://picsum.photos/600/600?random='.($productId * 10 + $i),
                    'display_order' => $i,
                    'is_primary' => $i == 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createOrders(): void
    {
        $this->command->info('Creating orders...');

        for ($i = 1; $i <= 15; $i++) {
            $userId = rand(10, 19);
            $subtotal = rand(30, 200);
            $tax = $subtotal * 0.08;
            $shipping = 5.99;
            $total = $subtotal + $tax + $shipping;

            $orderId = DB::table('orders')->insertGetId([
                'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                'user_id' => $userId,
                'status' => ['confirmed', 'processing', 'shipped', 'delivered'][rand(0, 3)],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shipping,
                'total' => $total,
                'payment_method' => 'stripe',
                'payment_status' => 'paid',
                'payment_transaction_id' => 'txn_'.Str::random(16),
                'shipping_address' => '123 Customer Street, City, State 12345',
                'billing_address' => '123 Customer Street, City, State 12345',
                'created_at' => now()->subDays(rand(1, 60)),
                'updated_at' => now(),
            ]);

            // Add order items
            for ($j = 0; $j < rand(1, 3); $j++) {
                $productId = rand(1, 10);
                $quantity = rand(1, 3);
                $price = rand(15, 50);

                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $productId,
                    'business_id' => rand(1, 8),
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $price * $quantity,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createFavorites(): void
    {
        $this->command->info('Creating favorites...');

        for ($userId = 10; $userId <= 19; $userId++) {
            // Favorite businesses
            for ($i = 0; $i < rand(2, 4); $i++) {
                try {
                    DB::table('favorites')->insert([
                        'user_id' => $userId,
                        'favorable_type' => 'business',
                        'favorable_id' => rand(1, 8),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    // Skip duplicates
                }
            }

            // Favorite products
            for ($i = 0; $i < rand(1, 3); $i++) {
                try {
                    DB::table('favorites')->insert([
                        'user_id' => $userId,
                        'favorable_type' => 'product',
                        'favorable_id' => rand(1, 10),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    // Skip duplicates
                }
            }
        }
    }

    private function createNotifications(): void
    {
        $this->command->info('Creating notifications...');

        $notificationTypes = [
            ['type' => 'new_follower', 'title' => 'New Follower', 'message' => 'Someone started following your business!'],
            ['type' => 'new_review', 'title' => 'New Review', 'message' => 'You received a new review!'],
            ['type' => 'order_status', 'title' => 'Order Update', 'message' => 'Your order has been shipped!'],
            ['type' => 'video_like', 'title' => 'New Like', 'message' => 'Someone liked your video!'],
            ['type' => 'video_comment', 'title' => 'New Comment', 'message' => 'Someone commented on your video!'],
        ];

        for ($userId = 2; $userId <= 19; $userId++) {
            for ($i = 0; $i < rand(3, 8); $i++) {
                $notif = $notificationTypes[array_rand($notificationTypes)];
                DB::table('notifications')->insert([
                    'user_id' => $userId,
                    'type' => $notif['type'],
                    'title' => $notif['title'],
                    'message' => $notif['message'],
                    'is_read' => rand(0, 1) == 1,
                    'read_at' => rand(0, 1) == 1 ? now() : null,
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
