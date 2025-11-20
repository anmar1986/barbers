import React, { useEffect, useRef, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Google Maps Component
 * Displays an interactive map with business location markers
 *
 * Usage:
 * <GoogleMap
 *   businesses={[{lat, lng, name, uuid}]}
 *   center={{lat, lng}}
 *   zoom={12}
 * />
 */
const GoogleMap = ({
    businesses = [],
    center = { lat: 40.7128, lng: -74.0060 }, // Default: New York
    zoom = 12,
    height = '500px',
    onMarkerClick = null,
    apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
}) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load Google Maps Script
    useEffect(() => {
        if (!apiKey) {
            setError('Google Maps API key not configured');
            setLoading(false);
            return;
        }

        // Check if script already loaded
        if (window.google && window.google.maps) {
            setLoading(false);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => setLoading(false));
        script.addEventListener('error', () => {
            setError('Failed to load Google Maps');
            setLoading(false);
        });
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, [apiKey]);

    // Initialize Map
    useEffect(() => {
        if (loading || error || !window.google || !mapRef.current) return;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ],
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: false,
            zoomControl: true,
        });

        setMap(mapInstance);
    }, [loading, error, center, zoom]);

    // Add Markers
    useEffect(() => {
        if (!map || !window.google) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));

        // Create new markers
        const newMarkers = businesses.map(business => {
            const marker = new window.google.maps.Marker({
                position: { lat: business.latitude || business.lat, lng: business.longitude || business.lng },
                map,
                title: business.business_name || business.name,
                animation: window.google.maps.Animation.DROP,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#1E40AF',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                }
            });

            // Info Window
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px; max-width: 200px;">
                        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">
                            ${business.business_name || business.name}
                        </h3>
                        ${business.business_type ? `
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280; text-transform: capitalize;">
                                ${business.business_type.replace('_', ' ')}
                            </p>
                        ` : ''}
                        ${business.average_rating ? `
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">
                                ⭐ ${business.average_rating.toFixed(1)} (${business.total_reviews || 0} reviews)
                            </p>
                        ` : ''}
                        ${business.uuid ? `
                            <a href="/businesses/${business.uuid}"
                               style="display: inline-block; padding: 6px 12px; background: #1E40AF; color: white;
                                      text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">
                                View Details
                            </a>
                        ` : ''}
                    </div>
                `
            });

            marker.addListener('click', () => {
                // Close all other info windows
                markers.forEach(m => {
                    if (m.infoWindow) m.infoWindow.close();
                });

                infoWindow.open(map, marker);

                if (onMarkerClick) {
                    onMarkerClick(business);
                }
            });

            marker.infoWindow = infoWindow;

            return marker;
        });

        setMarkers(newMarkers);

        // Fit bounds to show all markers
        if (newMarkers.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            newMarkers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });
            map.fitBounds(bounds);

            // Set max zoom if only one marker
            if (newMarkers.length === 1) {
                map.setZoom(15);
            }
        }
    }, [map, businesses, onMarkerClick]);

    if (error) {
        return (
            <div
                className="bg-gray-100 rounded-lg flex items-center justify-center"
                style={{ height }}
            >
                <div className="text-center p-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-600 font-medium">{error}</p>
                    <p className="text-gray-500 text-sm mt-2">Please configure Google Maps API key in .env</p>
                    <pre className="text-xs bg-gray-200 p-2 rounded mt-2 text-left">
                        VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
                    </pre>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className="bg-gray-100 rounded-lg flex items-center justify-center"
                style={{ height }}
            >
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div
            ref={mapRef}
            className="rounded-lg overflow-hidden shadow-md"
            style={{ height }}
        />
    );
};

export default GoogleMap;
