import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { NO_GRIND } from '../../lib/categories';
import { formatBgn, formatEur, formatPrice } from '../../lib/price';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

// The order number, every line price, the delivery fee and the totals are all
// computed by the place_order() RPC now. Nothing money-shaped leaves this file:
// the cart is localStorage, so anything derived from it is attacker-controlled.
// These are the tokens place_order() raises; the human text lives in the locale
// files, keyed here so an unrecognised failure still falls back to the generic
// message rather than showing a raw Postgres error.
const ORDER_ERROR_KEYS = {
    ORDER_PRODUCT_OUT_OF_STOCK: 'checkout.error_out_of_stock',
    ORDER_PRODUCT_UNKNOWN: 'checkout.error_product_unknown',
    ORDER_EMPTY_CART: 'checkout.error_empty_cart',
    ORDER_TOO_MANY_LINES: 'checkout.error_too_many_lines',
    ORDER_INVALID_LINE: 'checkout.error_invalid_order',
    ORDER_INVALID_PAYMENT_METHOD: 'checkout.error_invalid_order',
    ORDER_INVALID_DETAILS: 'checkout.error_invalid_order',
    ORDER_NUMBER_EXHAUSTED: 'checkout.error_try_again',
};

// Cart entries added while useProducts was on its local-JSON fallback carry ids
// like "prod_009", but order_items.product_id is a uuid — place_order() rejects
// the line outright. Such a cart also outlives the fallback session in
// localStorage. The slug is stable across both sources, so resolve through it.
// T14 removes the need for this path by blocking checkout while degraded.
const resolveFallbackProductIds = async (items) => {
    const slugs = [...new Set(
        items
            .filter((item) => !isUuid(item.product.id) && item.product.slug)
            .map((item) => item.product.slug)
    )];

    if (slugs.length === 0) return new Map();

    const { data, error } = await supabase
        .from('products')
        .select('id, slug')
        .in('slug', slugs);

    // Returning an empty Map here used to send `product_id: null` down the wire
    // and store order lines pointing at nothing. Fail the checkout instead.
    if (error) {
        console.error('Could not resolve fallback product ids by slug:', error);
        throw new Error('ORDER_PRODUCT_UNKNOWN');
    }

    return new Map(data.map((row) => [row.slug, row.id]));
};

