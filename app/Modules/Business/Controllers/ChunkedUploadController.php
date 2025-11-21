<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessVideo;
use App\Modules\Videos\Models\Video;
use App\Services\ChunkedUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChunkedUploadController extends Controller
{
    private const ALLOWED_VIDEO_MIMES = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
    ];

    private const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max

    private const MAX_CHUNK_SIZE = 1.5 * 1024 * 1024;  // 1.5MB per chunk (fits within PHP's 2MB default)

    public function __construct(
        private ChunkedUploadService $chunkedUploadService
    ) {}

    /**
     * Initialize a chunked upload session
     */
    public function initializeUpload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => 'required|string|max:255',
            'file_size' => 'required|integer|min:1|max:'.self::MAX_FILE_SIZE,
            'mime_type' => 'required|string|in:'.implode(',', self::ALLOWED_VIDEO_MIMES),
            'chunk_size' => 'nullable|integer|min:1|max:'.self::MAX_CHUNK_SIZE,
        ]);

        try {
            $chunkSize = $validated['chunk_size'] ?? self::MAX_CHUNK_SIZE;
            $totalChunks = (int) ceil($validated['file_size'] / $chunkSize);

            $result = $this->chunkedUploadService->initializeUpload(
                $validated['file_name'],
                $validated['file_size'],
                $totalChunks,
                $validated['mime_type']
            );

            return response()->json([
                'message' => 'Upload initialized successfully',
                'data' => [
                    'upload_id' => $result['upload_id'],
                    'total_chunks' => $result['total_chunks'],
                    'chunk_size' => $chunkSize,
                    'expires_at' => $result['expires_at'],
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to initialize chunked upload', [
                'error' => $e->getMessage(),
                'file_name' => $validated['file_name'],
            ]);

            return response()->json([
                'message' => 'Failed to initialize upload',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload a single chunk
     */
    public function uploadChunk(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'upload_id' => 'required|uuid',
                'chunk_index' => 'required|integer|min:0',
                'chunk' => 'required|file|max:2048', // 2MB max per chunk
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Chunk upload validation failed', [
                'errors' => $e->errors(),
                'has_file' => $request->hasFile('chunk'),
                'file_size' => $request->hasFile('chunk') ? $request->file('chunk')->getSize() : null,
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        try {
            $chunkData = file_get_contents($request->file('chunk')->getRealPath());

            $result = $this->chunkedUploadService->storeChunk(
                $validated['upload_id'],
                $validated['chunk_index'],
                $chunkData
            );

            return response()->json([
                'message' => $result['message'],
                'data' => [
                    'chunk_index' => $result['chunk_index'],
                    'uploaded_chunks' => $result['uploaded_chunks'],
                    'total_chunks' => $result['total_chunks'],
                    'progress' => round(($result['uploaded_chunks'] / $result['total_chunks']) * 100, 2),
                    'is_complete' => $result['is_complete'],
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to upload chunk', [
                'error' => $e->getMessage(),
                'upload_id' => $validated['upload_id'],
                'chunk_index' => $validated['chunk_index'],
            ]);

            return response()->json([
                'message' => 'Failed to upload chunk',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete the upload and assemble the file
     */
    public function completeUpload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'upload_id' => 'required|uuid',
            'directory' => 'required|string|max:255',
            // Optional: create video record directly
            'create_video' => 'nullable|boolean',
            'business_id' => 'required_if:create_video,true|exists:businesses,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $result = $this->chunkedUploadService->completeUpload(
                $validated['upload_id'],
                $validated['directory']
            );

            $responseData = [
                'file_name' => $result['file_name'],
                'file_path' => $result['file_path'],
                'file_url' => $result['file_url'],
                'file_size' => $result['file_size'],
                'mime_type' => $result['mime_type'],
            ];

            // Optionally create video record
            if ($request->input('create_video', false)) {
                $video = Video::create([
                    'business_id' => $validated['business_id'],
                    'title' => $validated['title'] ?? null,
                    'description' => $validated['description'] ?? null,
                    'video_url' => $result['file_url'],
                    'status' => 'published', // Publish directly for development (no FFmpeg)
                    'is_public' => true,
                ]);

                // Skip FFmpeg processing for development
                // In production with FFmpeg installed, uncomment the following:
                // $video->status = 'processing';
                // $video->save();
                // ProcessVideo::dispatch($video->id);

                $responseData['video'] = [
                    'id' => $video->id,
                    'uuid' => $video->uuid,
                    'status' => $video->status,
                ];
            }

            return response()->json([
                'message' => 'Upload completed successfully',
                'data' => $responseData,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to complete chunked upload', [
                'error' => $e->getMessage(),
                'upload_id' => $validated['upload_id'],
            ]);

            return response()->json([
                'message' => 'Failed to complete upload',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get upload status (for resume capability)
     */
    public function getUploadStatus(Request $request, string $uploadId): JsonResponse
    {
        try {
            $result = $this->chunkedUploadService->getUploadStatus($uploadId);

            return response()->json([
                'message' => 'Upload status retrieved',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Cancel an upload
     */
    public function cancelUpload(Request $request, string $uploadId): JsonResponse
    {
        try {
            $this->chunkedUploadService->cancelUpload($uploadId);

            return response()->json([
                'message' => 'Upload cancelled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel upload',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
