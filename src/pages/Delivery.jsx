import React from 'react';
import { Truck, MapPin, Clock, Banknote } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { siteConfig } from '../lib/siteConfig';
import { formatBgn } from '../lib/price';
import PageHeader from '../components/ui/PageHeader';

export default function Delivery() {
    const { t } = useTranslation();
    useSEO({
        title: t('deliveryPage.title'),
        description: 'Условия за доставка на ReCoffee — куриери, цени, срокове и пунктове за получаване.',
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
            text: `Безплатна доставка за поръчки над 50€ (${formatBgn(siteConfig.delivery.freeOverBgn)}). За по-малки поръчки — фиксирана такса от ${formatBgn(siteConfig.delivery.standardFeeBgn)}.`,
        },
        {
            icon: Clock,
            title: 'Срокове',
            text: `${siteConfig.orderCutoff} Обичайно доставката отнема 1–2 работни дни в зависимост от дестинацията.`,
        },
        {
            icon: MapPin,
            title: 'Получаване от кафене',
            text: 'Всяка наша локация е и пункт за безплатно получаване на онлайн поръчки — избери я при плащане.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                <PageHeader badge={t('deliveryPage.badge')} title={t('deliveryPage.title')} intro={t('deliveryPage.intro')} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
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

                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 mb-8">
                        {t('locationsPage.title')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {siteConfig.locations.map((loc) => (
                            <div key={loc.id} className="border border-slate-100 rounded-xl p-5">
                                <p className="font-medium text-slate-900 mb-1">{loc.name}</p>
                                <p className="text-sm text-slate-500 mb-1">{loc.address}</p>
                                <p className="text-xs text-slate-400">{loc.hours}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
