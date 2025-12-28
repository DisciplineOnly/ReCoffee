import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Coffee } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

export default function EmptyCart() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-24 animate-in fade-in duration-700">
            <div className="text-center max-w-md px-6">
                {/* Icon */}
                <div className="mb-8 relative scale-in-center">
                    <div className="w-32 h-32 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-brand-primary" />
                    </div>
                    <div className="absolute top-0 right-1/2 translate-x-16 -translate-y-2">
                        <Coffee className="w-8 h-8 text-brand-accent animate-bounce" />
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4 slide-in-up">
                    {t('cart.empty')}
                </h1>
                <p className="text-slate-600 mb-8 leading-relaxed slide-in-up" style={{ animationDelay: '100ms' }}>
                    {t('cart.empty_message')}
                </p>

                {/* CTA */}
                <Link
                    to="/shop"
                    className="inline-block bg-brand-primary text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-all rounded-xl shadow-lg hover:shadow-xl active:scale-95 slide-in-up"
                    style={{ animationDelay: '200ms' }}
                >
                    {t('cart.browse_products')}
                </Link>
            </div>
        </div>
    );
}
