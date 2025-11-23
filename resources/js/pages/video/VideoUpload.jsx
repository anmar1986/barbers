import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { videoAPI, uploadAPI } from '../../services/api';
import { videoUploadService } from '../../services/videoUploadService';
import { useAuth } from '../../context/AuthContext';

const VideoUpload = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [compressionSupported, setCompressionSupported] = useState(false);
    // TODO: Enable compression once FFmpeg.wasm is working
    // Requires SharedArrayBuffer which needs special COEP/COOP headers
    const [enableCompression, setEnableCompression] = useState(false);
    const abortControllerRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        hashtags: '',
        video_file: null,
        thumbnail_file: null
    });

    const [preview, setPreview] = useState({
        video: null,
        thumbnail: null
    });

    const [fileInfo, setFileInfo] = useState({
        originalSize: null,
        compressedSize: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Check if FFmpeg compression is supported
        setCompressionSupported(videoUploadService.isCompressionSupported());

        if (user?.user_type !== 'business') {
            navigate('/');
            return;
        }
        loadBusinessInfo();
    }, [user]);

    const loadBusinessInfo = async () => {
        setLoading(true);
        try {
            const response = await api.get('/my-business');
            if (response.data.data) {
                setBusiness(response.data.data);
            } else {
                setErrors({ general: 'Please create a business profile first' });
            }
        } catch (err) {
            console.error('Error loading business:', err);
            setErrors({ general: 'Failed to load business information' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                setErrors({ ...errors, video_file: 'Please select a valid video file' });
                return;
            }

            if (file.size > 500 * 1024 * 1024) {
                setErrors({ ...errors, video_file: 'Video file size must be less than 500MB' });
                return;
            }

            setFormData({ ...formData, video_file: file });
            setPreview({ ...preview, video: URL.createObjectURL(file) });
            setFileInfo({ originalSize: file.size, compressedSize: null });
            setErrors({ ...errors, video_file: null });
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, thumbnail_file: 'Please select a valid image file' });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, thumbnail_file: 'Image file size must be less than 5MB' });
                return;
            }

            setFormData({ ...formData, thumbnail_file: file });
            setPreview({ ...preview, thumbnail: URL.createObjectURL(file) });
            setErrors({ ...errors, thumbnail_file: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.video_file) {
            newErrors.video_file = 'Video file is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!business) {
            setErrors({ general: 'Business profile required' });
            return;
        }

        if (!validateForm()) {
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadStatus('Preparing...');
        setErrors({});

        abortControllerRef.current = new AbortController();

        try {
            // Step 1: Upload video using chunked upload with compression
            const uploadResult = await videoUploadService.uploadVideo(
                formData.video_file,
                api,
                {
                    directory: 'videos',
                    compress: enableCompression && compressionSupported,
                    createVideo: true,
                    businessId: business.id,
                    title: formData.title,
                    description: formData.description,
                    onProgress: (progress) => {
                        setUploadProgress(Math.round(progress * 90)); // 0-90% for video upload
                    },
                    onStatusChange: (status) => {
                        setUploadStatus(status);
                    },
                    abortController: abortControllerRef.current
                }
            );

            // Update compression info if available
            if (uploadResult.compressionResult) {
                setFileInfo(prev => ({
                    ...prev,
                    compressedSize: uploadResult.compressionResult.compressedSize
                }));
            }

            // Step 2: Upload thumbnail if provided
            setUploadProgress(92);
            setUploadStatus('Uploading thumbnail...');

            let thumbnailUrl = null;
            if (formData.thumbnail_file) {
                const thumbnailUploadResponse = await uploadAPI.uploadImage(
                    formData.thumbnail_file,
                    'thumbnails',
                    { resize_width: 640, resize_height: 360 }
                );
                thumbnailUrl = thumbnailUploadResponse.data.data?.url || thumbnailUploadResponse.data.url;

                // Update video with thumbnail if we have a video ID
                if (uploadResult.video?.uuid && thumbnailUrl) {
                    await videoAPI.update(uploadResult.video.uuid, {
                        thumbnail_url: thumbnailUrl,
                        hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
                    });
                }
            }

            setUploadProgress(100);
            setUploadStatus('Upload complete!');

            // Success - redirect to management page
            setTimeout(() => {
                navigate('/management', {
                    state: { message: 'Video uploaded successfully! It will be processed shortly.' }
                });
            }, 1000);

        } catch (err) {
            console.error('Upload error:', err);

            if (err.message === 'Upload cancelled') {
                setUploadStatus('Upload cancelled');
            } else {
                setErrors({
                    general: err.response?.data?.message || err.message || 'Failed to upload video. Please try again.'
                });
            }
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-warning bg-opacity-10 border border-warning rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Profile Required</h2>
                    <p className="text-gray-600 mb-4">You need to create a business profile before uploading videos.</p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Create Business Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Upload Video</h1>
                <p className="mt-2 text-text-secondary">Share your work with the community</p>
            </div>

            {errors.general && (
                <div className="mb-6 rounded-md bg-error/10 border border-error p-4">
                    <p className="text-sm text-error">{errors.general}</p>
                </div>
            )}

            {uploading && (
                <div className="mb-6 bg-primary-50 border border-primary-600 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary-600">{uploadStatus}</span>
                        <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                                uploadProgress < 50 && enableCompression ? 'bg-orange-500' : 'bg-primary-600'
                            }`}
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-text-secondary">
                            {uploadProgress < 50 && enableCompression
                                ? 'Compressing video for optimal quality...'
                                : 'Uploading in chunks for reliability...'}
                        </p>
                        <button
                            onClick={handleCancelUpload}
                            className="text-sm text-error hover:text-error/80"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Upload */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Video File *</h2>

                    {!preview.video ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <label className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-primary-600">
                                    Click to upload video
                                </span>
                                <span className="mt-1 block text-xs text-text-secondary">
                                    MP4, MOV, AVI up to 500MB
                                </span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <video
                                    src={preview.video}
                                    controls
                                    className="w-full rounded-lg"
                                    style={{ maxHeight: '400px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, video_file: null });
                                        setPreview({ ...preview, video: null });
                                        setFileInfo({ originalSize: null, compressedSize: null });
                                    }}
                                    disabled={uploading}
                                    className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/80 disabled:opacity-50"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* File size info */}
                            {fileInfo.originalSize && (
                                <div className="flex items-center gap-2 text-sm bg-surface rounded-lg px-4 py-2">
                                    <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                    <span className="text-text-secondary">
                                        Original: {formatFileSize(fileInfo.originalSize)}
                                    </span>
                                    {fileInfo.compressedSize && (
                                        <>
                                            <span className="text-text-secondary">→</span>
                                            <span className="text-success font-medium">
                                                {formatFileSize(fileInfo.compressedSize)}
                                            </span>
                                            <span className="text-success text-xs">
                                                (saved {((1 - fileInfo.compressedSize / fileInfo.originalSize) * 100).toFixed(0)}%)
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {errors.video_file && (
                        <p className="mt-2 text-sm text-error">{errors.video_file}</p>
                    )}
                </div>

                {/* Compression Option */}
                {compressionSupported && formData.video_file && (
                    <div className="bg-background rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <div>
                                    <h3 className="font-medium text-text-primary">Video Compression</h3>
                                    <p className="text-xs text-text-secondary">
                                        Automatically compress video for faster uploads and optimal quality
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enableCompression}
                                    onChange={(e) => setEnableCompression(e.target.checked)}
                                    disabled={uploading}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Video Details */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Video Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Give your video a catchy title"
                                maxLength="255"
                                disabled={uploading}
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-error">{errors.title}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your video..."
                                rows="4"
                                disabled={uploading}
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Hashtags
                            </label>
                            <input
                                type="text"
                                name="hashtags"
                                value={formData.hashtags}
                                onChange={handleInputChange}
                                placeholder="haircut, fade, barber (comma separated)"
                                disabled={uploading}
                                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                            <p className="mt-1 text-xs text-text-secondary">
                                Separate hashtags with commas. Do not include the # symbol.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Thumbnail (Optional)</h2>

                    {!preview.thumbnail ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <svg className="mx-auto h-10 w-10 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <label className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-primary-600">
                                    Click to upload thumbnail
                                </span>
                                <span className="mt-1 block text-xs text-text-secondary">
                                    PNG, JPG up to 5MB (Optional - we'll auto-generate one if not provided)
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="relative">
                            <img
                                src={preview.thumbnail}
                                alt="Thumbnail preview"
                                className="w-full rounded-lg"
                                style={{ maxHeight: '300px', objectFit: 'cover' }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, thumbnail_file: null });
                                    setPreview({ ...preview, thumbnail: null });
                                }}
                                disabled={uploading}
                                className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/80 disabled:opacity-50"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {errors.thumbnail_file && (
                        <p className="mt-2 text-sm text-error">{errors.thumbnail_file}</p>
                    )}
                </div>

                {/* Upload Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Professional Upload Features:</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                                <li>Videos are automatically compressed for optimal quality</li>
                                <li>Chunked upload ensures reliable delivery even on slow connections</li>
                                <li>Upload can be resumed if interrupted</li>
                                <li>Server-side processing generates thumbnails and optimizes video</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/management')}
                        disabled={uploading}
                        className="flex-1 px-6 py-3 border-2 border-border text-text-primary font-semibold rounded-md hover:bg-surface disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={uploading || !formData.video_file}
                        className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoUpload;
