import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../lib/translations';
import heroImage from '../../assets/hero-coffee.jpg';

export default function Hero() {
    const { t } = useTranslation();

    return (
        <main className="md:pt-40 md:pb-32 overflow-hidden pt-32 pb-24 relative bg-brand-primary">
            <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                {/* Text Content */}
                <div className="md:col-span-5 md:col-start-2 flex flex-col justify-center order-2 md:order-1 relative z-10 fade-in-up">
                    <span className="text-xs font-bold tracking-[0.2em] text-white/90 uppercase mb-6">
                        {t('hero.badge')}
                    </span>

                    <h2 className="md:text-7xl leading-[1.1] text-5xl font-normal text-white tracking-tight font-serif mb-8">
                        {t('hero.title')}
                    </h2>

                    <p className="md:text-xl leading-relaxed text-lg font-light text-white/80 max-w-md mb-10">
                        {t('hero.description')}
                    </p>

                    <div className="flex items-center gap-6">
                        <Link to="/shop" className="inline-block uppercase hover:text-white hover:border-white transition-all text-xs font-bold text-white tracking-[0.15em] border-white border-b-2 pb-1">
                            {t('hero.cta_primary')}
                        </Link>
                        <Link to="/shop?category=blend" className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-white/60 border-b border-transparent hover:text-white transition-all">
                            {t('hero.cta_secondary')}
                        </Link>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="md:col-span-6 md:col-start-7 flex flex-col justify-center items-center order-1 md:order-2 relative">
                    {/* Radial gradient for subtle glow */}
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full transform scale-75 -z-10"></div>

                    <div className="relative w-72 h-72 md:w-[32rem] md:h-[32rem] rounded-full shadow-2xl shadow-slate-400/30 overflow-hidden group cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
                        <img src={heroImage} alt="ReCaffe Branded Coffee Cup" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                    </div>

                    {/* Floating Badge */}
                    <div className="relative mt-6 md:absolute md:mt-0 md:bottom-12 md:-left-8 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-[12rem] z-20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400">{t('hero.roast_intensity')}</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                            </div>
                        </div>
                        <p className="font-serif text-lg leading-none text-brand-accent">{t('hero.roast_level')}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