export default function ReviewStep() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { checkoutData, goToStep, resetCheckout, markOrderPlaced } = useCheckout();
    const { cart, getCartTotal, getDeliveryFee, getGrandTotal, clearCart } = useCart();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = getCartTotal();
    const delivery = getDeliveryFee();
    const total = getGrandTotal();

    const getGrindTypeLabel = (grindType) => {
        const grindTypes = {
            'whole-bean': t('product.whole_bean'),
            'espresso': t('product.espresso'),
            'filter': t('product.filter'),
            'french-press': t('product.french_press')
        };
        return grindTypes[grindType] || grindType;
    };

    const getDeliveryTypeLabel = (type) => {
        const types = {
            'home': t('checkout.home_delivery'),
            'office': t('checkout.office_delivery')
        };
        return types[type] || type;
    };

    const getCourierLabel = (courier) => {
        const couriers = {
            'econt': t('checkout.courier_econt'),
            'speedy': t('checkout.courier_speedy')
        };
        return couriers[courier] || courier;
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            'card': t('checkout.card_payment'),
            'cash': t('checkout.cash_on_delivery'),
            'bank': t('checkout.bank_transfer')
        };
        return methods[method] || method;
    };

    const orderErrorMessage = (error) => {
        const key = ORDER_ERROR_KEYS[error?.message];
        if (!key) return t('checkout.order_error');
        // place_order() puts the offending product names in `detail`, which is
        // the useful half of an out-of-stock message. The other tokens carry
        // uuids or internal limits there, so they stay hidden.
        if (error.message === 'ORDER_PRODUCT_OUT_OF_STOCK' && error.details) {
            return `${t(key)} ${error.details}`;
        }
        return t(key);
    };

    const handlePlaceOrder = async () => {
        if (!termsAccepted) {
            alert(t('checkout.terms_alert'));
            return;
        }

        setIsSubmitting(true);

        try {
            const productIdBySlug = await resolveFallbackProductIds(cart);

            // Identity and intent only. The server prices it.
            const items = cart.map((item) => {
                const productId = isUuid(item.product.id)
                    ? item.product.id
                    : productIdBySlug.get(item.product.slug);

                if (!productId) throw new Error('ORDER_PRODUCT_UNKNOWN');

                return {
                    product_id: productId,
                    quantity: item.quantity,
                    grind_type: item.grindType
                };
            });

            // One call, one transaction: the order and its lines land together
            // or not at all. The old two-insert path could leave an orders row
            // with zero line items behind and no way to roll it back.
            const { data, error } = await supabase.rpc('place_order', {
                p_items: items,
                p_client: checkoutData.client,
                p_delivery: checkoutData.delivery,
                p_payment_method: checkoutData.payment.method
            });

            if (error) throw error;

            const placed = Array.isArray(data) ? data[0] : data;
            if (!placed) throw new Error('ORDER_NUMBER_EXHAUSTED');

            // Must precede clearCart(): it tells the /checkout guard to stop
            // redirecting to /cart now that emptying the cart is expected.
            markOrderPlaced();
            clearCart();
            resetCheckout();

            // Hand off through router state, not localStorage. This used to
            // write the whole order — name, email, phone, street address — to
            // `recoffee_last_order` and never clear it, leaving customer PII on
            // a shared machine for the next visitor. Router state lives in the
            // history entry: scoped to this tab, gone when the entry is, and
            // never readable by a later visit to the origin.
            //
            // Only the order number and email travel, and only because
            // lookup_order() needs both to return the order. Everything else
            // the confirmation page shows is fetched from the server.
            navigate('/checkout/success', {
                state: {
                    order: {
                        orderNumber: placed.order_number,
                        email: checkoutData.client.email
                    }
                }
            });

        } catch (error) {
            console.error('Order placement failed:', error);
            alert(orderErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-serif text-slate-900 mb-6">
                    {t('checkout.review_order')}
                </h2>

                {/* Client Information */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            {t('order.client_information')}
                        </h3>
                        <button
                            onClick={() => goToStep(1)}
                            className="text-brand-secondary hover:text-brand-primary text-sm flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            {t('checkout.edit')}
                        </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {checkoutData.client.firstName} {checkoutData.client.lastName}
                        </p>
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {checkoutData.client.email}
                        </p>
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {checkoutData.client.phone}
                        </p>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            {t('order.delivery_information')}
                        </h3>
                        <button
                            onClick={() => goToStep(2)}
                            className="text-brand-secondary hover:text-brand-primary text-sm flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            {t('checkout.edit')}
                        </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {getDeliveryTypeLabel(checkoutData.delivery.type)}
                        </p>
                        {checkoutData.delivery.type === 'office' ? (
                            <p className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                {getCourierLabel(checkoutData.delivery.courier)} — {checkoutData.delivery.courierOffice}, {checkoutData.delivery.courierCity}
                            </p>
                        ) : (
                            <>
                                <p className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    {checkoutData.delivery.address.street}, {checkoutData.delivery.address.city} {checkoutData.delivery.address.postalCode}
                                </p>
                                {checkoutData.delivery.address.notes && (
                                    <p className="text-xs text-slate-500 ml-6">
                                        {t('checkout.note_label')} {checkoutData.delivery.address.notes}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Payment Information */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            {t('order.payment_information')}
                        </h3>
                        <button
                            onClick={() => goToStep(3)}
                            className="text-brand-secondary hover:text-brand-primary text-sm flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            {t('checkout.edit')}
                        </button>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {getPaymentMethodLabel(checkoutData.payment.method)}
                            {checkoutData.payment.method === 'card' && ` (${checkoutData.payment.cardType.charAt(0).toUpperCase() + checkoutData.payment.cardType.slice(1)})`}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                        {t('checkout.order_summary')}
                    </h3>
                    <div className="space-y-3">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <div>
                                    <span className="text-slate-900 font-medium">{item.product.name}</span>
                                    <span className="text-slate-500 text-xs ml-2">
                                        {item.grindType !== NO_GRIND && `(${getGrindTypeLabel(item.grindType)}) `}x{item.quantity}
                                    </span>
                                </div>
                                <span className="text-slate-900 font-medium whitespace-nowrap">
                                    {formatPrice(item.product.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{t('cart.subtotal')}</span>
                            <span className="text-slate-900 font-medium">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{t('cart.delivery')}</span>
                            <span className={`font-medium ${delivery === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                {delivery === 0 ? t('cart.free_delivery') : formatPrice(delivery)}
                            </span>
                        </div>
                        <div className="flex justify-between items-start gap-3 pt-2 border-t border-slate-200">
                            <span className="text-lg font-bold text-slate-900">{t('cart.total')}</span>
                            <span className="text-right">
                                <span className="block text-lg font-bold text-brand-accent">
                                    {formatBgn(total)}
                                </span>
                                <span className="block text-xs font-medium text-slate-400">
                                    {formatEur(total)}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-5 h-5 mt-0.5 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                        />
                        <span className="text-sm text-slate-700">
                            {t('checkout.terms_agree')}
                        </span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => goToStep(3)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-900 text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('checkout.back')}
                    </button>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={!termsAccepted || isSubmitting}
                        className="flex-1 py-3 px-6 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t('checkout.processing') : t('checkout.place_order')}
                    </button>
                </div>
            </div>
        </div>
    );
}
