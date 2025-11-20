import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../services/api';

const AdminBusinesses = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
    });

    useEffect(() => {
        if (!isAuthenticated || user?.user_type !== 'admin') {
            navigate('/');
            return;
        }
        fetchBusinesses();
    }, [isAuthenticated, user, navigate, pagination.currentPage]);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/businesses', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                },
            });

            setBusinesses(response.data.data);
            setPagination({
                currentPage: response.data.meta.current_page,
                totalPages: response.data.meta.last_page,
                perPage: response.data.meta.per_page,
            });
        } catch (error) {
            console.error('Error fetching businesses:', error);
            toast.error('Failed to load businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (businessUuid, currentStatus) => {
        try {
            await api.put(`/admin/businesses/${businessUuid}/status`, {
                is_active: !currentStatus,
            });
            toast.success('Business status updated');
            fetchBusinesses();
        } catch (error) {
            toast.error('Failed to update business status');
        }
    };

    const handleVerifyToggle = async (businessUuid, currentStatus) => {
        try {
            await api.put(`/admin/businesses/${businessUuid}/verify`, {
                is_verified: !currentStatus,
            });
            toast.success('Business verification updated');
            fetchBusinesses();
        } catch (error) {
            toast.error('Failed to update verification status');
        }
    };

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Businesses</h1>
                        <p className="text-gray-600 mt-2">View and manage all registered businesses</p>
                    </div>
                    <Button onClick={() => navigate('/admin')}>← Back to Dashboard</Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Business
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {businesses.map((business) => (
                                    <tr key={business.uuid}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={business.logo || '/placeholder-business.png'}
                                                        alt={business.business_name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {business.business_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {business.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color="blue">{business.business_type}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {business.owner?.first_name} {business.owner?.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <Badge color={business.is_active ? 'green' : 'red'}>
                                                    {business.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {business.is_verified && (
                                                    <Badge color="purple">Verified</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(business.uuid, business.is_active)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {business.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyToggle(business.uuid, business.is_verified)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                >
                                                    {business.is_verified ? 'Unverify' : 'Verify'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
                            <Button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                disabled={pagination.currentPage === 1}
                                variant="secondary"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-700">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <Button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                disabled={pagination.currentPage === pagination.totalPages}
                                variant="secondary"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </Container>
    );
};

export default AdminBusinesses;
