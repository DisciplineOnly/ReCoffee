import React from 'react';

export default function Hero() {
    return (
        <main className="md:pt-40 md:pb-32 overflow-hidden pt-32 pb-24 relative">
            <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                {/* Text Content */}
                <div className="md:col-span-5 md:col-start-2 flex flex-col justify-center order-2 md:order-1 relative z-10 fade-in-up">
                    <span className="text-xs font-semibold tracking-[0.2em] text-orange-800/80 uppercase mb-6">
                        New Arrival
                    </span>

                    <h2 className="md:text-7xl leading-[1.1] text-5xl font-normal text-slate-900 tracking-tight font-serif mb-8">
                        House Espresso <br /> Elevated
                    </h2>

                    <p className="md:text-xl leading-relaxed text-lg font-light text-slate-600 max-w-md mb-10">
                        Vanilla sugar wafer aromatics. Fresh Clementine orange in a bright, balanced cup.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="inline-block uppercase hover:text-orange-700 hover:border-orange-700 transition-all text-xs font-bold text-slate-900 tracking-[0.15em] border-slate-900 border-b pb-1">
                            Shop Destroyer
                        </a>
                        <a href="#" className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-slate-400 border-b border-transparent hover:text-slate-900 transition-all">
                            View All Coffee
                        </a>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="md:col-span-6 md:col-start-7 flex justify-center items-center order-1 md:order-2 relative">
                    {/* Radial gradient for subtle glow */}
                    <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full transform scale-75 -z-10"></div>

                    <div className="relative w-72 h-72 md:w-[32rem] md:h-[32rem] rounded-full shadow-2xl shadow-slate-300/50 overflow-hidden group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1610632380989-680fe40816c6?q=80&w=2787&auto=format&fit=crop" alt="Orange half in wooden bowl" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                        <div className="bg-orange-50/10 mix-blend-multiply absolute top-0 right-0 bottom-0 left-0"></div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -bottom-4 -left-4 md:bottom-12 md:-left-8 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-[12rem] z-20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400">Roast Level</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            </div>
                        </div>
                        <p className="font-serif text-lg leading-none text-slate-900">Medium-Light</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
