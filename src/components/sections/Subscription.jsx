import React from 'react';
import { CalendarClock } from 'lucide-react';

export default function Subscription() {
    return (
        <section className="bg-brand-secondary text-white py-24 md:py-32 relative overflow-hidden">
            {/* Abstract Decoration */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10">
                <CalendarClock className="w-8 h-8 mx-auto mb-6 text-brand-primary" />
                <h2 className="font-serif text-4xl md:text-6xl mb-6">ReCaffe Refills</h2>
                <p className="text-white/80 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                    Artisan coffee delivered right to your door. Save 15% with our flexible ReCaffe subscription and never miss a morning brew.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#" className="px-10 py-4 bg-brand-primary text-white font-bold tracking-widest text-xs uppercase hover:bg-white hover:text-brand-primary transition-all shadow-xl shadow-brand-primary/20">
                        Start Subscription
                    </a>
                    <a href="#" className="px-10 py-4 border-2 border-white/30 text-white font-bold tracking-widest text-xs uppercase hover:bg-white/10 transition-all">
                        Gift a Box
                    </a>
                </div>
            </div>
        </section>
    );
}
