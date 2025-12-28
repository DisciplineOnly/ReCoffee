import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';

export default function CartSummary() {
    const { t } = useTranslation();
    const { getCartTotal, getDeliveryFee, getGrandTotal } = useCart();

    const subtotal = getCartTotal();
    const delivery = getDeliveryFee();
    const total = getGrandTotal();
    const isFreeDelivery = delivery === 0 && subtotal > 0;

    return (
        <div className="bg-white rounded-lg p-6 sticky top-24">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6">
                {t('checkout.order_summary')}
            </h3>

            {/* Subtotal */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-slate-600">{t('cart.subtotal')}</span>
                <span className="text-lg font-bold text-slate-900">
                    {subtotal.toFixed(2)} лв
                </span>
            </div>

            {/* Delivery */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-slate-600">{t('cart.delivery')}</span>
                <span className={`text-lg font-bold ${isFreeDelivery ? 'text-green-600' : 'text-slate-900'}`}>
                    {isFreeDelivery ? t('cart.free_delivery') : `${delivery.toFixed(2)} лв`}
                </span>
            </div>

            {/* Free Delivery Progress */}
            {!isFreeDelivery && subtotal > 0 && subtotal < 100 && (
                <div className="mb-4 p-3 bg-brand-secondary/10 rounded-lg">
                    <p className="text-xs text-brand-secondary">
                        Добави още {(100 - subtotal).toFixed(2)} лв за безплатна доставка!
                    </p>
                    <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-secondary transition-all duration-300"
                            style={{ width: `${(subtotal / 100) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Total */}
            <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">{t('cart.total')}</span>
                    <span className="text-2xl font-bold text-brand-accent">
                        {total.toFixed(2)} лв
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <Link
                    to="/checkout"
                    className="block w-full bg-brand-primary text-white py-4 px-6 text-center text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                >
                    {t('cart.proceed_checkout')}
                    <ArrowRight className="inline-block ml-2 w-4 h-4" />
                </Link>
                <Link
                    to="/shop"
                    className="block w-full border-2 border-slate-200 text-slate-900 py-4 px-6 text-center text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                    <ShoppingBag className="inline-block mr-2 w-4 h-4" />
                    {t('cart.continue_shopping')}
                </Link>
            </div>
        </div>
    );
}
