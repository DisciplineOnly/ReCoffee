import React from 'react';
import { CalendarClock } from 'lucide-react';

export default function Subscription() {
    return (
        <section className="bg-slate-900 text-white py-24 md:py-32 relative overflow-hidden">
            {/* Abstract Decoration */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10">
                <CalendarClock className="w-8 h-8 mx-auto mb-6 text-orange-200" />
                <h2 className="font-serif text-4xl md:text-6xl mb-6">Never Run Out Again</h2>
                <p className="text-slate-300 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                    Freshly roasted coffee delivered to your doorstep on your schedule. Save up to 15% on every order and get exclusive access to limited micro-lots.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#" className="px-8 py-4 bg-orange-100 text-orange-900 font-medium tracking-widest text-xs uppercase hover:bg-white transition-colors">
                        Start Subscription
                    </a>
                    <a href="#" className="px-8 py-4 border border-slate-700 text-white font-medium tracking-widest text-xs uppercase hover:bg-slate-800 transition-colors">
                        Gift a Subscription
                    </a>
                </div>
            </div>
        </section>
    );
}
