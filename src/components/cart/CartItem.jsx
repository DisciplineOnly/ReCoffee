import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';

export default function CartItem({ item }) {
    const { t } = useTranslation();
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (delta) => {
        const newQuantity = item.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 10) {
            updateQuantity(item.product.id, item.grindType, newQuantity);
        }
    };

    const handleRemove = () => {
        if (window.confirm(t('cart.item_removed'))) {
            removeFromCart(item.product.id, item.grindType);
        }
    };

    const getGrindTypeLabel = () => {
        const grindTypes = {
            'whole-bean': t('product.whole_bean'),
            'espresso': t('product.espresso'),
            'filter': t('product.filter'),
            'french-press': t('product.french_press')
        };
        return grindTypes[item.grindType] || item.grindType;
    };

    const itemTotal = item.product.price * item.quantity;

    return (
        <div className="bg-white rounded-lg p-4 md:p-6 flex gap-4 md:gap-6 hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-[#F4F1EE] rounded-lg overflow-hidden">
                <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg md:text-xl font-serif text-slate-900 mb-1">
                        {item.product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <span>{item.product.origin}</span>
                        <span>•</span>
                        <span>{getGrindTypeLabel()}</span>
                    </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 border-2 border-slate-200 rounded-lg hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                        <button
                            onClick={() => handleQuantityChange(1)}
                            disabled={item.quantity >= 10}
                            className="w-8 h-8 border-2 border-slate-200 rounded-lg hover:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xl md:text-2xl font-bold text-brand-accent">
                            {itemTotal.toFixed(2)} лв
                        </span>
                        <button
                            onClick={handleRemove}
                            className="text-slate-400 hover:text-red-600 transition-colors p-2"
                            title={t('cart.remove')}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
