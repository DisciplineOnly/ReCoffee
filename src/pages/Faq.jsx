import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { siteConfig } from '../lib/siteConfig';
import PageHeader from '../components/ui/PageHeader';

export default function Faq() {
    const { t } = useTranslation();
    useSEO({
        title: t('faq.title'),
        description: 'Отговори на често задаваните въпроси за поръчки, доставка, абонамент и кафето на ReCoffee.',
    });

    const items = [
        {
            q: 'Колко бързо се изпраща поръчката ми?',
            a: `Поръчки, направени до 14:00 ч. в работен ден, се изпращат същия ден. ${siteConfig.workingHours}`,
        },
        {
            q: 'Каква е цената на доставката?',
            a: `Доставката е безплатна за поръчки над 50€ (${siteConfig.delivery.freeOverBgn} лв). За по-малки поръчки таксата е ${siteConfig.delivery.standardFeeBgn} лв, чрез ${siteConfig.delivery.couriers.join(' или ')}.`,
        },
        {
            q: 'Мога ли да взема поръчката си от кафене?',
            a: 'Да — всички наши локации служат и като пунктове за получаване на онлайн поръчки, напълно безплатно.',
        },
        {
            q: 'Как работи абонаментът за кафе?',
            a: 'Избираш честота и количество, а ние изпращаме прясно изпечено кафе на посочения интервал с 15% отстъпка. Можеш да пауза или да отмениш по всяко време.',
        },
        {
            q: 'Какви методи на плащане приемате?',
            a: 'Приемаме плащане с карта онлайн, наложен платеж и банков превод при поръчка за бизнес клиенти.',
        },
        {
            q: 'Мога ли да върна или заменя продукт?',
            a: `Разбира се — пиши ни на ${siteConfig.supportEmail} в рамките на 14 дни от получаването и ще уредим връщане или замяна.`,
        },
        {
            q: 'Предлагате ли кафе на едро за бизнес?',
            a: (
                <>
                    Да, работим с кафенета, офиси, хотели и вендинг оператори. Виж повече на страницата{' '}
                    <Link to="/wholesale" className="text-brand-primary font-medium hover:underline">Wholesale</Link>.
                </>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-white pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[900px] mx-auto px-6 md:px-12">
                <PageHeader badge={t('faq.badge')} title={t('faq.title')} intro={t('faq.intro')} />

                <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                    {items.map((item, i) => (
                        <details key={i} className="group py-6">
                            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                                <span className="font-medium text-slate-900">{item.q}</span>
                                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                            </summary>
                            <p className="mt-4 text-slate-500 font-light leading-relaxed">{item.a}</p>
                        </details>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 mb-4">Не намери отговор на въпроса си?</p>
                    <Link
                        to="/contact"
                        className="inline-block px-10 py-4 bg-brand-primary text-white font-bold tracking-widest text-xs uppercase hover:bg-slate-900 transition-all"
                    >
                        {t('about.cta_contact')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
