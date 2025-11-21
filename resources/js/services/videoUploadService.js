import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// FFmpeg core files are in public/ffmpeg/ folder (loaded at runtime, not imported)
const FFMPEG_BASE_URL = '/ffmpeg';

const CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5MB chunks (fits within PHP's 2MB default limit)
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max

class VideoUploadService {
    constructor() {
        this.ffmpeg = null;
        this.ffmpegLoaded = false;
        this.ffmpegLoading = false;
    }

    /**
     * Load FFmpeg.wasm for browser-side video compression
     */
    async loadFFmpeg(onProgress) {
        if (this.ffmpegLoaded) return;
        if (this.ffmpegLoading) {
            // Wait for existing load to complete
            while (this.ffmpegLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        this.ffmpegLoading = true;

        try {
            this.ffmpeg = new FFmpeg();

            this.ffmpeg.on('log', ({ message }) => {
                console.log('[FFmpeg]', message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                if (onProgress) {
                    onProgress(progress);
                }
            });

            // Load FFmpeg core from local public/ffmpeg folder
            // toBlobURL fetches the file and creates a blob URL (avoids import issues)
            const coreURL = await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.js`, 'text/javascript');
            const wasmURL = await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');

            await this.ffmpeg.load({
                coreURL,
                wasmURL,
            });

            this.ffmpegLoaded = true;
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            throw new Error('Failed to initialize video compression. Please try again.');
        } finally {
            this.ffmpegLoading = false;
        }
    }

    /**
     * Compress video using FFmpeg.wasm in the browser
     */
    async compressVideo(file, onProgress) {
        if (!this.ffmpegLoaded) {
            await this.loadFFmpeg();
        }

        const inputName = 'input' + this.getExtension(file.name);
        const outputName = 'output.mp4';

        try {
            // Write input file to FFmpeg virtual filesystem
            await this.ffmpeg.writeFile(inputName, await fetchFile(file));

            // Compress video with optimal settings for web
            // - CRF 28: Good balance of quality and size
            // - preset: medium for reasonable encoding speed
            // - scale: max 1280 width while maintaining aspect ratio
            // - audio: AAC 128k
            await this.ffmpeg.exec([
                '-i', inputName,
                '-c:v', 'libx264',
                '-crf', '28',
                '-preset', 'medium',
                '-vf', 'scale=min(1280\\,iw):-2',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                '-y', outputName
            ]);

            // Read compressed file
            const data = await this.ffmpeg.readFile(outputName);

            // Cleanup
            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            // Create blob from compressed data
            const blob = new Blob([data.buffer], { type: 'video/mp4' });

            return {
                file: new File([blob], 'compressed_video.mp4', { type: 'video/mp4' }),
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: (file.size / blob.size).toFixed(2),
                savedPercentage: ((1 - blob.size / file.size) * 100).toFixed(1)
            };
        } catch (error) {
            console.error('Video compression failed:', error);
            throw new Error('Video compression failed. Uploading original file instead.');
        }
    }

    /**
     * Initialize chunked upload session
     */
    async initializeUpload(file, api) {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        const response = await api.post('/upload/chunked/init', {
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type || 'video/mp4',
            chunk_size: CHUNK_SIZE
        });

        return response.data.data;
    }

    /**
     * Upload a single chunk
     */
    async uploadChunk(uploadId, chunkIndex, chunk, api) {
        const formData = new FormData();
        formData.append('upload_id', uploadId);
        formData.append('chunk_index', chunkIndex.toString());
        // Create a proper Blob with video mime type
        const chunkBlob = new Blob([chunk], { type: 'application/octet-stream' });
        formData.append('chunk', chunkBlob, `chunk_${chunkIndex}.bin`);

        try {
            const response = await api.post('/upload/chunked/chunk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data;
        } catch (error) {
            console.error('Chunk upload failed:', {
                chunkIndex,
                chunkSize: chunk.size || chunk.byteLength,
                error: error.response?.data || error.message
            });
            throw error;
        }
    }

    /**
     * Complete chunked upload
     */
    async completeUpload(uploadId, directory, api, options = {}) {
        const response = await api.post('/upload/chunked/complete', {
            upload_id: uploadId,
            directory: directory,
            create_video: options.createVideo || false,
            business_id: options.businessId,
            title: options.title,
            description: options.description
        });

        return response.data.data;
    }

    /**
     * Get upload status for resume capability
     */
    async getUploadStatus(uploadId, api) {
        const response = await api.get(`/upload/chunked/status/${uploadId}`);
        return response.data.data;
    }

    /**
     * Cancel an upload
     */
    async cancelUpload(uploadId, api) {
        try {
            await api.delete(`/upload/chunked/cancel/${uploadId}`);
        } catch (error) {
            console.error('Failed to cancel upload:', error);
        }
    }

    /**
     * Upload video with compression and chunked upload
     */
    async uploadVideo(file, api, options = {}) {
        const {
            directory = 'videos',
            onProgress,
            onStatusChange,
            compress = true,
            createVideo = false,
            businessId,
            title,
            description,
            abortController
        } = options;

        let videoFile = file;
        let compressionResult = null;

        // Step 1: Compress video (if enabled and FFmpeg is available)
        if (compress) {
            try {
                onStatusChange?.('Initializing compression...');
                await this.loadFFmpeg((progress) => {
                    onProgress?.(progress * 0.1); // 0-10% for loading FFmpeg
                    onStatusChange?.('Loading compression engine...');
                });

                onStatusChange?.('Compressing video...');
                compressionResult = await this.compressVideo(file, (progress) => {
                    onProgress?.(0.1 + progress * 0.4); // 10-50% for compression
                    onStatusChange?.(`Compressing video... ${Math.round(progress * 100)}%`);
                });

                videoFile = compressionResult.file;
                onStatusChange?.(`Compression complete! Saved ${compressionResult.savedPercentage}%`);
            } catch (error) {
                console.warn('Compression failed, uploading original:', error);
                onStatusChange?.('Compression unavailable, uploading original...');
            }
        }

        // Step 2: Initialize chunked upload
        onStatusChange?.('Initializing upload...');
        const uploadSession = await this.initializeUpload(videoFile, api);
        const { upload_id: uploadId, total_chunks: totalChunks, chunk_size: chunkSize } = uploadSession;

        // Step 3: Upload chunks
        const baseProgress = compress ? 0.5 : 0; // Start at 50% if compressed
        const progressRange = compress ? 0.45 : 0.95; // 50-95% if compressed, 0-95% if not

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            // Check if upload was cancelled
            if (abortController?.signal?.aborted) {
                await this.cancelUpload(uploadId, api);
                throw new Error('Upload cancelled');
            }

            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, videoFile.size);
            const chunk = videoFile.slice(start, end);

            const chunkProgress = (chunkIndex + 1) / totalChunks;
            onProgress?.(baseProgress + chunkProgress * progressRange);
            onStatusChange?.(`Uploading chunk ${chunkIndex + 1}/${totalChunks}...`);

            await this.uploadChunk(uploadId, chunkIndex, chunk, api);
        }

        // Step 4: Complete upload
        onProgress?.(0.97);
        onStatusChange?.('Finalizing upload...');

        const result = await this.completeUpload(uploadId, directory, api, {
            createVideo,
            businessId,
            title,
            description
        });

        onProgress?.(1);
        onStatusChange?.('Upload complete!');

        return {
            ...result,
            compressionResult
        };
    }

    /**
     * Resume a failed upload
     */
    async resumeUpload(file, uploadId, api, options = {}) {
        const {
            directory = 'videos',
            onProgress,
            onStatusChange,
            createVideo = false,
            businessId,
            title,
            description
        } = options;

        // Get current upload status
        const status = await this.getUploadStatus(uploadId, api);

        if (status.is_complete) {
            throw new Error('Upload is already complete');
        }

        // Find missing chunks
        const allChunks = Array.from({ length: status.total_chunks }, (_, i) => i);
        const missingChunks = allChunks.filter(i => !status.uploaded_chunks.includes(i));

        onStatusChange?.(`Resuming upload... ${missingChunks.length} chunks remaining`);

        // Upload missing chunks
        for (let i = 0; i < missingChunks.length; i++) {
            const chunkIndex = missingChunks[i];
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const progress = (status.uploaded_chunks.length + i + 1) / status.total_chunks;
            onProgress?.(progress * 0.95);
            onStatusChange?.(`Uploading chunk ${chunkIndex + 1}/${status.total_chunks}...`);

            await this.uploadChunk(uploadId, chunkIndex, chunk, api);
        }

        // Complete upload
        onProgress?.(0.97);
        onStatusChange?.('Finalizing upload...');

        const result = await this.completeUpload(uploadId, directory, api, {
            createVideo,
            businessId,
            title,
            description
        });

        onProgress?.(1);
        onStatusChange?.('Upload complete!');

        return result;
    }

    /**
     * Get file extension
     */
    getExtension(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return ext ? `.${ext}` : '.mp4';
    }

    /**
     * Check if FFmpeg.wasm is supported in this browser
     */
    isCompressionSupported() {
        return typeof SharedArrayBuffer !== 'undefined';
    }
}

// Export singleton instance
export const videoUploadService = new VideoUploadService();

// Export class for testing
export default VideoUploadService;
