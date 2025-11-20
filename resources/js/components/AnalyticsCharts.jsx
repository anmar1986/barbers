import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Card from './Card';

/**
 * Analytics Charts Component
 * Displays various analytics charts for business dashboard
 */

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm text-gray-600">
                        {entry.name}: <span className="font-semibold" style={{ color: entry.color }}>
                            {entry.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Video Views Over Time Chart
export const VideoViewsChart = ({ data = [] }) => {
    // Sample data if none provided
    const sampleData = data.length > 0 ? data : [
        { date: 'Mon', views: 120 },
        { date: 'Tue', views: 150 },
        { date: 'Wed', views: 180 },
        { date: 'Thu', views: 220 },
        { date: 'Fri', views: 300 },
        { date: 'Sat', views: 280 },
        { date: 'Sun', views: 250 },
    ];

    return (
        <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Views (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sampleData}>
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#1E40AF"
                        fillOpacity={1}
                        fill="url(#colorViews)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

// Follower Growth Chart
export const FollowerGrowthChart = ({ data = [] }) => {
    const sampleData = data.length > 0 ? data : [
        { month: 'Jan', followers: 100 },
        { month: 'Feb', followers: 150 },
        { month: 'Mar', followers: 200 },
        { month: 'Apr', followers: 280 },
        { month: 'May', followers: 350 },
        { month: 'Jun', followers: 420 },
    ];

    return (
        <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follower Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="followers"
                        stroke="#7C3AED"
                        strokeWidth={3}
                        dot={{ fill: '#7C3AED', r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

// Revenue/Bookings Chart
export const RevenueChart = ({ data = [] }) => {
    const sampleData = data.length > 0 ? data : [
        { month: 'Jan', revenue: 1200, bookings: 15 },
        { month: 'Feb', revenue: 1900, bookings: 22 },
        { month: 'Mar', revenue: 2400, bookings: 28 },
        { month: 'Apr', revenue: 2100, bookings: 25 },
        { month: 'May', revenue: 2800, bookings: 32 },
        { month: 'Jun', revenue: 3200, bookings: 38 },
    ];

    return (
        <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Bookings</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="left" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue ($)" />
                    <Bar yAxisId="right" dataKey="bookings" fill="#F59E0B" name="Bookings" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

// Video Performance Distribution
export const VideoPerformanceChart = ({ data = [] }) => {
    const sampleData = data.length > 0 ? data : [
        { name: 'High Performing', value: 12, color: '#10B981' },
        { name: 'Average', value: 25, color: '#F59E0B' },
        { name: 'Low Performing', value: 8, color: '#EF4444' },
    ];

    return (
        <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Performance Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={sampleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {sampleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

// Service Popularity Chart
export const ServicePopularityChart = ({ data = [] }) => {
    const sampleData = data.length > 0 ? data : [
        { service: 'Haircut', bookings: 45 },
        { service: 'Shave', bookings: 28 },
        { service: 'Beard Trim', bookings: 35 },
        { service: 'Hair Color', bookings: 18 },
        { service: 'Styling', bookings: 22 },
    ].sort((a, b) => b.bookings - a.bookings);

    return (
        <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Services</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis dataKey="service" type="category" stroke="#6B7280" style={{ fontSize: '12px' }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bookings" fill="#7C3AED" radius={[0, 8, 8, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

// Engagement Metrics Chart
export const EngagementMetricsChart = ({ data = [] }) => {
    const sampleData = data.length > 0 ? data : [
        { date: 'Mon', likes: 45, comments: 12, shares: 8 },
        { date: 'Tue', likes: 52, comments: 15, shares: 10 },
        { date: 'Wed', likes: 61, comments: 18, shares: 12 },
        { date: 'Thu', likes: 58, comments: 20, shares: 15 },
        { date: 'Fri', likes: 70, comments: 25, shares: 18 },
        { date: 'Sat', likes: 85, comments: 30, shares: 22 },
        { date: 'Sun', likes: 78, comments: 28, shares: 20 },
    ];

    return (
        <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default {
    VideoViewsChart,
    FollowerGrowthChart,
    RevenueChart,
    VideoPerformanceChart,
    ServicePopularityChart,
    EngagementMetricsChart,
};
