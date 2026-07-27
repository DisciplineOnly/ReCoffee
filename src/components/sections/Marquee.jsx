import React from 'react';
import { useTranslation } from '../../lib/translations';
import { siteConfig } from '../../lib/siteConfig';
import { formatEur } from '../../lib/price';

export default function Marquee() {
    const { t } = useTranslation();

    // The threshold is interpolated rather than baked into the string, so
    // changing siteConfig.delivery actually changes what the banner promises.
    const freeShipping = t('marquee.free_shipping')
        .replace('{{amount}}', formatEur(siteConfig.delivery.freeOverBgn));

    const content = (
        <>
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase mx-4">{freeShipping}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase mx-4">{t('marquee.fresh_roasted')}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase mx-4">{t('marquee.sustainable')}</span>
            <span className="text-white/30">•</span>
        </>
    );

    return (
        <div className="w-full bg-brand-primary py-4 overflow-hidden whitespace-nowrap">
            <div className="inline-flex items-center animate-marquee">
                {/* Duplicated content for seamless scrolling */}
                {content}
                {content}
                {content}
                {content}
                {content}
                {content}
            </div>
        </div>
    );
}
