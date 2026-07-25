import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Flame, HandHeart, Coffee } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import PageHeader from '../components/ui/PageHeader';

export default function About() {
    const { t } = useTranslation();
    useSEO({
        title: t('about.title'),
        description: 'Историята на ReCoffee — специално кафе, изпечено с внимание в София. Директна търговия, прецизно печене и любов към занаята.',
    });

    const values = [
        {
            icon: Globe,
            title: t('philosophy.direct_trade'),
            text: 'Купуваме директно от ферми в Етиопия, Колумбия, Бразилия и Централна Америка. Плащаме над пазарните цени, защото качеството започва от фермера.',
        },
        {
            icon: Flame,
            title: t('philosophy.precision'),
            text: 'Печем в малки партиди по индивидуални профили. Всяко кафе се дегустира и калибрира, преди да стигне до теб.',
        },
        {
            icon: HandHeart,
            title: 'Устойчивост',
            text: 'Рециклируеми опаковки, отговорно снабдяване и дългосрочни договори с производителите.',
        },
        {
            icon: Coffee,
            title: 'Общност',
            text: 'Подкрепяме кафенета, офиси и домове в цяла България с прясно изпечено кафе и обучения за бариста. Вярваме, че доброто кафе събира хората.',
        },
    ];

    return (
        <div className="min-h-screen bg-white pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                <PageHeader
                    badge={t('about.badge')}
                    title={t('about.title')}
                    intro="ReCoffee започна през 2021 г. с една малка печатна машина, десет килограма зелено кафе и убеждението, че София заслужава кафе, изпечено с внимание."
                />

                {/* Story. The stock hero photo that used to sit here was removed;
                    drop a real roastery shot back in when one exists. */}
                <div className="prose-recoffee max-w-3xl mx-auto text-slate-600 font-light leading-relaxed space-y-6 text-lg mb-20">
                    <p>
                        Всичко започна от едно пътуване до Адис Абеба и първата глътка прясно изпечен Yirgacheffe —
                        ярка, цветна, различна от всичко, което познавахме. Върнахме се с един куфар зелено кафе
                        и много въпроси. Три години по-късно въпросите станаха занаят.
                    </p>
                    <p>
                        Днес печем всяка седмица в работилницата ни в София и доставяме в цялата страна. Работим
                        директно с ферми и малки кооперативи, а всяка партида се профилира индивидуално — защото
                        кафе от Хуила и кафе от Сидамо не се пекат по един и същи начин. Каним те да усетиш
                        разликата у дома или в твоя бизнес — с нашите зърна.
                    </p>
                    <p>
                        „Ре" в ReCoffee означава рестарт — на сетивата, на навика, на представата какво може да
                        бъде сутрешното кафе. Добре дошъл в общността.
                    </p>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {values.map((value) => {
                        const Icon = value.icon;
                        return (
                            <div key={value.title} className="bg-[#F6F4F2] rounded-2xl p-8">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary mb-5">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-medium text-slate-900 text-sm uppercase tracking-wider mb-3">{value.title}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{value.text}</p>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/shop"
                        className="px-10 py-4 bg-brand-primary text-white font-bold tracking-widest text-xs uppercase hover:bg-slate-900 transition-all"
                    >
                        {t('about.cta_shop')}
                    </Link>
                    <Link
                        to="/contact"
                        className="px-10 py-4 border-2 border-slate-200 text-slate-900 font-bold tracking-widest text-xs uppercase hover:border-brand-primary hover:text-brand-primary transition-all"
                    >
                        {t('about.cta_contact')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
