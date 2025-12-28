import React from 'react';
import { useTranslation } from '../../lib/translations';

export default function VisitUs() {
    const { t } = useTranslation();

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
                    <a href="#" className="group relative overflow-hidden h-[400px]">
                        <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop" alt="Cafe Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <h4 className="font-serif text-2xl mb-1">Annapolis Roastery</h4>
                            <p className="text-xs tracking-widest uppercase opacity-80">90 Russell Street</p>
                        </div>
                    </a>
                    <a href="#" className="group relative overflow-hidden h-[400px]">
                        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2787&auto=format&fit=crop" alt="Cafe Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <h4 className="font-serif text-2xl mb-1">Bethesda</h4>
                            <p className="text-xs tracking-widest uppercase opacity-80">7475 Wisconsin Ave</p>
                        </div>
                    </a>
                </div>
                <div className="text-center mt-12">
                    <a href="#" className="text-xs font-bold tracking-[0.15em] uppercase text-slate-900 border-b border-transparent hover:border-brand-primary pb-1 transition-all">
                        {t('visit.cta')}
                    </a>
                </div>
            </div>
        </section>
    );
}
