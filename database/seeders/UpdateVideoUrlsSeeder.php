<?php

namespace Database\Seeders;

use App\Modules\Videos\Models\Video;
use Illuminate\Database\Seeder;

class UpdateVideoUrlsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This updates existing videos with working test video URLs from
     * a public CDN for testing purposes.
     */
    public function run(): void
    {
        // Sample working video URLs for testing
        // These are from a public CDN with actual video files
        $testVideoUrls = [
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        ];

        $videos = Video::all();

        if ($videos->isEmpty()) {
            $this->command->info('No videos found to update.');

            return;
        }

        $this->command->info('Updating '.$videos->count().' videos with working test URLs...');

        foreach ($videos as $index => $video) {
            $videoUrl = $testVideoUrls[$index % count($testVideoUrls)];

            $video->update([
                'video_url' => $videoUrl,
                'status' => 'published',
                'is_public' => true,
            ]);

            $this->command->info("Updated video: {$video->title} -> {$videoUrl}");
        }

        $this->command->info('✓ All videos updated successfully!');
        $this->command->info('You can now test video playback in the Flutter app.');
    }
}
