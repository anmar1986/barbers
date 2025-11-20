<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class FileUploadService
{
    protected $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }
    /**
     * Upload an image file.
     *
     * @param UploadedFile $file
     * @param string $directory Directory within storage/app/public (e.g., 'profiles', 'products')
     * @param array $options Options: ['resize' => [width, height], 'thumbnail' => true]
     * @return array ['url' => string, 'path' => string, 'thumbnail_url' => string|null]
     */
    public function uploadImage(UploadedFile $file, string $directory, array $options = []): array
    {
        // Validate image
        if (!$this->isValidImage($file)) {
            throw new \InvalidArgumentException('Invalid image file');
        }

        // Generate unique filename
        $filename = $this->generateFilename($file);
        $path = "{$directory}/{$filename}";

        // Resize image if needed
        if (isset($options['resize'])) {
            $image = $this->manager->read($file);
            [$width, $height] = $options['resize'];
            $image->scale(width: $width, height: $height);
            Storage::disk('public')->put($path, (string) $image->encode());
        } else {
            Storage::disk('public')->put($path, file_get_contents($file));
        }

        $result = [
            'url' => asset('storage/' . $path),
            'path' => $path,
            'thumbnail_url' => null,
        ];

        // Create thumbnail if requested
        if (isset($options['thumbnail']) && $options['thumbnail']) {
            $thumbnailPath = $this->createThumbnail($file, $directory, $filename);
            $result['thumbnail_url'] = asset('storage/' . $thumbnailPath);
        }

        return $result;
    }

    /**
     * Upload a video file.
     *
     * @param UploadedFile $file
     * @param string $directory
     * @return array ['url' => string, 'path' => string, 'duration' => int|null]
     */
    public function uploadVideo(UploadedFile $file, string $directory): array
    {
        // Validate video
        if (!$this->isValidVideo($file)) {
            throw new \InvalidArgumentException('Invalid video file');
        }

        // Generate unique filename
        $filename = $this->generateFilename($file);
        $path = "{$directory}/{$filename}";

        // Store video
        Storage::disk('public')->put($path, file_get_contents($file));

        return [
            'url' => asset('storage/' . $path),
            'path' => $path,
            'duration' => $this->getVideoDuration($file),
        ];
    }

    /**
     * Upload multiple images.
     *
     * @param array $files Array of UploadedFile instances
     * @param string $directory
     * @param array $options
     * @return array Array of upload results
     */
    public function uploadMultipleImages(array $files, string $directory, array $options = []): array
    {
        $results = [];

        foreach ($files as $file) {
            $results[] = $this->uploadImage($file, $directory, $options);
        }

        return $results;
    }

    /**
     * Delete a file from storage.
     *
     * @param string $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }

    /**
     * Delete multiple files from storage.
     *
     * @param array $paths
     * @return bool
     */
    public function deleteMultipleFiles(array $paths): bool
    {
        $existingPaths = array_filter($paths, function ($path) {
            return Storage::disk('public')->exists($path);
        });

        if (empty($existingPaths)) {
            return false;
        }

        return Storage::disk('public')->delete($existingPaths);
    }

    /**
     * Create thumbnail from image.
     *
     * @param UploadedFile $file
     * @param string $directory
     * @param string $originalFilename
     * @return string Thumbnail path
     */
    private function createThumbnail(UploadedFile $file, string $directory, string $originalFilename): string
    {
        $image = $this->manager->read($file);
        $image->scale(width: 300, height: 300);

        $thumbnailFilename = 'thumb_' . $originalFilename;
        $thumbnailPath = "{$directory}/{$thumbnailFilename}";

        Storage::disk('public')->put($thumbnailPath, (string) $image->encode());

        return $thumbnailPath;
    }

    /**
     * Generate unique filename.
     *
     * @param UploadedFile $file
     * @return string
     */
    private function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }

    /**
     * Validate if file is a valid image.
     *
     * @param UploadedFile $file
     * @return bool
     */
    private function isValidImage(UploadedFile $file): bool
    {
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 10 * 1024 * 1024; // 10MB

        return in_array($file->getMimeType(), $allowedMimeTypes) && $file->getSize() <= $maxSize;
    }

    /**
     * Validate if file is a valid video.
     *
     * @param UploadedFile $file
     * @return bool
     */
    private function isValidVideo(UploadedFile $file): bool
    {
        $allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
        $maxSize = 100 * 1024 * 1024; // 100MB

        return in_array($file->getMimeType(), $allowedMimeTypes) && $file->getSize() <= $maxSize;
    }

    /**
     * Get video duration in seconds.
     * Note: This is a placeholder. In production, use FFmpeg or similar library.
     *
     * @param UploadedFile $file
     * @return int|null
     */
    private function getVideoDuration(UploadedFile $file): ?int
    {
        // TODO: Implement with FFmpeg
        // For now, return null
        return null;
    }
}
