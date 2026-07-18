import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatBgn, formatEur } from '../../lib/price';
import GrindTypeModal from '../ui/GrindTypeModal';
import QuickViewModal from '../ui/QuickViewModal';

export default function ProductCard({ product }) {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [showGrindModal, setShowGrindModal] = useState(false);
    const [showQuickView, setShowQuickView] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        setShowGrindModal(true);
    };

    const handleGrindSelect = (grindType) => {
        addToCart(product, 1, grindType);
        setShowGrindModal(false);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        toggleWishlist(product.slug);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        setShowQuickView(true);
    };

    const getCategoryBadge = () => {
        const badges = {
            'single-origin': t('shop.badge_single'),
            'blend': t('shop.badge_blend'),
            'limited': t('shop.badge_limited'),
            'decaf': t('shop.badge_decaf'),
            'equipment': t('shop.badge_equipment')
        };
        return badges[product.category] || product.category;
    };

    const discountPercent = product.onSale
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    const inWishlist = isInWishlist(product.slug);

    const renderRoastLevel = () => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`w-1.5 h-1.5 rounded-full ${level <= product.roastLevel ? 'bg-brand-accent' : 'bg-slate-200'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Link
                to={`/shop/${product.slug}`}
                className="group block bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
                {/* Product Image */}
                <div className="relative bg-[#F4F1EE] aspect-[4/5] overflow-hidden">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                        <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                            {getCategoryBadge()}
                        </span>
                        {product.isNew && (
                            <span className="bg-brand-secondary text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                                {t('shop.badge_new')}
                            </span>
                        )}
                        {product.onSale && (
                            <span className="bg-brand-primary text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                                -{discountPercent}%
                            </span>
                        )}
                    </div>

                    {/* Wishlist Heart */}
                    <button
                        onClick={handleWishlist}
                        aria-label={inWishlist ? t('wishlist.remove') : t('wishlist.add')}
                        className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-all ${inWishlist
                            ? 'bg-brand-primary text-white'
                            : 'bg-white/90 backdrop-blur text-slate-400 hover:text-brand-primary'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick View (appears on hover) */}
                    {product.inStock && (
                        <button
                            onClick={handleQuickView}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-slate-900 hover:text-white"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {t('shopPage.quick_view')}
                        </button>
                    )}

                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider">
                                {t('product.out_of_stock')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <h3 className="font-serif text-xl text-slate-900 mb-2 group-hover:text-brand-primary transition-colors">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span>{product.origin}</span>
                        {product.process && (
                            <>
                                <span>•</span>
                                <span>{product.process}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        {renderRoastLevel()}
                        <span className="text-xs text-slate-400 uppercase tracking-wider">
                            {t('hero.roast_intensity')}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-brand-accent">
                            {formatBgn(product.price)}
                        </span>
                        <span className="text-xs text-slate-400">({formatEur(product.price)})</span>
                        {product.onSale && (
                            <s className="text-sm text-slate-400">{formatBgn(product.originalPrice)}</s>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    {product.inStock && (
                        <button
                            onClick={handleAddToCart}
                            className="mt-4 w-full bg-brand-primary text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                        >
                            {t('shopPage.add_to_cart')}
                        </button>
                    )}
                </div>
            </Link>

            {/* Grind Type Modal */}
            {showGrindModal && (
                <GrindTypeModal
                    product={product}
                    onSelect={handleGrindSelect}
                    onClose={() => setShowGrindModal(false)}
                />
            )}

            {/* Quick View Modal */}
            {showQuickView && (
                <QuickViewModal
                    product={product}
                    onClose={() => setShowQuickView(false)}
                />
            )}
        </>
    );
}
