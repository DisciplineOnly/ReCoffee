import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, Check } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import products from '../data/products.json';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { addToCart } = useCart();

    const [isLoading, setIsLoading] = useState(true);
    const [selectedGrind, setSelectedGrind] = useState('whole-bean');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const product = products.find(p => p.slug === id);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [id]);

    if (!product && !isLoading) {
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

    if (isLoading) {
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

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        addToCart(product, quantity, selectedGrind);
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
        <div className="min-h-screen bg-white py-24 animate-in fade-in duration-700">
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
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-6 left-6">
                            <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 font-bold shadow-sm">
                                {t(`shop.badge_${product.category.replace('-', '_')}`)}
                            </span>
                        </div>
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
                            <span className="px-3 py-1 bg-slate-100 rounded-full">{product.process}</span>
                            <span>•</span>
                            <span>{product.weight}g</span>
                        </div>

                        {renderRoastLevel()}

                        <div className="my-8 flex items-baseline gap-4">
                            <span className="text-5xl font-bold text-brand-primary">
                                {product.price.toFixed(2)}
                            </span>
                            <span className="text-2xl font-serif text-slate-400">лв</span>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                            {product.description}
                        </p>

                        {/* Flavor Notes */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                {t('product.flavor_notes')}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {product.flavorNotes.map((note, index) => (
                                    <span
                                        key={index}
                                        className="px-5 py-2 bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium rounded-full shadow-sm hover:border-brand-accent/30 transition-colors"
                                    >
                                        {note}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Grind Type Selector */}
                        <div className="mb-8">
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
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tight">Изберете за {grind.label.toLowerCase()}</div>
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
                                    Общо: {(product.price * quantity).toFixed(2)} лв
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
            </div>
        </div>
    );
}
