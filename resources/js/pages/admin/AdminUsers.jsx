import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/Container';
import Button from '../../components/Button';
import api from '../../services/api';

const AdminUsers = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || user?.user_type !== 'admin') {
            navigate('/');
            return;
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [isAuthenticated, user, navigate, search, filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (filter && filter !== 'all') params.user_type = filter;

            const response = await api.get('/admin/users', { params });
            console.log('API Response:', response.data); // Debug log
            // Laravel pagination returns data in response.data.data
            if (response.data.data) {
                setUsers(response.data.data);
                setTotalUsers(response.data.total || response.data.data.length);
            } else if (Array.isArray(response.data)) {
                // In case API returns array directly
                setUsers(response.data);
                setTotalUsers(response.data.length);
            } else {
                setUsers([]);
                setTotalUsers(0);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error response:', error.response?.data); // Debug log
        } finally {
            setLoading(false);
        }
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
            <div className="py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-2">Manage all platform users</p>
                    </div>
                    <Button onClick={() => navigate('/admin')}>← Back to Dashboard</Button>
                </div>

                {/* Filters */}
                <div className="bg-background rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Search Users
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Filter by Type
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">All Users</option>
                                <option value="normal">Normal Users</option>
                                <option value="business">Business Users</option>
                                <option value="admin">Administrators</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-background rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-text-secondary">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-surface">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.profile_picture ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full"
                                                                src={user.profile_picture}
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                                                {user.first_name?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-text-primary">
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-primary">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.user_type === 'admin'
                                                        ? 'bg-red-100 text-red-800'
                                                        : user.user_type === 'business'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.user_type?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 text-sm text-text-secondary">
                    <div>Showing {users.length} of {totalUsers} users</div>
                </div>
            </div>
        </Container>
    );
};

export default AdminUsers;
