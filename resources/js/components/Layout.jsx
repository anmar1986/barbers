import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from './Container';
import NotificationBell from './NotificationBell';

const Layout = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const navItems = [
        {
            name: 'Videos',
            path: '/videos',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Barbers',
            path: '/barbers',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            name: 'Beauty',
            path: '/beauty',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            )
        },
        {
            name: 'Shop',
            path: '/shop',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Container size="xl" className="min-h-screen flex flex-col lg:flex-row">
                {/* Left Sidebar */}
                <aside className={`shrink-0 bg-white shadow-lg transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${sidebarOpen ? 'w-full lg:w-64' : 'w-full lg:w-20'}`}>
                {/* Logo/Brand */}
                <div className="flex items-center justify-between px-4 py-4 lg:py-6 border-b border-border">
                    {sidebarOpen ? (
                        <Link to="/" className="text-lg lg:text-xl font-bold text-primary-600">
                            Barber Social
                        </Link>
                    ) : (
                        <Link to="/" className="text-lg lg:text-xl font-bold text-primary-600">
                            BS
                        </Link>
                    )}
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md hover:bg-surface"
                        >
                            <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-2 lg:px-3 py-4 lg:py-6 space-y-1 lg:space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-2 lg:px-3 py-2 lg:py-3 rounded-lg transition-colors ${
                                isActive(item.path)
                                    ? 'bg-primary-600 text-white'
                                    : 'text-primary hover:bg-surface'
                            }`}
                        >
                            <span className={`${sidebarOpen ? 'mr-2 lg:mr-3' : 'mx-auto'}`}>{item.icon}</span>
                            {sidebarOpen && <span className="font-medium text-sm lg:text-base">{item.name}</span>}
                        </Link>
                    ))}

                    {/* Profile Dropdown (only for authenticated users) */}
                    {isAuthenticated && (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className={`w-full flex items-center px-2 lg:px-3 py-2 lg:py-3 rounded-lg transition-colors ${
                                    isActive('/profile') || isActive('/management')
                                        ? 'bg-primary-600 text-white'
                                        : 'text-primary hover:bg-surface'
                                }`}
                            >
                                <span className={`${sidebarOpen ? 'mr-2 lg:mr-3' : 'mx-auto'}`}>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                {sidebarOpen && <span className="font-medium text-sm lg:text-base">Profile</span>}
                                {sidebarOpen && (
                                    <svg className={`ml-auto h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && sidebarOpen && (
                                <div className="mt-1 ml-2 pl-8 space-y-1">
                                    <div className="px-3 py-2 text-sm">
                                        <p className="font-medium text-text-primary">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs text-text-secondary capitalize">
                                            {user?.user_type?.replace('_', ' ')}
                                        </p>
                                    </div>

                                    <Link
                                        to="/favorites"
                                        className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-lg"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Favorites
                                    </Link>

                                    <Link
                                        to="/notifications"
                                        className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-lg"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        Notifications
                                    </Link>

                                    {user?.user_type === 'business' && (
                                        <Link
                                            to="/management"
                                            className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-lg"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Management
                                        </Link>
                                    )}

                                    {user?.user_type === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-surface rounded-lg"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Login/Register Section (for non-authenticated users) */}
                {!isAuthenticated && (
                    <div className="border-t border-border px-3 py-4">
                        <div className={`space-y-2 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
                            <Link
                                to="/login"
                                className={`flex items-center justify-center px-3 py-2 text-sm font-medium text-primary hover:bg-surface rounded-lg ${!sidebarOpen && 'w-full'}`}
                            >
                                {sidebarOpen ? 'Login' : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                )}
                            </Link>
                            <Link
                                to="/register"
                                className={`flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg ${!sidebarOpen && 'w-full'}`}
                            >
                                {sidebarOpen ? 'Sign Up' : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                )}
                            </Link>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                <main className="flex-1 bg-gray-50">
                    <div className="py-4 px-3 sm:py-6 sm:px-4 lg:py-8 lg:px-8">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-border">
                    <div className="py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
                        <p className="text-center text-xs sm:text-sm text-secondary">
                            © 2025 Barber Social Platform. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
            </Container>
        </div>
    );
};

export default Layout;
