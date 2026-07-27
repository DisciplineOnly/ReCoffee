import React from 'react';
import { useTranslation } from '../lib/translations';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';
import { useSEO } from '../hooks/useSEO';

export default function Cart() {
    const { t } = useTranslation();
    const { cart, cartLoading, unavailableCount, dismissUnavailable } = useCart();

    // Kept out of search results: a cart URL is personal and has nothing to rank.
    useSEO({ title: t('cart.title'), noindex: true });

    // Lines are stored as ids and joined against the live catalog; showing the
    // empty state before that join lands would tell the customer their cart is
    // gone when it is not.
    if (cartLoading) {
        return (
            <div className="min-h-screen bg-[#F6F4F2] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
            </div>
        );
    }

    const removedNotice = unavailableCount > 0 && (
        <div className="mb-8 flex items-start justify-between gap-4 rounded-lg border border-brand-primary/30 bg-brand-primary/5 px-5 py-4">
            <p className="text-sm text-slate-700">{t('cart.unavailable_removed')}</p>
            <button
                type="button"
                onClick={dismissUnavailable}
                className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-accent transition-colors"
            >
                {t('cart.dismiss')}
            </button>
        </div>
    );

    if (cart.length === 0) {
        return (
            <>
                {unavailableCount > 0 && (
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12">{removedNotice}</div>
                )}
                <EmptyCart />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F4F2] pt-12 pb-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {removedNotice}

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
