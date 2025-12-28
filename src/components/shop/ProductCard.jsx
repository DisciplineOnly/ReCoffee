import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';
import GrindTypeModal from '../ui/GrindTypeModal';

export default function ProductCard({ product }) {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const [showGrindModal, setShowGrindModal] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        setShowGrindModal(true);
    };

    const handleGrindSelect = (grindType) => {
        addToCart(product, 1, grindType);
        setShowGrindModal(false);
    };

    const getCategoryBadge = () => {
        const badges = {
            'single-origin': t('shop.badge_single'),
            'blend': t('shop.badge_blend'),
            'limited': t('shop.badge_limited')
        };
        return badges[product.category] || product.category;
    };

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

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                            {getCategoryBadge()}
                        </span>
                    </div>

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

                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-brand-accent">
                            {product.price.toFixed(2)} {product.currency === 'BGN' ? 'лв' : product.currency}
                        </span>
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
        </>
    );
}
