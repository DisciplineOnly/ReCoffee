import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../lib/translations';
import { siteConfig } from '../../lib/siteConfig';

export default function VisitUs() {
    const { t } = useTranslation();
    const featured = siteConfig.locations.slice(0, 2);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3 block">
                        {t('visit.badge')}
                    </span>
                    <h3 className="font-serif text-3xl md:text-5xl text-slate-900">{t('visit.title')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featured.map((location) => (
                        <Link key={location.id} to="/locations" className="group relative overflow-hidden h-[400px]">
                            <img
                                src={location.image}
                                alt={location.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                            <div className="absolute bottom-8 left-8 text-white">
                                <h4 className="font-serif text-2xl mb-1">{location.name}</h4>
                                <p className="text-xs tracking-widest uppercase opacity-80">{location.address}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Link
                        to="/locations"
                        className="text-xs font-bold tracking-[0.15em] uppercase text-slate-900 border-b border-transparent hover:border-brand-primary pb-1 transition-all"
                    >
                        {t('visit.cta')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
