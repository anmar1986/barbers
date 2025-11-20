import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BusinessList from './pages/BusinessList';
import BusinessDetail from './pages/business/BusinessDetail';
import VideoFeed from './pages/VideoFeed';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessEditForm from './pages/BusinessEditForm';
import ServiceManagement from './pages/ServiceManagement';
import VideoUpload from './pages/video/VideoUpload';
import Favorites from './pages/user/Favorites';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';
import BusinessAnalytics from './pages/BusinessAnalytics';
import BusinessHours from './pages/BusinessHours';
import VideoManagement from './pages/VideoManagement';
import VideoDetail from './pages/VideoDetail';
import VideoFeedVertical from './pages/VideoFeedVertical';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminVideos from './pages/admin/AdminVideos';
import AdminProducts from './pages/admin/AdminProducts';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import '../css/app.css';

// Protected Route Component for Business Owners
const BusinessOwnerRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.user_type !== 'business') {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600">You must be a business owner to access this page.</p>
            </div>
        );
    }

    return children;
};

// Protected Route Component for Admins
const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.user_type !== 'admin') {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600">You must be an administrator to access this page.</p>
            </div>
        );
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="businesses" element={<BusinessList />} />
                        <Route path="businesses/:uuid" element={<BusinessDetail />} />
                        <Route path="barbers" element={<BusinessList />} />
                        <Route path="barbers/:uuid" element={<BusinessDetail />} />
                        <Route path="beauty" element={<BusinessList />} />
                        <Route path="beauty/:uuid" element={<BusinessDetail />} />
                        <Route path="videos" element={<VideoFeed />} />
                        <Route path="videos/vertical" element={<VideoFeedVertical />} />
                        <Route path="videos/:uuid" element={<VideoDetail />} />
                        <Route path="shop" element={<ProductList />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/:uuid" element={<ProductDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="favorites" element={<Favorites />} />
                        <Route path="notifications" element={<Notifications />} />

                        {/* Business Owner Routes */}
                        <Route path="management" element={
                            <BusinessOwnerRoute>
                                <BusinessDashboard />
                            </BusinessOwnerRoute>
                        } />
                        <Route path="management/edit" element={
                            <BusinessOwnerRoute>
                                <BusinessEditForm />
                            </BusinessOwnerRoute>
                        } />
                        <Route path="management/services" element={
                            <BusinessOwnerRoute>
                                <ServiceManagement />
                            </BusinessOwnerRoute>
                        } />
                        <Route path="management/hours" element={
                            <BusinessOwnerRoute>
                                <BusinessHours />
                            </BusinessOwnerRoute>
                        } />
                        <Route path="management/videos" element={
                            <BusinessOwnerRoute>
                                <VideoManagement />
                            </BusinessOwnerRoute>
                        } />
                        <Route path="videos/upload" element={
                            <BusinessOwnerRoute>
                                <VideoUpload />
                            </BusinessOwnerRoute>
                        } />
                        <Route path="management/analytics" element={
                            <BusinessOwnerRoute>
                                <BusinessAnalytics />
                            </BusinessOwnerRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="admin" element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } />
                        <Route path="admin/users" element={
                            <AdminRoute>
                                <AdminUsers />
                            </AdminRoute>
                        } />
                        <Route path="admin/businesses" element={
                            <AdminRoute>
                                <AdminBusinesses />
                            </AdminRoute>
                        } />
                        <Route path="admin/videos" element={
                            <AdminRoute>
                                <AdminVideos />
                            </AdminRoute>
                        } />
                        <Route path="admin/products" element={
                            <AdminRoute>
                                <AdminProducts />
                            </AdminRoute>
                        } />
                    </Route>
                </Routes>
            </ToastProvider>
        </AuthProvider>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
