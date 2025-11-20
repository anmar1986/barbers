<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Upload a single image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        // Check if file was uploaded
        if (! $request->hasFile('file')) {
            return response()->json([
                'message' => 'No file uploaded',
                'errors' => ['file' => ['No file was provided']],
            ], 422);
        }

        // Check if file upload was successful
        if (! $request->file('file')->isValid()) {
            $errorCode = $request->file('file')->getError();

            return response()->json([
                'message' => 'File upload failed',
                'errors' => ['file' => ['File upload error code: '.$errorCode]],
            ], 422);
        }

        try {
            $validated = $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
                'directory' => 'required|string|max:255',
                'resize_width' => 'nullable|integer|min:1|max:4000',
                'resize_height' => 'nullable|integer|min:1|max:4000',
                'create_thumbnail' => 'nullable',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Upload validation failed:', $e->errors());

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        try {
            $options = [];

            if ($request->has('resize_width') && $request->has('resize_height')) {
                $options['resize'] = [
                    $request->input('resize_width'),
                    $request->input('resize_height'),
                ];
            }

            if ($request->input('create_thumbnail') == '1' || $request->input('create_thumbnail') === true || $request->input('create_thumbnail') === 'true') {
                $options['thumbnail'] = true;
            }

            $result = $this->fileUploadService->uploadImage(
                $request->file('file'),
                $request->input('directory'),
                $options
            );

            return response()->json([
                'message' => 'Image uploaded successfully',
                'data' => $result,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload multiple images
     */
    public function uploadMultipleImages(Request $request): JsonResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'image|max:10240', // 10MB max per file
            'directory' => 'required|string',
            'create_thumbnail' => 'nullable|boolean',
        ]);

        try {
            $options = [];

            if ($request->input('create_thumbnail', false)) {
                $options['thumbnail'] = true;
            }

            $results = $this->fileUploadService->uploadMultipleImages(
                $request->file('files'),
                $request->input('directory'),
                $options
            );

            return response()->json([
                'message' => 'Images uploaded successfully',
                'data' => $results,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload images',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload a video
     */
    public function uploadVideo(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|mimetypes:video/mp4,video/mpeg,video/quicktime,video/x-msvideo|max:102400', // 100MB max
            'directory' => 'required|string',
        ]);

        try {
            $result = $this->fileUploadService->uploadVideo(
                $request->file('file'),
                $request->input('directory')
            );

            return response()->json([
                'message' => 'Video uploaded successfully',
                'data' => $result,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload video',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a file
     */
    public function deleteFile(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        try {
            $deleted = $this->fileUploadService->deleteFile($request->input('path'));

            if ($deleted) {
                return response()->json([
                    'message' => 'File deleted successfully',
                ]);
            }

            return response()->json([
                'message' => 'File not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
