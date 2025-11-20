import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../services/api';

const AdminProducts = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [products, setProducts] = useState([]);
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
        fetchProducts();
    }, [isAuthenticated, user, navigate, pagination.currentPage]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/products', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                },
            });

            setProducts(response.data.data);
            setPagination({
                currentPage: response.data.meta.current_page,
                totalPages: response.data.meta.last_page,
                perPage: response.data.meta.per_page,
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productUuid, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            await api.delete(`/admin/products/${productUuid}`);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
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
                        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
                        <p className="text-gray-600 mt-2">View and manage all products</p>
                    </div>
                    <Button onClick={() => navigate('/admin')}>← Back to Dashboard</Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Business
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
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
                                {products.map((product) => (
                                    <tr key={product.uuid}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded object-cover"
                                                        src={product.images?.[0]?.image_url || '/placeholder-product.png'}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        SKU: {product.sku}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.business?.business_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={product.stock_quantity > 10 ? 'green' : product.stock_quantity > 0 ? 'yellow' : 'red'}>
                                                {product.stock_quantity} units
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={product.is_active ? 'green' : 'red'}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(product.uuid, product.name)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
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

export default AdminProducts;
