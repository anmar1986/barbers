<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChunkedUploadService
{
    private string $chunkDirectory = 'chunks';

    /**
     * Initialize a new chunked upload session
     */
    public function initializeUpload(string $fileName, int $totalSize, int $totalChunks, string $mimeType): array
    {
        $uploadId = Str::uuid()->toString();

        // Create chunk directory for this upload
        $chunkPath = $this->getChunkPath($uploadId);
        Storage::disk('local')->makeDirectory($chunkPath);

        // Store upload metadata
        $metadata = [
            'upload_id' => $uploadId,
            'file_name' => $fileName,
            'total_size' => $totalSize,
            'total_chunks' => $totalChunks,
            'mime_type' => $mimeType,
            'uploaded_chunks' => [],
            'created_at' => now()->toIso8601String(),
            'expires_at' => now()->addHours(24)->toIso8601String(),
        ];

        Storage::disk('local')->put(
            $chunkPath.'/metadata.json',
            json_encode($metadata, JSON_PRETTY_PRINT)
        );

        return $metadata;
    }

    /**
     * Store a chunk
     */
    public function storeChunk(string $uploadId, int $chunkIndex, $chunkData): array
    {
        $chunkPath = $this->getChunkPath($uploadId);
        $metadataPath = $chunkPath.'/metadata.json';

        // Verify upload exists
        if (! Storage::disk('local')->exists($metadataPath)) {
            throw new \Exception('Upload session not found or expired');
        }

        $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

        // Validate chunk index
        if ($chunkIndex < 0 || $chunkIndex >= $metadata['total_chunks']) {
            throw new \Exception('Invalid chunk index');
        }

        // Check if chunk already uploaded
        if (in_array($chunkIndex, $metadata['uploaded_chunks'])) {
            return [
                'message' => 'Chunk already uploaded',
                'chunk_index' => $chunkIndex,
                'uploaded_chunks' => count($metadata['uploaded_chunks']),
                'total_chunks' => $metadata['total_chunks'],
                'is_complete' => false,
            ];
        }

        // Store the chunk
        $chunkFileName = sprintf('chunk_%05d', $chunkIndex);
        Storage::disk('local')->put($chunkPath.'/'.$chunkFileName, $chunkData);

        // Update metadata
        $metadata['uploaded_chunks'][] = $chunkIndex;
        sort($metadata['uploaded_chunks']);
        Storage::disk('local')->put($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT));

        $isComplete = count($metadata['uploaded_chunks']) === $metadata['total_chunks'];

        return [
            'message' => 'Chunk uploaded successfully',
            'chunk_index' => $chunkIndex,
            'uploaded_chunks' => count($metadata['uploaded_chunks']),
            'total_chunks' => $metadata['total_chunks'],
            'is_complete' => $isComplete,
        ];
    }

    /**
     * Complete the upload by assembling all chunks
     */
    public function completeUpload(string $uploadId, string $destinationDirectory): array
    {
        $chunkPath = $this->getChunkPath($uploadId);
        $metadataPath = $chunkPath.'/metadata.json';

        if (! Storage::disk('local')->exists($metadataPath)) {
            throw new \Exception('Upload session not found or expired');
        }

        $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

        // Verify all chunks are uploaded
        if (count($metadata['uploaded_chunks']) !== $metadata['total_chunks']) {
            $missing = array_diff(
                range(0, $metadata['total_chunks'] - 1),
                $metadata['uploaded_chunks']
            );
            throw new \Exception('Missing chunks: '.implode(', ', $missing));
        }

        // Generate final filename
        $extension = pathinfo($metadata['file_name'], PATHINFO_EXTENSION);
        $finalFileName = Str::uuid()->toString().'.'.$extension;
        $finalPath = $destinationDirectory.'/'.$finalFileName;

        // Create destination directory if needed
        Storage::disk('public')->makeDirectory($destinationDirectory);

        // Assemble chunks into final file
        $finalFilePath = Storage::disk('public')->path($finalPath);
        $outputFile = fopen($finalFilePath, 'wb');

        if (! $outputFile) {
            throw new \Exception('Failed to create output file');
        }

        try {
            for ($i = 0; $i < $metadata['total_chunks']; $i++) {
                $chunkFileName = sprintf('chunk_%05d', $i);
                $chunkContent = Storage::disk('local')->get($chunkPath.'/'.$chunkFileName);
                fwrite($outputFile, $chunkContent);
            }
        } finally {
            fclose($outputFile);
        }

        // Verify file size
        $actualSize = filesize($finalFilePath);
        if ($actualSize !== $metadata['total_size']) {
            Storage::disk('public')->delete($finalPath);
            throw new \Exception("File size mismatch. Expected: {$metadata['total_size']}, Got: {$actualSize}");
        }

        // Clean up chunks
        $this->cleanupUpload($uploadId);

        return [
            'message' => 'Upload completed successfully',
            'file_name' => $finalFileName,
            'file_path' => $finalPath,
            'file_url' => Storage::disk('public')->url($finalPath),
            'file_size' => $actualSize,
            'mime_type' => $metadata['mime_type'],
        ];
    }

    /**
     * Get upload status
     */
    public function getUploadStatus(string $uploadId): array
    {
        $chunkPath = $this->getChunkPath($uploadId);
        $metadataPath = $chunkPath.'/metadata.json';

        if (! Storage::disk('local')->exists($metadataPath)) {
            throw new \Exception('Upload session not found or expired');
        }

        $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

        return [
            'upload_id' => $metadata['upload_id'],
            'file_name' => $metadata['file_name'],
            'total_size' => $metadata['total_size'],
            'total_chunks' => $metadata['total_chunks'],
            'uploaded_chunks' => $metadata['uploaded_chunks'],
            'progress' => round((count($metadata['uploaded_chunks']) / $metadata['total_chunks']) * 100, 2),
            'is_complete' => count($metadata['uploaded_chunks']) === $metadata['total_chunks'],
            'expires_at' => $metadata['expires_at'],
        ];
    }

    /**
     * Cancel and cleanup an upload
     */
    public function cancelUpload(string $uploadId): bool
    {
        return $this->cleanupUpload($uploadId);
    }

    /**
     * Clean up expired uploads (should be called via scheduled task)
     */
    public function cleanupExpiredUploads(): int
    {
        $cleaned = 0;
        $directories = Storage::disk('local')->directories($this->chunkDirectory);

        foreach ($directories as $dir) {
            $metadataPath = $dir.'/metadata.json';

            if (Storage::disk('local')->exists($metadataPath)) {
                $metadata = json_decode(Storage::disk('local')->get($metadataPath), true);

                if (isset($metadata['expires_at']) && now()->gt($metadata['expires_at'])) {
                    Storage::disk('local')->deleteDirectory($dir);
                    $cleaned++;
                }
            }
        }

        return $cleaned;
    }

    /**
     * Get the chunk storage path for an upload
     */
    private function getChunkPath(string $uploadId): string
    {
        return $this->chunkDirectory.'/'.$uploadId;
    }

    /**
     * Clean up chunk files for an upload
     */
    private function cleanupUpload(string $uploadId): bool
    {
        $chunkPath = $this->getChunkPath($uploadId);

        return Storage::disk('local')->deleteDirectory($chunkPath);
    }
}
