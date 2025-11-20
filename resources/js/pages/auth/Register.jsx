import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_type: 'normal'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(formData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-secondary">
                        Or{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            sign in to your account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-error/10 p-4">
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-text-primary">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    autoComplete="given-name"
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-background"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-text-primary">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    autoComplete="family-name"
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-background"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-background"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="user_type" className="block text-sm font-medium text-text-primary">
                                Account Type
                            </label>
                            <select
                                id="user_type"
                                name="user_type"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-text-primary"
                                value={formData.user_type}
                                onChange={handleChange}
                            >
                                <option value="normal">Customer</option>
                                <option value="business">Business Owner</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-background"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-text-primary">
                                Confirm Password
                            </label>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                autoComplete="new-password"
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-background"
                                placeholder="Confirm Password"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-background bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
