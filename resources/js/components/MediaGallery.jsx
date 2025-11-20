import React, { useState } from 'react';

const MediaGallery = ({ items = [], onDelete = null }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const openLightbox = (index) => {
        setSelectedIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setSelectedIndex(null);
    };

    const navigate = (direction) => {
        if (direction === 'next') {
            setSelectedIndex((selectedIndex + 1) % items.length);
        } else {
            setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 bg-surface rounded-lg">
                <svg className="mx-auto h-12 w-12 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-text-secondary">No media yet</p>
            </div>
        );
    }

    const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="relative group cursor-pointer aspect-square"
                        onClick={() => openLightbox(index)}
                    >
                        {item.media_type === 'video' || item.type === 'video' ? (
                            <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    src={item.media_url || item.url}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={item.media_url || item.url || item.thumbnail_url}
                                alt={item.caption || 'Gallery item'}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                            <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>

                        {/* Delete Button (if onDelete provided) */}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this media?')) {
                                        onDelete(item.id || item.uuid);
                                    }
                                }}
                                className="absolute top-2 right-2 p-2 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && selectedItem && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Previous Button */}
                    {items.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('prev');
                            }}
                            className="absolute left-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Media Content */}
                    <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
                        {selectedItem.media_type === 'video' || selectedItem.type === 'video' ? (
                            <video
                                src={selectedItem.media_url || selectedItem.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[80vh] rounded-lg"
                            />
                        ) : (
                            <img
                                src={selectedItem.media_url || selectedItem.url}
                                alt={selectedItem.caption || 'Media'}
                                className="max-w-full max-h-[80vh] rounded-lg"
                            />
                        )}

                        {/* Caption */}
                        {selectedItem.caption && (
                            <p className="mt-4 text-white text-center">{selectedItem.caption}</p>
                        )}

                        {/* Counter */}
                        <p className="mt-2 text-white text-center text-sm">
                            {selectedIndex + 1} / {items.length}
                        </p>
                    </div>

                    {/* Next Button */}
                    {items.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('next');
                            }}
                            className="absolute right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

export default MediaGallery;
