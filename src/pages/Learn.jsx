import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { articles } from '../data/articles';
import PageHeader from '../components/ui/PageHeader';

export default function Learn() {
    const { t } = useTranslation();
    useSEO({
        title: t('learn.title'),
        description: 'Ръководства за приготвяне на кафе от ReCoffee — V60, еспресо, съхранение, нива на изпичане и поддръжка на оборудването.',
    });

    const [featured, ...rest] = articles;

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-24 animate-in fade-in duration-700">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <PageHeader badge={t('learn.badge')} title={t('learn.title')} intro={t('learn.intro')} />

                {/* Featured Article */}
                <Link
                    to={`/learn/${featured.slug}`}
                    className="group grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 mb-12"
                >
                    <div className="relative h-72 lg:h-auto overflow-hidden">
                        <img
                            src={featured.image}
                            alt={featured.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="p-8 md:p-14 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400 uppercase tracking-widest font-bold">
                            <span className="text-brand-primary">{featured.category}</span>
                            <span className="flex items-center gap-1.5 normal-case font-medium tracking-normal">
                                <Clock className="w-3.5 h-3.5" />
                                {featured.readMinutes} {t('learn.min_read')}
                            </span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4 group-hover:text-brand-primary transition-colors leading-tight">
                            {featured.title}
                        </h2>
                        <p className="text-slate-500 font-light leading-relaxed mb-8">{featured.excerpt}</p>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-900 group-hover:text-brand-primary transition-colors">
                            {t('learn.read_more')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </Link>

                {/* Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rest.map((article) => (
                        <Link
                            key={article.slug}
                            to={`/learn/${article.slug}`}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                    <span className="text-brand-primary">{article.category}</span>
                                    <span className="flex items-center gap-1.5 normal-case font-medium tracking-normal">
                                        <Clock className="w-3 h-3" />
                                        {article.readMinutes} {t('learn.min_read')}
                                    </span>
                                </div>
                                <h3 className="font-serif text-xl text-slate-900 mb-3 group-hover:text-brand-primary transition-colors leading-snug">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed flex-1">{article.excerpt}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
