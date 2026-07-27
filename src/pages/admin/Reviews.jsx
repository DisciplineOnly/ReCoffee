import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Check, Trash2, Star } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

// Reviews are submitted by the public with `approved = false` and only become
// visible once an admin flips it — the storefront's SELECT policy is gated on
// that column. Before this page existed, moderation meant opening the SQL
// editor.
const FILTERS = ['pending', 'approved', 'all'];

function Stars({ value }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                />
            ))}
        </span>
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending');
    const { t } = useTranslation();

    // Deliberately holds no state itself. The sibling admin pages call a
    // setState-ing loader straight from their effect, which the react-hooks
    // rule flags as a cascading render; keeping the query pure and applying the
    // result in a callback avoids adding another instance of that.
    //
    // The "Admins can view all reviews" policy is what makes the pending queue
    // visible here at all; anon sees only approved rows.
    const queryReviews = useCallback(
        () =>
            supabase
                .from('reviews')
                .select('*, products(name_bg, slug)')
                .order('created_at', { ascending: false }),
        []
    );

    const applyResult = useCallback(({ data, error }) => {
        if (error) {
            console.error('Failed to load reviews:', error);
            // Stored as a key, not a message: `t` is a fresh function each
            // render, so depending on it here would re-run the fetch forever.
            setError('admin.reviews.load_error');
        } else {
            setError(null);
            setReviews(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;
        queryReviews().then((result) => {
            if (!cancelled) applyResult(result);
        });
        return () => {
            cancelled = true;
        };
    }, [queryReviews, applyResult]);

    const refresh = () => {
        setLoading(true);
        queryReviews().then(applyResult);
    };

    const setApproved = async (id, approved) => {
        const previous = reviews;
        setReviews(prev => prev.map(review => review.id === id ? { ...review, approved } : review));
        const { error } = await supabase.from('reviews').update({ approved }).eq('id', id);
        if (error) {
            console.error('Failed to update review:', error);
            alert(t('admin.reviews.update_error') + error.message);
            setReviews(previous);
        }
    };

    const remove = async (id) => {
        if (!window.confirm(t('admin.reviews.confirm_delete'))) return;
        const previous = reviews;
        setReviews(prev => prev.filter(review => review.id !== id));
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) {
            console.error('Failed to delete review:', error);
            alert(t('admin.reviews.delete_error') + error.message);
            setReviews(previous);
        }
    };

    const visible = reviews.filter((review) => {
        if (filter === 'pending') return !review.approved;
        if (filter === 'approved') return review.approved;
        return true;
    });

    const pendingCount = reviews.filter(review => !review.approved).length;

    if (loading) return <div className="p-12 text-center text-slate-400">{t('admin.reviews.loading')}</div>;

    return (
        <div>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">{t('admin.reviews.title')}</h1>
                    <p className="text-slate-500">
                        {t('admin.reviews.subtitle')}
                        {pendingCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                                {pendingCount}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                        {FILTERS.map(value => (
                            <option key={value} value={value}>{t(`admin.reviews.filter.${value}`)}</option>
                        ))}
                    </select>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm text-slate-600 hover:text-slate-900 transition"
                    >
                        <RefreshCw size={16} />
                        {t('admin.refresh')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{t(error)}</div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4">{t('admin.reviews.col_date')}</th>
                            <th className="px-6 py-4">{t('admin.reviews.col_product')}</th>
                            <th className="px-6 py-4">{t('admin.reviews.col_author')}</th>
                            <th className="px-6 py-4">{t('admin.reviews.col_review')}</th>
                            <th className="px-6 py-4">{t('admin.reviews.col_status')}</th>
                            <th className="px-6 py-4 text-right">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">{t('admin.reviews.empty')}</td>
                            </tr>
                        )}
                        {visible.map((review) => (
                            <tr key={review.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition align-top">
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {new Date(review.created_at).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {review.products?.name_bg ?? t('admin.reviews.unknown_product')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 break-words max-w-[14rem]">{review.author_name}</div>
                                    <Stars value={review.rating} />
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-md">
                                    {review.comment
                                        ? <p className="whitespace-pre-wrap break-words">{review.comment}</p>
                                        : <span className="text-slate-300">—</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                        review.approved
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {t(review.approved ? 'admin.reviews.status.approved' : 'admin.reviews.status.pending')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setApproved(review.id, !review.approved)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                                review.approved
                                                    ? 'border border-slate-200 text-slate-500 hover:text-slate-900'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            <Check size={14} />
                                            {t(review.approved ? 'admin.reviews.unapprove' : 'admin.reviews.approve')}
                                        </button>
                                        <button
                                            onClick={() => remove(review.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                            aria-label={t('admin.reviews.delete')}
                                            title={t('admin.reviews.delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
