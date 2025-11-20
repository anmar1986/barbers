import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Container from '../../components/Container';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../services/api';

const Favorites = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, business, video, product
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [isAuthenticated, navigate, activeTab, pagination.currentPage]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
            };

            if (activeTab !== 'all') {
                params.type = activeTab;
            }

            const response = await api.get('/favorites', { params });

            setFavorites(response.data.data);
            setPagination({
                currentPage: response.data.meta.current_page,
                totalPages: response.data.meta.last_page,
            });
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (favoriteId) => {
        if (!confirm('Are you sure you want to remove this from favorites?')) {
            return;
        }

        try {
            await api.delete(`/favorites/${favoriteId}`);
            toast.success('Removed from favorites');
            fetchFavorites();
        } catch (error) {
            toast.error('Failed to remove favorite');
        }
    };

    const handleItemClick = (favorite) => {
        const type = favorite.favoritable_type.split('\\').pop().toLowerCase();

        if (type === 'business') {
            navigate(`/businesses/${favorite.favoritable.uuid}`);
        } else if (type === 'video') {
            navigate(`/videos/${favorite.favoritable.uuid}`);
        } else if (type === 'product') {
            navigate(`/products/${favorite.favoritable.uuid}`);
        }
    };

    const getItemType = (favoritableType) => {
        return favoritableType.split('\\').pop().toLowerCase();
    };

    const renderFavoriteItem = (favorite) => {
        const type = getItemType(favorite.favoritable_type);
        const item = favorite.favoritable;

        if (!item) {
            return null;
        }

        return (
            <Card key={favorite.id} padding="sm">
                <div className="flex gap-4">
                    {/* Image */}
                    <div className="shrink-0 w-32 h-32">
                        <img
                            src={
                                type === 'business'
                                    ? item.logo_url || '/placeholder-business.png'
                                    : type === 'video'
                                    ? item.thumbnail_url || '/placeholder-video.png'
                                    : item.images?.[0]?.image_url || '/placeholder-product.png'
                            }
                            alt={item.business_name || item.title || item.name}
                            className="w-full h-full object-cover rounded-lg cursor-pointer"
                            onClick={() => handleItemClick(favorite)}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <Badge color="blue" size="sm" className="mb-2">
                                    {type}
                                </Badge>
                                <h3
                                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
                                    onClick={() => handleItemClick(favorite)}
                                >
                                    {item.business_name || item.title || item.name}
                                </h3>
                            </div>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleRemoveFavorite(favorite.id)}
                            >
                                Remove
                            </Button>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.description || item.bio || 'No description available'}
                        </p>

                        {/* Additional info based on type */}
                        {type === 'business' && (
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{item.category}</span>
                                {item.is_verified && (
                                    <Badge color="green" size="sm">
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        )}

                        {type === 'video' && (
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>👁️ {item.view_count || 0} views</span>
                                <span>❤️ {item.likes_count || 0} likes</span>
                            </div>
                        )}

                        {type === 'product' && (
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-primary-600 font-semibold">
                                    ${item.price}
                                </span>
                                {item.stock_quantity > 0 ? (
                                    <Badge color="green" size="sm">
                                        In Stock
                                    </Badge>
                                ) : (
                                    <Badge color="red" size="sm">
                                        Out of Stock
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
                    <p className="text-gray-600">Items you've saved for later</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    {['all', 'business', 'video', 'product'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setPagination({ ...pagination, currentPage: 1 });
                            }}
                            className={`px-4 py-2 font-medium capitalize transition-colors ${
                                activeTab === tab
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab === 'all' ? 'All Items' : `${tab}s`}
                        </button>
                    ))}
                </div>

                {/* Favorites List */}
                {favorites.length > 0 ? (
                    <div className="space-y-4">
                        {favorites.map((favorite) => renderFavoriteItem(favorite))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💔</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No favorites yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start exploring and save items you love
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => navigate('/businesses')}>
                                Browse Businesses
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/videos')}>
                                Watch Videos
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/shop')}>
                                Shop Products
                            </Button>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center">
                        <Button
                            onClick={() =>
                                setPagination({
                                    ...pagination,
                                    currentPage: pagination.currentPage - 1,
                                })
                            }
                            disabled={pagination.currentPage === 1}
                            variant="secondary"
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                            onClick={() =>
                                setPagination({
                                    ...pagination,
                                    currentPage: pagination.currentPage + 1,
                                })
                            }
                            disabled={pagination.currentPage === pagination.totalPages}
                            variant="secondary"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default Favorites;
