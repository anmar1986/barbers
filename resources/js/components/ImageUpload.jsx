import React, { useState, useRef, useId } from 'react';

const ImageUpload = ({
    onUpload,
    maxSize = 5, // MB
    accept = "image/*",
    multiple = false,
    preview = true,
    className = "",
    id: providedId
}) => {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const autoId = useId();
    const inputId = providedId || `image-upload-${autoId}`;

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        setError('');

        // Validate files
        for (const file of files) {
            if (file.size > maxSize * 1024 * 1024) {
                setError(`File ${file.name} exceeds ${maxSize}MB`);
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError(`File ${file.name} is not an image`);
                return;
            }
        }

        // Generate previews
        if (preview) {
            const previewUrls = files.map(file => URL.createObjectURL(file));
            setPreviews(multiple ? [...previews, ...previewUrls] : previewUrls);
        }

        // Upload files
        if (onUpload) {
            setUploading(true);
            try {
                await onUpload(multiple ? files : files[0]);
            } catch (err) {
                setError(err.message || 'Upload failed');
                setPreviews([]);
            } finally {
                setUploading(false);
            }
        }
    };

    const removePreview = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
    };

    return (
        <div className={className}>
            {/* Upload Button */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
                <svg className="mx-auto h-12 w-12 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-primary-600">
                    {uploading ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                    {accept.replace('image/', '').toUpperCase()} up to {maxSize}MB
                </p>
            </div>

            <input
                ref={fileInputRef}
                id={inputId}
                name={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
                aria-label="Upload image"
            />

            {/* Error Message */}
            {error && (
                <div className="mt-3 text-sm text-error bg-error/10 rounded p-2">
                    {error}
                </div>
            )}

            {/* Image Previews */}
            {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previews.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removePreview(index)}
                                className="absolute top-2 right-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
