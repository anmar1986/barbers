<?php

namespace App\Jobs;

use App\Modules\Videos\Models\Video;
use App\Modules\Videos\Services\VideoProcessingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessVideo implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 3600; // 1 hour

    /**
     * The video to process.
     */
    public $videoId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $videoId)
    {
        $this->videoId = $videoId;
    }

    /**
     * Execute the job.
     */
    public function handle(VideoProcessingService $processingService): void
    {
        Log::info('ProcessVideo job started', ['video_id' => $this->videoId]);

        $video = Video::find($this->videoId);

        if (! $video) {
            Log::error('Video not found for processing', ['video_id' => $this->videoId]);

            return;
        }

        // Set status to processing
        $video->status = 'processing';
        $video->save();

        // Process the video
        $success = $processingService->processVideo($video);

        if ($success) {
            Log::info('ProcessVideo job completed successfully', ['video_id' => $this->videoId]);
        } else {
            Log::error('ProcessVideo job failed', ['video_id' => $this->videoId]);
            throw new \Exception('Video processing failed');
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessVideo job failed permanently', [
            'video_id' => $this->videoId,
            'error' => $exception->getMessage(),
        ]);

        $video = Video::find($this->videoId);
        if ($video) {
            $video->status = 'failed';
            $video->save();
        }
    }
}
