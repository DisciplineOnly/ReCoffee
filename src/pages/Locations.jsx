import React from 'react';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { siteConfig } from '../lib/siteConfig';
import PageHeader from '../components/ui/PageHeader';

export default function Locations() {
    const { t } = useTranslation();
    useSEO({
        title: t('locationsPage.title'),
        description: 'Кафенетата на ReCoffee в София и Пловдив — работно време, адреси и взимане на онлайн поръчки от място.',
    });

    return (
        <div className="min-h-screen bg-white py-24 animate-in fade-in duration-700">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <PageHeader
                    badge={t('locationsPage.badge')}
                    title={t('locationsPage.title')}
                    intro={t('locationsPage.intro')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {siteConfig.locations.map((location) => (
                        <div key={location.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={location.image}
                                    alt={location.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                <h2 className="absolute bottom-6 left-6 text-white font-serif text-2xl">{location.name}</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                                    <span>{location.address}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <Clock className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                                    <span>{location.hours}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                                    <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="hover:text-brand-primary transition-colors">
                                        {location.phone}
                                    </a>
                                </div>
                                <a
                                    href={location.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-slate-900 border-b border-transparent hover:border-brand-primary hover:text-brand-primary pb-1 transition-all"
                                >
                                    {t('locationsPage.directions')}
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-sm text-slate-400 mt-12">{t('locationsPage.pickup_note')}</p>
            </div>
        </div>
    );
}
