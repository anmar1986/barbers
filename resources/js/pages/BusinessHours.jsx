import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Container from '../components/Container';
import Button from '../components/Button';

const BusinessHours = () => {
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hours, setHours] = useState([]);

    const daysOfWeek = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
    ];

    useEffect(() => {
        if (!isAuthenticated || user?.user_type !== 'business') {
            navigate('/');
            return;
        }
        fetchBusinessHours();
    }, [isAuthenticated, user, navigate]);

    const fetchBusinessHours = async () => {
        try {
            setLoading(true);
            const response = await api.get('/my-business/hours');

            // If no hours exist, create default hours
            if (!response.data.data || response.data.data.length === 0) {
                const defaultHours = daysOfWeek.map(day => ({
                    day_of_week: day.value,
                    open_time: '09:00',
                    close_time: '17:00',
                    is_closed: false
                }));
                setHours(defaultHours);
            } else {
                // Convert database time format (HH:MM:SS) to input format (HH:MM)
                const formattedHours = response.data.data.map(hour => ({
                    day_of_week: hour.day_of_week,
                    open_time: hour.open_time ? hour.open_time.substring(0, 5) : '09:00',
                    close_time: hour.close_time ? hour.close_time.substring(0, 5) : '17:00',
                    is_closed: hour.is_closed || false
                }));
                setHours(formattedHours);
            }
        } catch (error) {
            console.error('Error fetching business hours:', error);
            showError('Failed to load business hours');
            // Set default hours on error
            const defaultHours = daysOfWeek.map(day => ({
                day_of_week: day.value,
                open_time: '09:00',
                close_time: '17:00',
                is_closed: false
            }));
            setHours(defaultHours);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (dayOfWeek, field, value) => {
        setHours(prevHours => {
            const newHours = [...prevHours];
            const dayIndex = newHours.findIndex(h => h.day_of_week === dayOfWeek);

            // Ensure time is in HH:MM format (remove seconds if present)
            const formattedValue = value && value.includes(':') ? value.substring(0, 5) : value;

            if (dayIndex >= 0) {
                newHours[dayIndex] = {
                    ...newHours[dayIndex],
                    [field]: formattedValue
                };
            } else {
                newHours.push({
                    day_of_week: dayOfWeek,
                    open_time: field === 'open_time' ? formattedValue : '09:00',
                    close_time: field === 'close_time' ? formattedValue : '17:00',
                    is_closed: field === 'is_closed' ? formattedValue : false
                });
            }

            return newHours;
        });
    };

    const handleToggleClosed = (dayOfWeek) => {
        setHours(prevHours => {
            const newHours = [...prevHours];
            const dayIndex = newHours.findIndex(h => h.day_of_week === dayOfWeek);

            if (dayIndex >= 0) {
                newHours[dayIndex] = {
                    ...newHours[dayIndex],
                    is_closed: !newHours[dayIndex].is_closed
                };
            } else {
                newHours.push({
                    day_of_week: dayOfWeek,
                    open_time: '09:00',
                    close_time: '17:00',
                    is_closed: true
                });
            }

            return newHours;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clean the data - only send required fields
        const cleanedHours = hours.map(hour => ({
            day_of_week: hour.day_of_week,
            open_time: hour.is_closed ? null : hour.open_time,
            close_time: hour.is_closed ? null : hour.close_time,
            is_closed: hour.is_closed || false
        }));

        // Log the data being sent
        console.log('Submitting hours:', JSON.stringify(cleanedHours, null, 2));

        try {
            setSaving(true);
            const response = await api.put('/my-business/hours', { hours: cleanedHours });
            console.log('Response:', response.data);
            showSuccess('Business hours updated successfully');
            // Refresh the data to get updated records
            fetchBusinessHours();
        } catch (error) {
            console.error('Error updating business hours:', error);
            console.error('Error response:', error.response?.data);
            showError(error.response?.data?.message || 'Failed to update business hours');
        } finally {
            setSaving(false);
        }
    };

    const getDayHours = (dayOfWeek) => {
        const hourData = hours.find(h => h.day_of_week === dayOfWeek) || {
            day_of_week: dayOfWeek,
            open_time: '09:00',
            close_time: '17:00',
            is_closed: false
        };

        // Convert HH:MM:SS to HH:MM for time inputs
        return {
            ...hourData,
            open_time: hourData.open_time ? hourData.open_time.substring(0, 5) : '09:00',
            close_time: hourData.close_time ? hourData.close_time.substring(0, 5) : '17:00'
        };
    };

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl text-text-secondary">Loading...</div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="max-w-4xl mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Business Hours</h1>
                        <p className="text-text-secondary mt-2">Set your business operating hours</p>
                    </div>
                    <Button onClick={() => navigate('/management')}>
                        ← Back to Dashboard
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-background rounded-lg shadow-md p-6">
                        <div className="space-y-4">
                            {daysOfWeek.map(day => {
                                const dayHours = getDayHours(day.value);
                                const isClosed = dayHours.is_closed;

                                return (
                                    <div key={day.value} className="border-b border-border pb-4 last:border-0">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            {/* Day Name */}
                                            <div className="md:col-span-3">
                                                <label className="text-sm font-medium text-text-primary">
                                                    {day.label}
                                                </label>
                                            </div>

                                            {/* Open Time */}
                                            <div className="md:col-span-3">
                                                <input
                                                    type="time"
                                                    value={dayHours.open_time}
                                                    onChange={(e) => handleTimeChange(day.value, 'open_time', e.target.value)}
                                                    disabled={isClosed}
                                                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Close Time */}
                                            <div className="md:col-span-3">
                                                <input
                                                    type="time"
                                                    value={dayHours.close_time}
                                                    onChange={(e) => handleTimeChange(day.value, 'close_time', e.target.value)}
                                                    disabled={isClosed}
                                                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Closed Toggle */}
                                            <div className="md:col-span-3 flex items-center justify-end">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isClosed}
                                                        onChange={() => handleToggleClosed(day.value)}
                                                        className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
                                                    />
                                                    <span className="ml-2 text-sm text-text-secondary">Closed</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/management')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Hours'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Container>
    );
};

export default BusinessHours;
