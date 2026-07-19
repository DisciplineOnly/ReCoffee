import React from 'react';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';

export default function Cart() {
    const { t } = useTranslation();
    const { cart } = useCart();

    if (cart.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="min-h-screen bg-[#F6F4F2] pt-12 pb-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-2">
                        {t('cart.title')}
                    </h1>
                    <p className="text-slate-600">
                        {cart.length} {cart.length === 1 ? 'артикул' : 'артикула'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <CartItem
                                key={`${item.product.id}-${item.grindType}`}
                                item={item}
                            />
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1">
                        <CartSummary />
                    </div>
                </div>
            </div>
        </div>
    );
}
