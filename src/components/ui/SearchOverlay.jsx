import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../lib/price';

export default function SearchOverlay({ onClose }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { products } = useProducts();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return products.filter(p => {
            const haystack = [
                p.name,
                p.nameEn,
                p.origin,
                p.process,
                p.category,
                p.description,
                ...(p.flavorNotes || [])
            ].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(q);
        });
    }, [query, products]);

    const goToProduct = (slug) => {
        onClose();
        navigate(`/shop/${slug}`);
    };

    const goToAll = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        onClose();
        navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-top duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="max-w-3xl mx-auto px-6 py-8">
                    {/* Input Row */}
                    <form onSubmit={goToAll} className="flex items-center gap-4 border-b-2 border-slate-900 pb-4 mb-6">
                        <Search className="w-6 h-6 text-brand-primary flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('search.placeholder')}
                            className="w-full text-lg md:text-2xl font-serif outline-none placeholder:text-slate-300 text-slate-900 bg-transparent"
                        />
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('header.nav.close')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Results */}
                    {!query.trim() ? (
                        <p className="text-sm text-slate-400 pb-4">{t('search.hint')}</p>
                    ) : results.length === 0 ? (
                        <p className="text-sm text-slate-400 pb-4">{t('search.no_results')}</p>
                    ) : (
                        <div className="pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                {t('search.results_count').replace('{{count}}', results.length)}
                            </p>
                            <ul className="divide-y divide-slate-100">
                                {results.slice(0, 6).map(product => (
                                    <li key={product.slug}>
                                        <button
                                            onClick={() => goToProduct(product.slug)}
                                            className="w-full flex items-center gap-4 py-4 text-left hover:bg-slate-50 transition-colors px-2 rounded-lg group"
                                        >
                                            <div className="w-14 h-14 bg-[#F4F1EE] rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-serif text-lg text-slate-900 group-hover:text-brand-primary transition-colors truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">{product.origin}</p>
                                            </div>
                                            <span className="text-sm font-bold text-brand-accent whitespace-nowrap">
                                                {formatPrice(product.price)}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={goToAll}
                                className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-brand-primary transition-colors"
                            >
                                {t('search.view_all')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
