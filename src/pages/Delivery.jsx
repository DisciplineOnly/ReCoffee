import React from 'react';
import { Truck, PackageCheck, Clock, Banknote } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { siteConfig } from '../lib/siteConfig';
import { formatPrice } from '../lib/price';
import PageHeader from '../components/ui/PageHeader';

export default function Delivery() {
    const { t } = useTranslation();
    useSEO({
        title: t('deliveryPage.title'),
        description: 'Условия за доставка на ReCoffee — куриери, цени и срокове в цялата страна.',
    });

    const cards = [
        {
            icon: Truck,
            title: 'Куриерска доставка',
            text: `Доставяме чрез ${siteConfig.delivery.couriers.join(' и ')} до адрес или до офис на куриера в цялата страна.`,
        },
        {
            icon: Banknote,
            title: 'Цена на доставката',
            text: `Безплатна доставка за поръчки над ${formatPrice(siteConfig.delivery.freeOverBgn)}. За по-малки поръчки — фиксирана такса от ${formatPrice(siteConfig.delivery.standardFeeBgn)}.`,
        },
        {
            icon: Clock,
            title: 'Срокове',
            text: `${siteConfig.orderCutoff} Обичайно доставката отнема 1–2 работни дни в зависимост от дестинацията.`,
        },
        {
            icon: PackageCheck,
            title: 'Проследяване на пратката',
            text: 'Получаваш номер за проследяване веднага след изпращане, за да следиш пратката си в реално време.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                <PageHeader badge={t('deliveryPage.badge')} title={t('deliveryPage.title')} intro={t('deliveryPage.intro')} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.title} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-5">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-medium text-slate-900 text-sm uppercase tracking-wider mb-3">{card.title}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{card.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
