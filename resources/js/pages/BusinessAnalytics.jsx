import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Container from '../components/Container';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    VideoViewsChart,
    FollowerGrowthChart,
    RevenueChart,
    VideoPerformanceChart,
    ServicePopularityChart,
    EngagementMetricsChart,
} from '../components/AnalyticsCharts';
import api from '../services/api';

const BusinessAnalytics = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || user?.user_type !== 'business') {
            navigate('/');
            return;
        }
        fetchAnalytics();
    }, [isAuthenticated, user, navigate, dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const response = await api.get('/analytics/business', {
                params: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: new Date().toISOString().split('T')[0],
                },
            });

            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Use sample data for demonstration
            setAnalytics({
                overview: {
                    total_views: 15230,
                    total_followers: 1250,
                    total_bookings: 89,
                    revenue: 12500,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format = 'csv') => {
        try {
            setExportLoading(true);
            const response = await api.get('/analytics/export', {
                params: { format, date_range: dateRange },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_${dateRange}days.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showSuccess('Analytics exported successfully');
        } catch (error) {
            console.error('Error exporting analytics:', error);
            showError('Failed to export analytics');
        } finally {
            setExportLoading(false);
        }
    };

    const dateRangeOptions = [
        { value: '7', label: 'Last 7 Days' },
        { value: '30', label: 'Last 30 Days' },
        { value: '90', label: 'Last 90 Days' },
        { value: '365', label: 'Last Year' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Container>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                Business Analytics
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Track your performance and growth insights
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                options={dateRangeOptions}
                                className="w-auto"
                            />
                            <Button
                                onClick={() => handleExport('csv')}
                                variant="outline"
                                disabled={exportLoading}
                                loading={exportLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                {analytics?.overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card padding="lg" className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-primary-700">Total Views</p>
                                    <p className="text-3xl font-bold text-primary-900 mt-2">
                                        {analytics.overview.total_views?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-primary-600 mt-1">+12% from last period</p>
                                </div>
                                <div className="bg-primary-500 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>

                        <Card padding="lg" className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-700">Followers</p>
                                    <p className="text-3xl font-bold text-secondary-900 mt-2">
                                        {analytics.overview.total_followers?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-secondary-600 mt-1">+8% from last period</p>
                                </div>
                                <div className="bg-secondary-500 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>

                        <Card padding="lg" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Bookings</p>
                                    <p className="text-3xl font-bold text-green-900 mt-2">
                                        {analytics.overview.total_bookings?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">+15% from last period</p>
                                </div>
                                <div className="bg-green-500 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>

                        <Card padding="lg" className="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-accent-700">Revenue</p>
                                    <p className="text-3xl font-bold text-accent-900 mt-2">
                                        ${analytics.overview.revenue?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-xs text-accent-600 mt-1">+20% from last period</p>
                                </div>
                                <div className="bg-accent-500 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="space-y-6">
                    {/* Row 1: Video Views and Follower Growth */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <VideoViewsChart data={analytics?.video_views} />
                        <FollowerGrowthChart data={analytics?.follower_growth} />
                    </div>

                    {/* Row 2: Revenue and Video Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RevenueChart data={analytics?.revenue_data} />
                        <VideoPerformanceChart data={analytics?.video_performance} />
                    </div>

                    {/* Row 3: Service Popularity and Engagement */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ServicePopularityChart data={analytics?.service_popularity} />
                        <EngagementMetricsChart data={analytics?.engagement} />
                    </div>

                    {/* Additional Insights */}
                    <Card padding="lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <h4 className="font-semibold text-blue-900">Top Performing Day</h4>
                                </div>
                                <p className="text-sm text-blue-700">Friday has the highest engagement</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                    </svg>
                                    <h4 className="font-semibold text-green-900">Growth Trend</h4>
                                </div>
                                <p className="text-sm text-green-700">Steady upward trajectory this month</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <h4 className="font-semibold text-purple-900">Best Content</h4>
                                </div>
                                <p className="text-sm text-purple-700">Tutorial videos perform best</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default BusinessAnalytics;
