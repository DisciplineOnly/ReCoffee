import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { formatBgn, formatEur } from '../../lib/price';
import GrindTypeModal from '../ui/GrindTypeModal';
import { categoryBadgeKey, hasGrindOptions, isMachine, NO_GRIND } from '../../lib/categories';
import { PLACEHOLDER_IMAGE, onImageError } from '../../lib/productImage';

const CARD_BACKGROUNDS = ['bg-[#F4F1EE]', 'bg-[#EAEAEA]', 'bg-[#F0EBE5]'];

export default function ShopFavorites() {
    const { t } = useTranslation();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const [grindProduct, setGrindProduct] = useState(null);

    const featured = products.filter(p => p.featured && p.inStock).slice(0, 3);
    const favorites = featured.length >= 3 ? featured : products.filter(p => p.inStock).slice(0, 3);

    const getCategoryBadge = (category) => {
        const key = categoryBadgeKey(category);
        return key ? t(key) : category;
    };

    const handleGrindSelect = (grindType) => {
        addToCart(grindProduct, 1, grindType);
        setGrindProduct(null);
    };

    // Only beans open the grind picker; everything else goes straight to the cart.
    const handleQuickAdd = (product) => {
        if (hasGrindOptions(product)) {
            setGrindProduct(product);
            return;
        }
        addToCart(product, 1, NO_GRIND);
    };

    return (
        <section className="bg-white py-24 md:py-32">
            <div className="md:px-12 max-w-[1400px] mr-auto ml-auto pr-6 pl-6">

                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3 block">
                            {t('shop.badge')}
                        </span>
                        <h3 className="font-serif text-3xl md:text-5xl text-slate-900">{t('shop.title')}</h3>
                    </div>
                    <Link to="/shop" className="group flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-slate-900 pb-1">
                        {t('shop.cta')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-primary" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                        {favorites.map((product, index) => (
                            <Link key={product.id} to={`/shop/${product.slug}`} className="group cursor-pointer block">
                                <div className={`relative ${CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length]} aspect-[4/5] mb-6 overflow-hidden`}>
                                    <img
                                        src={product.images?.[0] || PLACEHOLDER_IMAGE}
                                        onError={onImageError}
                                        className={`w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-500 ${isMachine(product) ? 'object-contain p-8' : 'object-cover mix-blend-multiply'}`}
                                        alt={product.name}
                                    />
                                    <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                                        <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                                            {getCategoryBadge(product.category)}
                                        </span>
                                        {product.isNew && (
                                            <span className="bg-brand-secondary text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                                                {t('shop.badge_new')}
                                            </span>
                                        )}
                                        {product.onSale && (
                                            <span className="bg-brand-primary text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-serif text-xl md:text-2xl text-slate-900 group-hover:text-brand-primary transition-colors">
                                        {product.name}
                                    </h4>
                                    <div className="flex gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
                                        <span>{product.origin}</span>
                                        {product.process && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span>{product.process}</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 font-light italic">
                                        {(product.flavorNotes || []).join(', ')}
                                    </p>
                                    <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                                        <span className="text-sm font-medium flex items-baseline gap-2">
                                            {formatEur(product.price)}
                                            {product.onSale && (
                                                <s className="text-xs text-slate-400">{formatEur(product.originalPrice)}</s>
                                            )}
                                            <span className="text-xs font-normal text-slate-400">
                                                {formatBgn(product.price)}
                                            </span>
                                        </span>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleQuickAdd(product); }}
                                            aria-label={t('product.add_to_cart')}
                                            className="text-slate-400 hover:text-brand-primary transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {grindProduct && (
                <GrindTypeModal
                    product={grindProduct}
                    onSelect={handleGrindSelect}
                    onClose={() => setGrindProduct(null)}
                />
            )}
        </section>
    );
}
