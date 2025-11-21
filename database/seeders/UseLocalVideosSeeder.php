<?php

namespace Database\Seeders;

use App\Modules\Videos\Models\Video;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class UseLocalVideosSeeder extends Seeder
{
    /**
     * Update videos to use actual local video files from storage/app/public/videos
     */
    public function run(): void
    {
        // Get all video files from storage/app/public/videos
        $videoFiles = Storage::disk('public')->files('videos');

        if (empty($videoFiles)) {
            $this->command->error('No video files found in storage/app/public/videos/');
            $this->command->info('Please upload videos to storage/app/public/videos/ first.');

            return;
        }

        $this->command->info('Found '.count($videoFiles).' video files in storage.');

        $videos = Video::all();

        if ($videos->isEmpty()) {
            $this->command->info('No videos found in database to update.');

            return;
        }

        $this->command->info('Updating '.$videos->count().' videos with local video URLs...');

        foreach ($videos as $index => $video) {
            // Get video file for this index (cycle through if more videos than files)
            $videoFile = $videoFiles[$index % count($videoFiles)];

            // Create the URL path (will be converted to full URL by VideoResource)
            $videoUrl = '/storage/'.$videoFile;

            $video->update([
                'video_url' => $videoUrl,
                'status' => 'published',
                'is_public' => true,
            ]);

            $this->command->info("Updated video #{$video->id}: {$video->title} -> {$videoUrl}");
        }

        $this->command->info('✓ All videos updated successfully!');
        $this->command->info('Videos will be accessible at: http://localhost:8000/storage/videos/filename.mp4');
        $this->command->info('For Flutter app (Android emulator): http://10.0.2.2:8000/storage/videos/filename.mp4');
    }
}
