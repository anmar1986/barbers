import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/Container';
import api from '../../services/api';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBusinesses: 0,
        totalVideos: 0,
        totalProducts: 0,
        loading: true,
    });

    useEffect(() => {
        // Check if user is admin
        if (!isAuthenticated || user?.user_type !== 'admin') {
            navigate('/');
            return;
        }

        // Fetch statistics
        fetchStats();
    }, [isAuthenticated, user, navigate]);

    const fetchStats = async () => {
        try {
            const [usersRes, businessesRes, videosRes, productsRes] = await Promise.all([
                api.get('/admin/stats/users'),
                api.get('/admin/stats/businesses'),
                api.get('/admin/stats/videos'),
                api.get('/admin/stats/products'),
            ]);

            setStats({
                totalUsers: usersRes.data.total || 0,
                totalBusinesses: businessesRes.data.total || 0,
                totalVideos: videosRes.data.total || 0,
                totalProducts: productsRes.data.total || 0,
                loading: false,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl text-text-secondary">Loading...</div>
                </div>
            </Container>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: '👥',
            color: 'bg-blue-500',
            link: '/admin/users',
        },
        {
            title: 'Total Businesses',
            value: stats.totalBusinesses,
            icon: '🏪',
            color: 'bg-green-500',
            link: '/admin/businesses',
        },
        {
            title: 'Total Videos',
            value: stats.totalVideos,
            icon: '🎥',
            color: 'bg-purple-500',
            link: '/admin/videos',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: '📦',
            color: 'bg-orange-500',
            link: '/admin/products',
        },
    ];

    return (
        <Container>
            <div className="py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
                    <p className="text-text-secondary mt-2">Welcome back, {user?.first_name}!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(stat.link)}
                            className="bg-background rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-secondary text-sm">{stat.title}</p>
                                    <p className="text-3xl font-bold text-text-primary mt-2">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-background rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => navigate('/admin/businesses')}
                            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Manage Businesses
                        </button>
                        <button
                            onClick={() => navigate('/admin/videos')}
                            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Manage Videos
                        </button>
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Manage Products
                        </button>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AdminDashboard;
