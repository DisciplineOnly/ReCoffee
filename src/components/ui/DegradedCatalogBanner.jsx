import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../lib/translations';
import { useCart } from '../../contexts/CartContext';

/**
 * Shown whenever `useProducts()` is serving the bundled local catalog instead of
 * the database. The fallback keeps the shop browsable during an outage, which is
 * worth having — but it was silent, so a customer could read build-time prices
 * with no way of knowing they were not current.
 *
 * Deliberately not dismissible: it is not a promotion, it is the reason
 * checkout is refusing orders. It disappears on its own when the next page load
 * reaches the database.
 */
export default function DegradedCatalogBanner() {
    const { t } = useTranslation();
    const { catalogDegraded } = useCart();

    if (!catalogDegraded) return null;

    return (
        <div role="status" className="border-b border-brand-primary/30 bg-brand-primary/5">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-brand-primary mt-0.5" aria-hidden="true" />
                <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-900">{t('catalog.degraded_title')}</span>{' '}
                    {t('catalog.degraded_message')}
                </p>
            </div>
        </div>
    );
}
