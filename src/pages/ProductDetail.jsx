import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, Check, Heart } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';
import { useWishlist } from '../contexts/WishlistContext';
import { useSEO } from '../hooks/useSEO';
import { formatBgn, formatEur } from '../lib/price';
import ProductReviews from '../components/shop/ProductReviews';
import { categoryBadgeKey, hasGrindOptions, isMachine, NO_GRIND } from '../lib/categories';
import { PLACEHOLDER_IMAGE, onImageError } from '../lib/productImage';
import { productSchema, breadcrumbSchema } from '../lib/structuredData';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const { products, loading: productsLoading } = useProducts();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [selectedGrind, setSelectedGrind] = useState('whole-bean');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const product = products.find(p => p.slug === id);

    useSEO({
        title: product ? product.name : undefined,
        description: product ? `${product.name} — ${product.origin || ''}. ${(product.description || '').slice(0, 150)}` : undefined,
        image: product?.images?.[0],
        type: 'product',
        jsonLd: product
            ? [
                productSchema(product),
                breadcrumbSchema([
                    { name: t('common.home'), path: '/' },
                    { name: t('shopPage.title'), path: '/shop' },
                    { name: product.name, path: `/shop/${product.slug}` },
                ]),
            ]
            : undefined,
    });

    if (!product && !productsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-serif text-slate-900 mb-4">{t('product.not_found')}</h1>
                    <Link to="/shop" className="text-brand-primary hover:text-brand-secondary">
                        {t('product.back_to_shop')}
                    </Link>
                </div>
            </div>
        );
    }

    if (productsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="lg" color="primary" />
            </div>
        );
    }

    const grindTypes = [
        { value: 'whole-bean', label: t('product.whole_bean'), icon: '🫘' },
        { value: 'espresso', label: t('product.espresso'), icon: '☕' },
        { value: 'filter', label: t('product.filter'), icon: '🫖' },
        { value: 'french-press', label: t('product.french_press'), icon: '🫗' }
    ];

    const grindable = hasGrindOptions(product);
    const machine = isMachine(product);
    const badgeKey = categoryBadgeKey(product.category);

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        addToCart(product, quantity, grindable ? selectedGrind : NO_GRIND);
        setIsAdding(false);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const renderRoastLevel = () => {
        return (
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${level <= product.roastLevel ? 'bg-brand-accent' : 'bg-slate-200'
                            }`}
                    />
                ))}
                <span className="text-sm text-slate-600 ml-2">
                    {t('hero.roast_intensity')}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-primary transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm uppercase tracking-wider font-bold">{t('checkout.back')}</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                    {/* Product Image */}
                    <div className="relative group">
                        <div className="aspect-square bg-[#F4F1EE] rounded-2xl overflow-hidden">
                            <img
                                src={product.images?.[0] || PLACEHOLDER_IMAGE}
                                onError={onImageError}
                                alt={product.name}
                                className={`w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-700 ${machine ? 'object-contain p-10' : 'object-cover mix-blend-multiply'}`}
                            />
                        </div>

                        {/* Badges */}
                        <div className="absolute top-6 left-6 flex flex-col items-start gap-2">
                            <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 font-bold shadow-sm">
                                {badgeKey ? t(badgeKey) : product.category}
                            </span>
                            {product.isNew && (
                                <span className="bg-brand-secondary text-white text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 font-bold shadow-sm">
                                    {t('shop.badge_new')}
                                </span>
                            )}
                            {product.onSale && (
                                <span className="bg-brand-primary text-white text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 font-bold shadow-sm">
                                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Wishlist Heart */}
                        <button
                            onClick={() => toggleWishlist(product.slug)}
                            aria-label={isInWishlist(product.slug) ? t('wishlist.remove') : t('wishlist.add')}
                            className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full shadow-sm transition-all ${isInWishlist(product.slug)
                                ? 'bg-brand-primary text-white'
                                : 'bg-white/90 backdrop-blur text-slate-400 hover:text-brand-primary'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isInWishlist(product.slug) ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className="text-brand-accent font-bold uppercase tracking-widest text-xs">
                                {product.origin}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 font-bold leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-3 text-slate-500 mb-6 text-sm font-medium">
                            {product.process && (
                                <span className="px-3 py-1 bg-slate-100 rounded-full">{product.process}</span>
                            )}
                            {product.process && product.weight ? <span>•</span> : null}
                            {product.weight ? <span>{product.weight}g</span> : null}
                        </div>

                        {product.roastLevel ? renderRoastLevel() : null}

                        <div className="my-8 flex items-baseline gap-4 flex-wrap">
                            <span className="text-5xl font-bold text-brand-primary">
                                {product.price.toFixed(2)}
                            </span>
                            <span className="text-2xl font-serif text-slate-400">лв</span>
                            <span className="text-lg text-slate-400">({formatEur(product.price)})</span>
                            {product.onSale && (
                                <s className="text-2xl text-slate-300 font-light">{formatBgn(product.originalPrice)}</s>
                            )}
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                            {product.description}
                        </p>

                        {/* Flavor Notes */}
                        <div className={`mb-8 ${product.flavorNotes?.length ? '' : 'hidden'}`}>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                {t('product.flavor_notes')}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {(product.flavorNotes || []).map((note, index) => (
                                    <span
                                        key={index}
                                        className="px-5 py-2 bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium rounded-full shadow-sm hover:border-brand-accent/30 transition-colors"
                                    >
                                        {note}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Grind Type Selector — beans only */}
                        <div className={`mb-8 ${grindable ? '' : 'hidden'}`}>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                {t('product.grind_type')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {grindTypes.map((grind) => (
                                    <button
                                        key={grind.value}
                                        onClick={() => setSelectedGrind(grind.value)}
                                        className={`p-5 border-2 rounded-xl transition-all text-left flex items-center gap-4 ${selectedGrind === grind.value
                                            ? 'border-brand-primary bg-brand-primary/5 shadow-inner'
                                            : 'border-slate-100 hover:border-brand-primary/30'
                                            }`}
                                    >
                                        <div className="text-3xl">{grind.icon}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{grind.label}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tight">{t('product.select_grind_hint').replace('{{grind}}', grind.label.toLowerCase())}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                {t('product.quantity')}
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-slate-50 rounded-xl p-1 shadow-sm border border-slate-100">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all font-bold text-xl"
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= 10}
                                        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-sm text-slate-400 font-medium">
                                    {t('product.total_label')} {formatBgn(product.price * quantity)} ({formatEur(product.price * quantity)})
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        {product.inStock ? (
                            <button
                                onClick={handleAddToCart}
                                disabled={addedToCart || isAdding}
                                className={`w-full py-5 px-8 text-sm font-bold uppercase tracking-[0.2em] transition-all rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] ${addedToCart
                                    ? 'bg-green-600 text-white shadow-green-200'
                                    : 'bg-brand-primary text-white hover:bg-slate-900 shadow-slate-200'
                                    } flex items-center justify-center gap-3`}
                            >
                                {isAdding ? (
                                    <LoadingSpinner size="sm" color="white" />
                                ) : addedToCart ? (
                                    <>
                                        <Check className="w-5 h-5 animate-in zoom-in" />
                                        {t('product.added_to_cart')}
                                    </>
                                ) : (
                                    t('product.add_to_cart')
                                )}
                            </button>
                        ) : (
                            <div className="w-full py-5 px-8 bg-slate-200 text-slate-500 text-sm font-bold uppercase tracking-[0.2em] text-center rounded-xl cursor-not-allowed">
                                {t('product.out_of_stock')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews */}
                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
}
