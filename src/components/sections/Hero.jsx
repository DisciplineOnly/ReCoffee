import React from 'react';
import heroImage from '../../assets/hero-coffee.jpg';

export default function Hero() {
    return (
        <main className="md:pt-40 md:pb-32 overflow-hidden pt-32 pb-24 relative">
            <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                {/* Text Content */}
                <div className="md:col-span-5 md:col-start-2 flex flex-col justify-center order-2 md:order-1 relative z-10 fade-in-up">
                    <span className="text-xs font-bold tracking-[0.2em] text-brand-secondary uppercase mb-6">
                        Freshly Roasted
                    </span>

                    <h2 className="md:text-7xl leading-[1.1] text-5xl font-normal text-slate-900 tracking-tight font-serif mb-8">
                        ReCaffe: <br /> Redefining Coffee
                    </h2>

                    <p className="md:text-xl leading-relaxed text-lg font-light text-slate-600 max-w-md mb-10">
                        Experience the boldest flavors and artisanal roasting. Our signature beans deliver a bright, balanced cup every time.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="inline-block uppercase hover:text-brand-primary hover:border-brand-primary transition-all text-xs font-bold text-slate-900 tracking-[0.15em] border-brand-primary border-b-2 pb-1">
                            Shop Our Roast
                        </a>
                        <a href="#" className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-slate-400 border-b border-transparent hover:text-brand-secondary transition-all">
                            View All Blends
                        </a>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="md:col-span-6 md:col-start-7 flex justify-center items-center order-1 md:order-2 relative">
                    {/* Radial gradient for subtle glow */}
                    <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full transform scale-75 -z-10"></div>

                    <div className="relative w-72 h-72 md:w-[32rem] md:h-[32rem] rounded-full shadow-2xl shadow-slate-400/30 overflow-hidden group cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
                        <img src={heroImage} alt="ReCaffe Branded Coffee Cup" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -bottom-4 -left-4 md:bottom-12 md:-left-8 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-[12rem] z-20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400">Roast Intensity</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                            </div>
                        </div>
                        <p className="font-serif text-lg leading-none text-brand-accent">Bold & Smooth</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
