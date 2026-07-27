import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';
import { siteConfig } from '../../lib/siteConfig';
import { formatBgn, formatEur, formatPrice } from '../../lib/price';

const FREE_DELIVERY_OVER = siteConfig.delivery.freeOverBgn;

export default function CartSummary() {
    const { t } = useTranslation();
    const { getCartTotal, getDeliveryFee, getGrandTotal, catalogDegraded } = useCart();

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
            <div className="flex justify-between items-start gap-3 mb-3">
                <span className="text-slate-600">{t('cart.subtotal')}</span>
                <span className="text-right">
                    <span className="block text-lg font-bold text-slate-900">
                        {formatEur(subtotal)}
                    </span>
                    <span className="block text-xs text-slate-400">{formatBgn(subtotal)}</span>
                </span>
            </div>

            {/* Delivery */}
            <div className="flex justify-between items-start gap-3 mb-3">
                <span className="text-slate-600">{t('cart.delivery')}</span>
                {isFreeDelivery ? (
                    <span className="text-lg font-bold text-green-600">
                        {t('cart.free_delivery')}
                    </span>
                ) : (
                    <span className="text-right">
                        <span className="block text-lg font-bold text-slate-900">
                            {formatEur(delivery)}
                        </span>
                        <span className="block text-xs text-slate-400">{formatBgn(delivery)}</span>
                    </span>
                )}
            </div>

            {/* Free Delivery Progress */}
            {!isFreeDelivery && subtotal > 0 && subtotal < FREE_DELIVERY_OVER && (
                <div className="mb-4 p-3 bg-brand-secondary/10 rounded-lg">
                    <p className="text-xs text-brand-secondary">
                        Добави още {formatPrice(FREE_DELIVERY_OVER - subtotal)} за безплатна доставка!
                    </p>
                    <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-secondary transition-all duration-300"
                            style={{ width: `${(subtotal / FREE_DELIVERY_OVER) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Total */}
            <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-start gap-3">
                    <span className="text-lg font-bold text-slate-900">{t('cart.total')}</span>
                    <span className="text-right">
                        <span className="block text-2xl font-bold text-brand-accent">
                            {formatEur(total)}
                        </span>
                        <span className="block text-xs text-slate-400">{formatBgn(total)}</span>
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                {catalogDegraded ? (
                    // Prices here came from the bundle, not the database. The
                    // checkout page refuses the order too — this just stops the
                    // customer walking into it.
                    <div>
                        <button
                            type="button"
                            disabled
                            className="block w-full bg-brand-primary text-white py-4 px-6 text-center text-sm font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
                        >
                            {t('cart.proceed_checkout')}
                        </button>
                        <p className="mt-2 text-xs text-brand-primary">
                            {t('cart.checkout_unavailable')}
                        </p>
                    </div>
                ) : (
                    <Link
                        to="/checkout"
                        className="block w-full bg-brand-primary text-white py-4 px-6 text-center text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                    >
                        {t('cart.proceed_checkout')}
                        <ArrowRight className="inline-block ml-2 w-4 h-4" />
                    </Link>
                )}
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
