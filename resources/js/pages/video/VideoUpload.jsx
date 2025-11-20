import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { videoAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VideoUpload = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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

    const [errors, setErrors] = useState({});

    useEffect(() => {
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
        // Clear error for this field
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
            // Validate file type
            if (!file.type.startsWith('video/')) {
                setErrors({ ...errors, video_file: 'Please select a valid video file' });
                return;
            }

            // Validate file size (max 500MB)
            if (file.size > 500 * 1024 * 1024) {
                setErrors({ ...errors, video_file: 'Video file size must be less than 500MB' });
                return;
            }

            setFormData({ ...formData, video_file: file });
            setPreview({ ...preview, video: URL.createObjectURL(file) });
            setErrors({ ...errors, video_file: null });
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, thumbnail_file: 'Please select a valid image file' });
                return;
            }

            // Validate file size (max 5MB)
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
        setErrors({});

        try {
            // Step 1: Upload video file
            setUploadProgress(10);
            const videoUploadResponse = await uploadAPI.uploadVideo(
                formData.video_file,
                'videos'
            );

            const videoUrl = videoUploadResponse.data.data?.url || videoUploadResponse.data.url;

            // Step 2: Upload thumbnail if provided
            setUploadProgress(40);
            let thumbnailUrl = null;
            if (formData.thumbnail_file) {
                const thumbnailUploadResponse = await uploadAPI.uploadImage(
                    formData.thumbnail_file,
                    'thumbnails',
                    { resize_width: 640, resize_height: 360 }
                );
                thumbnailUrl = thumbnailUploadResponse.data.data?.url || thumbnailUploadResponse.data.url;
            }

            // Step 3: Create video record
            setUploadProgress(70);
            const videoData = {
                business_id: business.id,
                title: formData.title,
                description: formData.description,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            console.log('Creating video with data:', videoData);
            console.log('Business object:', business);
            await videoAPI.create(videoData);

            setUploadProgress(100);

            // Success - redirect to management page
            setTimeout(() => {
                navigate('/management', {
                    state: { message: 'Video uploaded successfully! It will be processed shortly.' }
                });
            }, 500);

        } catch (err) {
            console.error('Upload error:', err);
            setErrors({
                general: err.response?.data?.message || 'Failed to upload video. Please try again.'
            });
            setUploading(false);
            setUploadProgress(0);
        }
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
                        <span className="text-sm font-medium text-primary-600">Uploading...</span>
                        <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-text-secondary mt-2">Please wait while we upload your video...</p>
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

                    {errors.video_file && (
                        <p className="mt-2 text-sm text-error">{errors.video_file}</p>
                    )}
                </div>

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
