import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../ui/LoadingSpinner';

function Stars({ value, size = 'w-4 h-4', interactive = false, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = interactive ? star <= (hover || value) : star <= Math.round(value);
                const StarEl = (
                    <Star
                        className={`${size} ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
                    />
                );
                return interactive ? (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`${star}/5`}
                    >
                        {StarEl}
                    </button>
                ) : (
                    <span key={star}>{StarEl}</span>
                );
            })}
        </div>
    );
}

export default function ProductReviews({ productId }) {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'

    const fetchReviews = useCallback(async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        if (!error && data) {
            setReviews(data);
        }
        setLoading(false);
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const average = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = t('forms.required_field');
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setStatus('loading');
        const { error } = await supabase.from('reviews').insert({
            product_id: productId,
            author_name: form.name.trim(),
            rating: form.rating,
            comment: form.comment.trim() || null,
        });
        if (error) {
            console.error('Review submission failed:', error);
            setStatus('error');
        } else {
            setStatus('success');
            setForm({ name: '', rating: 5, comment: '' });
            setShowForm(false);
            fetchReviews();
        }
    };

    return (
        <section className="mt-20 pt-12 border-t border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="font-serif text-3xl text-slate-900 mb-2">{t('reviews.title')}</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Stars value={average} size="w-5 h-5" />
                            <span className="text-sm text-slate-500 font-medium">
                                {average.toFixed(1)} · {t('reviews.count').replace('{{count}}', reviews.length)}
                            </span>
                        </div>
                    )}
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setShowForm(true); setStatus(null); }}
                        className="px-6 py-3 border-2 border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors rounded-lg self-start md:self-auto"
                    >
                        {t('reviews.write_review')}
                    </button>
                )}
            </div>

            {status === 'success' && (
                <p className="mb-8 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                    {t('reviews.success')}
                </p>
            )}

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#F8F9FA] rounded-2xl p-6 md:p-8 mb-10 space-y-5 border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('reviews.your_name')} *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => { setForm(prev => ({ ...prev, name: e.target.value })); setErrors({}); }}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('reviews.your_rating')} *</label>
                            <div className="py-2.5">
                                <Stars
                                    value={form.rating}
                                    size="w-7 h-7"
                                    interactive
                                    onChange={(rating) => setForm(prev => ({ ...prev, rating }))}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('reviews.your_comment')}</label>
                        <textarea
                            value={form.comment}
                            onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows="4"
                            placeholder={t('reviews.comment_placeholder')}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                    {status === 'error' && <p className="text-sm text-red-600">{t('reviews.error')}</p>}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border-2 border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors rounded-lg"
                        >
                            {t('checkout.back')}
                        </button>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="px-8 py-3 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors rounded-lg disabled:opacity-60 flex items-center gap-2"
                        >
                            {status === 'loading' ? <LoadingSpinner size="sm" color="white" /> : t('reviews.submit')}
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" color="primary" />
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-slate-400 font-light py-8">{t('reviews.no_reviews')}</p>
            ) : (
                <ul className="space-y-6">
                    {reviews.map((review) => (
                        <li key={review.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center font-bold uppercase">
                                        {review.author_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{review.author_name}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(review.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <Stars value={review.rating} />
                            </div>
                            {review.comment && (
                                <p className="text-sm text-slate-600 font-light leading-relaxed">{review.comment}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
