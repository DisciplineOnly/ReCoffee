import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

export default function ShopFavorites() {
    const { t } = useTranslation();
    return (
        <section className="bg-white py-24 md:py-32">
            <div className="md:px-12 max-w-[1400px] mr-auto ml-auto pr-6 pl-6">

                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3 block">
                            {t('shop.badge')}
                        </span>
                        <h3 className="font-serif text-3xl md:text-5xl text-slate-900">{t('shop.title')}</h3>
                    </div>
                    <a href="/shop" className="group flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-slate-900 pb-1">
                        {t('shop.cta')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-primary" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">

                    {/* Product 1 */}
                    <div className="group cursor-pointer">
                        <div className="relative bg-[#F4F1EE] aspect-[4/5] mb-6 overflow-hidden">
                            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" alt="Coffee Bag" />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 font-medium">{t('shop.badge_single')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="font-serif text-xl md:text-2xl text-slate-900 group-hover:text-brand-primary transition-colors">Mass Appeal</h4>
                            <div className="flex gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
                                <span>Colombia</span>
                                <span className="text-slate-300">•</span>
                                <span>Washed</span>
                            </div>
                            <p className="text-sm text-slate-600 font-light italic">Milk chocolate, caramel, red apple.</p>
                            <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                                <span className="text-sm font-medium">$19.00</span>
                                <button className="text-slate-400 hover:text-brand-primary transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product 2 */}
                    <div className="group cursor-pointer">
                        <div className="relative bg-[#EAEAEA] aspect-[4/5] mb-6 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2940&auto=format&fit=crop" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" alt="Coffee Bag" />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 font-medium">{t('shop.badge_blend')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="font-serif text-xl md:text-2xl text-slate-900 group-hover:text-brand-primary transition-colors">Thesis</h4>
                            <div className="flex gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
                                <span>Signature Blend</span>
                                <span className="text-slate-300">•</span>
                                <span>Seasonal</span>
                            </div>
                            <p className="text-sm text-slate-600 font-light italic">Dark chocolate, roasted nut, molasses.</p>
                            <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                                <span className="text-sm font-medium">$17.50</span>
                                <button className="text-slate-400 hover:text-brand-primary transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product 3 */}
                    <div className="group cursor-pointer">
                        <div className="relative bg-[#F0EBE5] aspect-[4/5] mb-6 overflow-hidden">
                            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg" className="group-hover:scale-105 transition-transform duration-500 opacity-90 mix-blend-multiply w-full h-full object-cover" alt="Coffee Bag" />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 font-medium">{t('shop.badge_limited')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="font-serif text-xl md:text-2xl text-slate-900 group-hover:text-brand-primary transition-colors">Gedeb Yirgacheffe</h4>
                            <div className="flex gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
                                <span>Ethiopia</span>
                                <span className="text-slate-300">•</span>
                                <span>Natural</span>
                            </div>
                            <p className="text-sm text-slate-600 font-light italic">Blueberry jam, lavender, honeycomb.</p>
                            <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                                <span className="text-sm font-medium">$24.00</span>
                                <button className="text-slate-400 hover:text-brand-primary transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
