import React from 'react';
import { Globe, Flame } from 'lucide-react';

export default function Philosophy() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-[600px] md:h-auto overflow-hidden">
                <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2942&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Pour over coffee" />
            </div>
            <div className="bg-[#F6F4F2] px-8 py-20 md:p-24 flex flex-col justify-center">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-4">
                    Our Philosophy
                </span>
                <h3 className="font-serif text-4xl md:text-5xl text-slate-900 mb-8 leading-tight">
                    Sourcing with <br /> Intentionality
                </h3>
                <p className="text-slate-600 font-light leading-relaxed mb-8 max-w-md">
                    We travel the globe to build sustainable relationships with producers who share our obsession for quality. Every batch is roasted to highlight the unique terroir of its origin.
                </p>
                <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-full text-orange-900">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-medium text-slate-900 text-sm uppercase tracking-wider mb-1">Direct Trade</h4>
                            <p className="text-sm text-slate-500 font-light">Building equity in the supply chain.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-full text-orange-900">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-medium text-slate-900 text-sm uppercase tracking-wider mb-1">Precision Roasting</h4>
                            <p className="text-sm text-slate-500 font-light">Small batches, meticulously profiled.</p>
                        </div>
                    </div>
                </div>
                <div className="mt-12">
                    <a href="#" className="text-xs font-bold tracking-[0.15em] uppercase text-slate-900 border-b border-slate-900 pb-1 hover:text-orange-700 hover:border-orange-700 transition-all">
                        Read Our Story
                    </a>
                </div>
            </div>
        </section>
    );
}
