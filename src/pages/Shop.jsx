import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import ProductCard from '../components/shop/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';
import { useSEO } from '../hooks/useSEO';

const VALID_CATEGORIES = ['single-origin', 'blend', 'limited'];

export default function Shop() {
    const { t } = useTranslation();
    const { products, loading: isLoading } = useProducts();
    const [searchParams, setSearchParams] = useSearchParams();
    useSEO({
        title: t('shopPage.title'),
        description: 'Магазинът на ReCoffee — специални кафета на зърна: единични произходи, смеси и лимитирани серии с доставка в цяла България.',
    });

    const searchQuery = (searchParams.get('q') || '').trim();
    const categoryParam = searchParams.get('category');

    const [filters, setFilters] = useState({
        category: VALID_CATEGORIES.includes(categoryParam) ? [categoryParam] : [],
        roastLevel: [],
        inStockOnly: false
    });
    const [sortBy, setSortBy] = useState('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Keep category filter in sync with URL deep-links (footer/nav)
    useEffect(() => {
        if (VALID_CATEGORIES.includes(categoryParam)) {
            setFilters(prev =>
                prev.category.length === 1 && prev.category[0] === categoryParam
                    ? prev
                    : { ...prev, category: [categoryParam] }
            );
        }
    }, [categoryParam]);

    const clearSearch = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('q');
        setSearchParams(next, { replace: true });
    };

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Search query filter (from the header search overlay)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => {
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
        }

        // Category filter
        if (filters.category.length > 0) {
            filtered = filtered.filter(p => filters.category.includes(p.category));
        }

        // Roast level filter
        if (filters.roastLevel.length > 0) {
            filtered = filtered.filter(p => filters.roastLevel.includes(p.roastLevel));
        }

        // In stock filter
        if (filters.inStockOnly) {
            filtered = filtered.filter(p => p.inStock);
        }

        // Sort products
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                // Assuming products are already in newest-first order
                break;
            case 'featured':
            default:
                filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }

        return filtered;
    }, [filters, sortBy, products, searchQuery]);

    const toggleCategory = (category) => {
        setFilters(prev => ({
            ...prev,
            category: prev.category.includes(category)
                ? prev.category.filter(c => c !== category)
                : [...prev.category, category]
        }));
    };

    const toggleRoastLevel = (level) => {
        setFilters(prev => ({
            ...prev,
            roastLevel: prev.roastLevel.includes(level)
                ? prev.roastLevel.filter(l => l !== level)
                : [...prev.roastLevel, level]
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: [],
            roastLevel: [],
            inStockOnly: false
        });
    };

    const FilterSidebar = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">{t('shopPage.filters')}</h3>
                <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-brand-primary hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                    {t('shopPage.clear_filters')}
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                    {t('shopPage.category')}
                </h4>
                <div className="space-y-3">
                    {['single-origin', 'blend', 'limited'].map(category => (
                        <label key={category} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.category.includes(category)}
                                onChange={() => toggleCategory(category)}
                                className="w-5 h-5 text-brand-primary border-slate-200 rounded-lg focus:ring-brand-primary transition-all group-hover:border-brand-primary/50"
                            />
                            <span className={`text-sm font-medium transition-colors ${filters.category.includes(category) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                {t(`shop.badge_${category.replace('-', '_')}`)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Roast Level Filter */}
            <div className="mb-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                    {t('shopPage.roast_level')}
                </h4>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(level => (
                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={filters.roastLevel.includes(level)}
                                onChange={() => toggleRoastLevel(level)}
                                className="w-5 h-5 text-brand-primary border-slate-200 rounded-lg focus:ring-brand-primary transition-all group-hover:border-brand-primary/50"
                            />
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${i < level
                                            ? (filters.roastLevel.includes(level) ? 'bg-brand-accent' : 'bg-brand-accent/40 group-hover:bg-brand-accent/60')
                                            : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* In Stock Filter */}
            <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={filters.inStockOnly}
                        onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                        className="w-5 h-5 text-brand-primary border-slate-200 rounded-lg focus:ring-brand-primary transition-all group-hover:border-brand-primary/50"
                    />
                    <span className={`text-sm font-medium transition-colors ${filters.inStockOnly ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {t('shopPage.in_stock')}
                    </span>
                </label>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-24 animate-in fade-in duration-700">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-4 font-bold">
                            {t('shopPage.title')}
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide">
                            {t('shopPage.showing_results').replace('{{count}}', filteredProducts.length)}
                        </p>
                        {searchQuery && (
                            <div className="mt-3 inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-4 pr-2 py-1.5">
                                <span className="text-sm text-slate-600">
                                    {t('shopPage.search_results_for').replace('{{query}}', searchQuery)}
                                </span>
                                <button
                                    onClick={clearSearch}
                                    aria-label={t('shopPage.clear_search')}
                                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Desktop Sort Dropdown */}
                    <div className="hidden lg:block">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t('shopPage.sort_by')}</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 cursor-pointer hover:text-brand-primary transition-colors pr-8 bg-no-repeat bg-[right_center] appearance-none"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1em' }}
                            >
                                <option value="featured">{t('shopPage.sort_featured')}</option>
                                <option value="price-asc">{t('shopPage.sort_price_asc')}</option>
                                <option value="price-desc">{t('shopPage.sort_price_desc')}</option>
                                <option value="name">{t('shopPage.sort_name')}</option>
                                <option value="newest">{t('shopPage.sort_newest')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Desktop Filters Sidebar */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Mobile Filter Button & Sort */}
                        <div className="flex items-center justify-between mb-8 lg:hidden">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-sm border border-slate-100"
                            >
                                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                                {t('shopPage.filters')}
                            </button>

                            {/* Sort Dropdown for Mobile */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-sm"
                            >
                                <option value="featured">{t('shopPage.sort_featured')}</option>
                                <option value="price-asc">{t('shopPage.sort_price_asc')}</option>
                                <option value="price-desc">{t('shopPage.sort_price_desc')}</option>
                                <option value="name">{t('shopPage.sort_name')}</option>
                                <option value="newest">{t('shopPage.sort_newest')}</option>
                            </select>
                        </div>

                        {/* Products Content */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-up duration-500">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-2xl font-serif text-slate-400 mb-6">{t('shopPage.no_products')}</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-8 py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-brand-primary/20"
                                >
                                    {t('shopPage.clear_filters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Filters Modal */}
                {showMobileFilters && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in">
                        <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white p-8 overflow-y-auto animate-in slide-in-from-right duration-500">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                                    {t('shopPage.filters')}
                                </h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <FilterSidebar />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
