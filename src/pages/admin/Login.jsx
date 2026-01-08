import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Coffee, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/admin/products');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
            {/* Left Side - Brand */}
            <div className="hidden md:flex flex-col justify-center items-center bg-brand-primary text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                <div className="relative z-10 text-center">
                    <Coffee size={64} className="mx-auto mb-6" />
                    <h1 className="text-4xl font-serif font-bold mb-4">ReCaffe</h1>
                    <p className="text-white/80 text-lg max-w-md">Administrative Dashboard</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-20">
                <div className="max-w-md w-full mx-auto">
                    <div className="md:hidden text-center mb-8">
                        <Coffee size={40} className="mx-auto text-brand-primary mb-3" />
                        <h1 className="text-2xl font-serif font-bold text-slate-800">ReCaffe Admin</h1>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                    <p className="text-slate-500 mb-8">Please sign in to your account</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors outline-none"
                                placeholder="admin@recaffe.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold tracking-wide hover:bg-brand-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
