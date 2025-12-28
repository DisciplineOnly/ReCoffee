import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, Check } from 'lucide-react';
import products from '../data/products.json';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { addToCart } = useCart();

    const product = products.find(p => p.slug === id);
    const [selectedGrind, setSelectedGrind] = useState('whole-bean');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-serif text-slate-900 mb-4">Продуктът не е намерен</h1>
                    <Link to="/shop" className="text-brand-primary hover:text-brand-secondary">
                        Назад към магазина
                    </Link>
                </div>
            </div>
        );
    }

    const grindTypes = [
        { value: 'whole-bean', label: t('product.whole_bean'), icon: '🫘' },
        { value: 'espresso', label: t('product.espresso'), icon: '☕' },
        { value: 'filter', label: t('product.filter'), icon: '🫖' },
        { value: 'french-press', label: t('product.french_press'), icon: '🫗' }
    ];

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedGrind);
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
        <div className="min-h-screen bg-white py-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-primary transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wider">{t('checkout.back')}</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="relative">
                        <div className="aspect-square bg-[#F4F1EE] rounded-lg overflow-hidden">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover mix-blend-multiply opacity-90"
                            />
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur text-xs uppercase tracking-widest px-4 py-2 font-medium">
                                {t(`shop.badge_${product.category.replace('-', '_')}`)}
                            </span>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-3 text-slate-600 mb-4">
                            <span>{product.origin}</span>
                            {product.process && (
                                <>
                                    <span>•</span>
                                    <span>{product.process}</span>
                                </>
                            )}
                        </div>

                        {renderRoastLevel()}

                        <div className="my-6">
                            <span className="text-4xl font-bold text-brand-accent">
                                {product.price.toFixed(2)} лв
                            </span>
                            <span className="text-sm text-slate-500 ml-2">
                                / {product.weight}g
                            </span>
                        </div>

                        <p className="text-slate-700 leading-relaxed mb-6">
                            {product.description}
                        </p>

                        {/* Flavor Notes */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                                {t('product.flavor_notes')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {product.flavorNotes.map((note, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-sm rounded-full"
                                    >
                                        {note}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Grind Type Selector */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                                {t('product.grind_type')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {grindTypes.map((grind) => (
                                    <button
                                        key={grind.value}
                                        onClick={() => setSelectedGrind(grind.value)}
                                        className={`p-4 border-2 rounded-lg transition-all ${selectedGrind === grind.value
                                                ? 'border-brand-primary bg-brand-primary/5'
                                                : 'border-slate-200 hover:border-brand-primary/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{grind.icon}</div>
                                        <div className="text-sm font-medium text-slate-900">{grind.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                                {t('product.quantity')}
                            </h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 border-2 border-slate-200 rounded-lg hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    -
                                </button>
                                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= 10}
                                    className="w-10 h-10 border-2 border-slate-200 rounded-lg hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        {product.inStock ? (
                            <button
                                onClick={handleAddToCart}
                                disabled={addedToCart}
                                className={`w-full py-4 px-6 text-sm font-bold uppercase tracking-widest transition-all ${addedToCart
                                        ? 'bg-green-600 text-white'
                                        : 'bg-brand-primary text-white hover:bg-slate-900'
                                    }`}
                            >
                                {addedToCart ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" />
                                        {t('product.added_to_cart')}
                                    </span>
                                ) : (
                                    t('product.add_to_cart')
                                )}
                            </button>
                        ) : (
                            <div className="w-full py-4 px-6 bg-slate-200 text-slate-600 text-sm font-bold uppercase tracking-widest text-center">
                                {t('product.out_of_stock')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
