import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Heart } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatBgn, formatEur } from '../../lib/price';
import { hasGrindOptions, isMachine, NO_GRIND } from '../../lib/categories';
import { PLACEHOLDER_IMAGE, onImageError } from '../../lib/productImage';

export default function QuickViewModal({ product, onClose }) {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [selectedGrind, setSelectedGrind] = useState('whole-bean');
    const [added, setAdded] = useState(false);

    useEffect(() => {
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

    const grindTypes = [
        { value: 'whole-bean', label: t('product.whole_bean') },
        { value: 'espresso', label: t('product.espresso') },
        { value: 'filter', label: t('product.filter') },
        { value: 'french-press', label: t('product.french_press') }
    ];

    const grindable = hasGrindOptions(product);
    const machine = isMachine(product);

    const handleAddToCart = () => {
        addToCart(product, 1, grindable ? selectedGrind : NO_GRIND);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 900);
    };

    const inWishlist = isInWishlist(product.slug);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label={t('header.nav.close')}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image */}
                    <div className="relative bg-[#F4F1EE] aspect-square md:aspect-auto">
                        <img
                            src={product.images?.[0] || PLACEHOLDER_IMAGE}
                            onError={onImageError}
                            alt={product.name}
                            className={`w-full h-full opacity-90 ${machine ? 'object-contain p-8' : 'object-cover mix-blend-multiply'}`}
                        />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
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

                    {/* Info */}
                    <div className="p-8 flex flex-col">
                        <span className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-2">
                            {product.origin}
                        </span>
                        <h3 className="font-serif text-3xl text-slate-900 mb-3">{product.name}</h3>

                        <div className="flex items-baseline gap-3 mb-4">
                            <span className="text-3xl font-bold text-brand-primary">{formatEur(product.price)}</span>
                            <span className="text-sm text-slate-400">({formatBgn(product.price)})</span>
                            {product.onSale && (
                                <s className="text-lg text-slate-400">{formatEur(product.originalPrice)}</s>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 font-light leading-relaxed mb-6 line-clamp-3">
                            {product.description}
                        </p>

                        {product.flavorNotes?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {product.flavorNotes.map((note, index) => (
                                    <span key={index} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                        {note}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Grind Select — beans only */}
                        {grindable && (
                            <>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                                    {t('product.grind_type')}
                                </h4>
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {grindTypes.map((grind) => (
                                        <button
                                            key={grind.value}
                                            onClick={() => setSelectedGrind(grind.value)}
                                            className={`px-3 py-2.5 border-2 rounded-lg transition-all text-xs font-bold ${selectedGrind === grind.value
                                                ? 'border-brand-primary bg-brand-primary/5 text-slate-900'
                                                : 'border-slate-100 text-slate-500 hover:border-brand-primary/30'
                                                }`}
                                        >
                                            {grind.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="mt-auto space-y-3">
                            <div className="flex gap-3">
                                {product.inStock ? (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={added}
                                        className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 ${added ? 'bg-green-600 text-white' : 'bg-brand-primary text-white hover:bg-slate-900'
                                            }`}
                                    >
                                        {added ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('product.added_to_cart')}
                                            </>
                                        ) : (
                                            t('product.add_to_cart')
                                        )}
                                    </button>
                                ) : (
                                    <div className="flex-1 py-3.5 px-4 bg-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest text-center rounded-lg">
                                        {t('product.out_of_stock')}
                                    </div>
                                )}
                                <button
                                    onClick={() => toggleWishlist(product.slug)}
                                    aria-label={inWishlist ? t('wishlist.remove') : t('wishlist.add')}
                                    className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all ${inWishlist ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <Link
                                to={`/shop/${product.slug}`}
                                onClick={onClose}
                                className="block text-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors py-2"
                            >
                                {t('product.view_details')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
