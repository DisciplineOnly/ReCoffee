import React, { useState, useMemo } from 'react';
import { useTranslation } from '../lib/translations';
import ProductCard from '../components/shop/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import products from '../data/products.json';

export default function Shop() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        category: [],
        priceRange: [0, 100],
        roastLevel: [],
        inStockOnly: false
    });
    const [sortBy, setSortBy] = useState('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Category filter
        if (filters.category.length > 0) {
            filtered = filtered.filter(p => filters.category.includes(p.category));
        }

        // Price range filter
        filtered = filtered.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

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
    }, [filters, sortBy]);

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
            priceRange: [0, 100],
            roastLevel: [],
            inStockOnly: false
        });
    };

    const FilterSidebar = () => (
        <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold uppercase tracking-wider">{t('shopPage.filters')}</h3>
                <button
                    onClick={clearFilters}
                    className="text-xs text-brand-secondary hover:text-brand-primary transition-colors"
                >
                    {t('shopPage.clear_filters')}
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                    {t('shopPage.category')}
                </h4>
                <div className="space-y-2">
                    {['single-origin', 'blend', 'limited'].map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.category.includes(category)}
                                onChange={() => toggleCategory(category)}
                                className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                            />
                            <span className="text-sm text-slate-700">
                                {t(`shop.badge_${category.replace('-', '_')}`)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Roast Level Filter */}
            <div className="mb-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                    {t('shopPage.roast_level')}
                </h4>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.roastLevel.includes(level)}
                                onChange={() => toggleRoastLevel(level)}
                                className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                            />
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < level ? 'bg-brand-accent' : 'bg-slate-200'
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
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.inStockOnly}
                        onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                        className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                    />
                    <span className="text-sm text-slate-700">{t('shopPage.in_stock')}</span>
                </label>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F6F4F2] py-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-2">
                        {t('shopPage.title')}
                    </h1>
                    <p className="text-slate-600">
                        {filteredProducts.length} {t('shopPage.showing_results').replace('{{count}}', filteredProducts.length)}
                    </p>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters Sidebar */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Mobile Filter Button & Sort */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {t('shopPage.filters')}
                            </button>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="featured">{t('shopPage.sort_featured')}</option>
                                <option value="price-asc">{t('shopPage.sort_price_asc')}</option>
                                <option value="price-desc">{t('shopPage.sort_price_desc')}</option>
                                <option value="name">{t('shopPage.sort_name')}</option>
                                <option value="newest">{t('shopPage.sort_newest')}</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-xl text-slate-500">{t('shopPage.no_products')}</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-brand-primary hover:text-brand-secondary transition-colors"
                                >
                                    {t('shopPage.clear_filters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Filters Modal */}
                {showMobileFilters && (
                    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold uppercase tracking-wider">
                                    {t('shopPage.filters')}
                                </h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="text-slate-400 hover:text-slate-900"
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
