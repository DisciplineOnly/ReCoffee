import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Mail, Truck } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { siteConfig } from '../lib/siteConfig';
import { supabase } from '../lib/supabase';
import { formatBgn, formatEur, formatPrice } from '../lib/price';
import { onImageError, productImage } from '../lib/productImage';
import { useProducts } from '../hooks/useProducts';
import { useSEO } from '../hooks/useSEO';

export default function CheckoutSuccess() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { products } = useProducts();
    const [order, setOrder] = useState(null);
    const [failed, setFailed] = useState(false);

    useSEO({ title: t('order.confirmed'), noindex: true });

    // ReviewStep hands these over in the history entry. Nothing is read from
    // localStorage any more: the whole order used to be parked there under
    // `recoffee_last_order` and never cleared, which left a customer's name,
    // email, phone and street address readable by the next person to open the
    // site on a shared machine.
    const orderNumber = location.state?.order?.orderNumber;
    const email = location.state?.order?.email;

    useEffect(() => {
        if (!orderNumber || !email) {
            navigate('/shop', { replace: true });
            return undefined;
        }

        let cancelled = false;
        supabase
            .rpc('lookup_order', { p_order_number: orderNumber, p_email: email })
            .then(({ data, error }) => {
                if (cancelled) return;
                const row = Array.isArray(data) ? data[0] : data;
                if (error || !row) {
                    console.error('Could not load the placed order:', error);
                    setFailed(true);
                    return;
                }
                setOrder(row);
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Could not load the placed order:', error);
                setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [orderNumber, email, navigate]);

    // lookup_order() has no reason to return image URLs, so the thumbnails come
    // from the live catalog, keyed on the product id the order line kept.
    const imagesByProductId = useMemo(
        () => new Map(products.map((product) => [product.id, product.images])),
        [products]
    );

    if (failed) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-serif text-slate-900 mb-3">{t('order.confirmed')}</h1>
                    <p className="text-slate-600 mb-2">{t('checkout.order_number_only')}</p>
                    <p className="text-lg font-bold text-brand-primary mb-8">{orderNumber}</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-8 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-primary transition-all"
                    >
                        {t('order.continue_shopping')}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const client = order.client_info ?? {};
    const delivery = order.delivery_info ?? {};

    // Estimate delivery date (3-5 business days)
    const getEstimatedDelivery = () => {
        const date = order.created_at ? new Date(order.created_at) : new Date();
        date.setDate(date.getDate() + 3);
        const start = date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' });
        date.setDate(date.getDate() + 2);
        const end = date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' });
        return `${start} - ${end}`;
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 slide-in-up">
                    {/* Header */}
                    <div className="bg-brand-primary p-12 text-center text-white relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-700">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif mb-4 font-bold">{t('order.confirmed')}</h1>
                            <p className="text-lg opacity-90 max-w-md mx-auto">{t('order.thank_you')}</p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Order Info Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">
                                        {t('order.order_number')}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{order.order_number}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">
                                        {t('order.email_label')}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{client.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">
                                        {t('order.delivery_label')}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{getEstimatedDelivery()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                                    {t('order.delivery_information')}
                                </h3>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <p className="font-bold text-slate-900 mb-3 text-lg">
                                        {client.firstName} {client.lastName}
                                    </p>
                                    <div className="text-slate-600 space-y-1.5 font-medium">
                                        {delivery.type === 'office' ? (
                                            <>
                                                <p className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                                                    {t(`checkout.courier_${delivery.courier}`)}
                                                </p>
                                                <p className="pl-3.5">{delivery.courierOffice}, {delivery.courierCity}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                                                    {delivery.address?.street}
                                                </p>
                                                <p className="pl-3.5">{delivery.address?.postalCode} {delivery.address?.city}</p>
                                            </>
                                        )}
                                        <p className="pl-3.5 pt-2 text-sm">{client.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                                    {t('order.order_details')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(order.items ?? []).map((item, idx) => {
                                            const lineTotal = Number(item.unit_price) * item.quantity;
                                            return (
                                                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={productImage({ images: imagesByProductId.get(item.product_id) })}
                                                                onError={onImageError}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover mix-blend-multiply"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{item.quantity} x {formatPrice(item.unit_price)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-right whitespace-nowrap">
                                                        <span className="block text-sm font-bold text-slate-900">
                                                            {formatEur(lineTotal)}
                                                        </span>
                                                        <span className="block text-[10px] font-medium text-slate-400">
                                                            {formatBgn(lineTotal)}
                                                        </span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>{t('cart.subtotal')}</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                                            <span>{t('cart.delivery')}</span>
                                            <span>{Number(order.delivery_fee) === 0 ? t('order.free_label') : formatPrice(order.delivery_fee)}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-3 pt-4">
                                            <span className="font-bold text-xl text-slate-900">{t('cart.total')}</span>
                                            <span className="text-right">
                                                <span className="block font-bold text-xl text-brand-primary">
                                                    {formatEur(order.total)}
                                                </span>
                                                <span className="block text-xs font-medium text-slate-400">
                                                    {formatBgn(order.total)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4">
                            <Link
                                to="/shop"
                                className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-slate-900 text-white py-5 px-10 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-primary transition-all shadow-lg hover:shadow-brand-primary/20 active:scale-95"
                            >
                                {t('order.continue_shopping')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="w-full md:w-auto text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest py-4 px-8 transition-colors"
                            >
                                {t('order.print_receipt')}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-12 font-medium">
                    {t('order.questions')} <a href={`mailto:${siteConfig.supportEmail}`} className="text-brand-primary hover:underline">{siteConfig.supportEmail}</a>
                </p>
            </div>
        </div>
    );
}
