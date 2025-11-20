<?php

namespace App\Modules\Videos\Services;

use App\Modules\Videos\Models\Video;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VideoProcessingService
{
    private $ffmpeg;

    public function __construct()
    {
        try {
            // Initialize FFMpeg
            $this->ffmpeg = FFMpeg::create([
                'ffmpeg.binaries' => env('FFMPEG_BINARIES', 'ffmpeg'),
                'ffprobe.binaries' => env('FFPROBE_BINARIES', 'ffprobe'),
                'timeout' => 3600, // 1 hour timeout
                'ffmpeg.threads' => 4,
            ]);
        } catch (\Exception $e) {
            Log::error('FFMpeg initialization failed: '.$e->getMessage());
            $this->ffmpeg = null;
        }
    }

    /**
     * Process video: generate thumbnail and transcode if needed
     */
    public function processVideo(Video $video): bool
    {
        try {
            Log::info('Starting video processing', ['video_id' => $video->id, 'video_url' => $video->video_url]);

            // If FFMpeg is not available, just publish the video without processing
            if (! $this->ffmpeg) {
                Log::warning('FFMpeg not initialized - skipping video processing, publishing video directly');

                $video->status = 'published';
                $video->save();

                Log::info('Video published without processing (FFMpeg not available)', [
                    'video_id' => $video->id,
                ]);

                return true;
            }

            // Get the full path to the video file
            $videoPath = $this->getVideoPath($video->video_url);

            if (! $videoPath || ! file_exists($videoPath)) {
                Log::warning('Video file not found - publishing anyway', ['path' => $videoPath]);

                // Still publish the video even if file not found locally
                // (it might be accessible via URL)
                $video->status = 'published';
                $video->save();

                return true;
            }

            // Generate thumbnail
            $thumbnailGenerated = $this->generateThumbnail($video, $videoPath);

            // Get video duration
            $duration = $this->getVideoDuration($videoPath);
            if ($duration) {
                $video->duration = $duration;
            }

            // Transcode video if needed (optional)
            // $this->transcodeVideo($video, $videoPath);

            $video->status = 'published';
            $video->save();

            Log::info('Video processing completed', [
                'video_id' => $video->id,
                'thumbnail_generated' => $thumbnailGenerated,
                'duration' => $duration,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Video processing failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $video->status = 'failed';
            $video->save();

            return false;
        }
    }

    /**
     * Generate thumbnail from video
     */
    public function generateThumbnail(Video $video, string $videoPath): bool
    {
        try {
            if (! $this->ffmpeg) {
                return false;
            }

            $ffmpegVideo = $this->ffmpeg->open($videoPath);

            // Generate thumbnail at 1 second
            $frame = $ffmpegVideo->frame(TimeCode::fromSeconds(1));

            // Create thumbnails directory if it doesn't exist
            $thumbnailDir = storage_path('app/public/thumbnails');
            if (! file_exists($thumbnailDir)) {
                mkdir($thumbnailDir, 0755, true);
            }

            // Generate unique thumbnail filename
            $thumbnailFilename = 'thumb_'.uniqid().'_'.time().'.jpg';
            $thumbnailPath = $thumbnailDir.'/'.$thumbnailFilename;

            // Save thumbnail
            $frame->save($thumbnailPath);

            // Update video with thumbnail URL
            $video->thumbnail_url = '/storage/thumbnails/'.$thumbnailFilename;
            $video->save();

            Log::info('Thumbnail generated', [
                'video_id' => $video->id,
                'thumbnail_url' => $video->thumbnail_url,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Thumbnail generation failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get video duration in seconds
     */
    public function getVideoDuration(string $videoPath): ?int
    {
        try {
            if (! $this->ffmpeg) {
                return null;
            }

            $ffprobe = \FFMpeg\FFProbe::create([
                'ffprobe.binaries' => env('FFPROBE_BINARIES', 'ffprobe'),
            ]);

            $duration = $ffprobe
                ->format($videoPath)
                ->get('duration');

            return (int) round($duration);
        } catch (\Exception $e) {
            Log::error('Failed to get video duration', [
                'path' => $videoPath,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Transcode video to standardized format
     */
    public function transcodeVideo(Video $video, string $videoPath): bool
    {
        try {
            if (! $this->ffmpeg) {
                return false;
            }

            $ffmpegVideo = $this->ffmpeg->open($videoPath);

            // Create transcoded videos directory
            $transcodedDir = storage_path('app/public/videos/transcoded');
            if (! file_exists($transcodedDir)) {
                mkdir($transcodedDir, 0755, true);
            }

            // Generate unique filename for transcoded video
            $transcodedFilename = 'video_'.uniqid().'_'.time().'.mp4';
            $transcodedPath = $transcodedDir.'/'.$transcodedFilename;

            // Configure format (H.264 with AAC audio)
            $format = new X264('libmp3lame', 'libx264');
            $format->setKiloBitrate(1000)
                ->setAudioChannels(2)
                ->setAudioKiloBitrate(128);

            // Save transcoded video
            $ffmpegVideo->save($format, $transcodedPath);

            // Update video with transcoded URL
            $video->video_url = '/storage/videos/transcoded/'.$transcodedFilename;
            $video->save();

            Log::info('Video transcoded', [
                'video_id' => $video->id,
                'transcoded_url' => $video->video_url,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Video transcoding failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get the full file path from video URL
     */
    private function getVideoPath(string $videoUrl): ?string
    {
        // Handle different URL formats
        if (strpos($videoUrl, '/storage/') === 0) {
            // URL starts with /storage/
            $relativePath = str_replace('/storage/', '', $videoUrl);

            return storage_path('app/public/'.$relativePath);
        } elseif (strpos($videoUrl, 'http') === 0) {
            // Full URL - extract path
            $path = parse_url($videoUrl, PHP_URL_PATH);
            if ($path && strpos($path, '/storage/') !== false) {
                $relativePath = str_replace('/storage/', '', $path);

                return storage_path('app/public/'.$relativePath);
            }
        }

        // Try as direct storage path
        $storagePath = storage_path('app/public/'.$videoUrl);
        if (file_exists($storagePath)) {
            return $storagePath;
        }

        return null;
    }
}
