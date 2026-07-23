import React from 'react';
import { Quote, Star } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

const testimonials = [
    {
        quote: 'Работим с ReCoffee вече втора година — доставките винаги са навреме, а кафето е неизменно прясно. Клиентите ни го усетиха веднага.',
        name: 'Мартин Ковачев',
        role: 'Собственик на кафене',
    },
    {
        quote: 'Абонаментът е най-доброто решение за сутрешното ми кафе. Точно навреме, точно толкова, колкото ми трябва, без да мисля за поръчки.',
        name: 'Виктория Николова',
        role: 'Абонат на ReCoffee',
    },
    {
        quote: 'Преминахме към ReCoffee за офиса заради гъвкавите доставки и обучението на екипа. Отличен партньор за бизнес.',
        name: 'Ивайло Петров',
        role: 'Офис мениджър',
    },
];

export default function Testimonials() {
    const { t } = useTranslation();

    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3 block">
                        {t('testimonials.badge')}
                    </span>
                    <h3 className="font-serif text-3xl md:text-5xl text-slate-900 mb-4">{t('testimonials.title')}</h3>
                    <p className="text-slate-500 font-light max-w-xl mx-auto">{t('testimonials.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item) => (
                        <div key={item.name} className="bg-[#F6F4F2] rounded-2xl p-8 flex flex-col">
                            <Quote className="w-8 h-8 text-brand-primary/30 mb-4" />
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-600 font-light leading-relaxed mb-6 flex-1">&ldquo;{item.quote}&rdquo;</p>
                            <div>
                                <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">{item.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
