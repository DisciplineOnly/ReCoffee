import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function CheckoutSuccess() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        // Try to get the last order from localStorage
        const lastOrder = localStorage.getItem('recoffee_last_order');
        if (lastOrder) {
            setOrder(JSON.parse(lastOrder));
        } else {
            // If no order found, redirect to shop
            navigate('/shop');
        }
    }, [navigate]);

    if (!order) return null;

    return (
        <div className="min-h-screen bg-[#F6F4F2] py-24">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-600 p-8 text-center text-white">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                        <h1 className="text-3xl font-serif mb-2">{t('order.confirmed')}</h1>
                        <p className="opacity-90">{t('order.thank_you')}</p>
                    </div>

                    <div className="p-8">
                        {/* Order Info Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-brand-primary" />
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                        {t('order.order_number')}
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-brand-primary" />
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                        Дата
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {new Date(order.date).toLocaleDateString('bg-BG')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-brand-primary" />
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                        {t('checkout.payment_method')}
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {order.payment.method === 'card' ? t('checkout.card_payment') :
                                            order.payment.method === 'cash' ? t('checkout.cash_on_delivery') :
                                                t('checkout.bank_transfer')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
                                    {t('order.delivery_information')}
                                </h3>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p className="font-medium text-slate-900">
                                        {order.client.firstName} {order.client.lastName}
                                    </p>
                                    {order.delivery.type !== 'pickup' ? (
                                        <>
                                            <p>{order.delivery.address.street}</p>
                                            <p>{order.delivery.address.postalCode} {order.delivery.address.city}</p>
                                        </>
                                    ) : (
                                        <p>{t(`checkout.${order.delivery.pickupLocation}`)}</p>
                                    )}
                                    <p>{order.client.phone}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
                                    Обобщение
                                </h3>
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                {item.product.name} x{item.quantity}
                                            </span>
                                            <span className="text-slate-900 font-medium">
                                                {(item.product.price * item.quantity).toFixed(2)} лв
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                                        <span>{t('cart.total')}</span>
                                        <span className="text-brand-accent">{order.total.toFixed(2)} лв</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center pt-8 border-t border-slate-100">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-brand-primary text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
                            >
                                {t('order.continue_shopping')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
