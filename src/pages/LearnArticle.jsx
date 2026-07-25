import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { useSEO } from '../hooks/useSEO';
import { getArticleBySlug, articles } from '../data/articles';
import ArticleImage from '../components/ui/ArticleImage';
import { articleSchema, breadcrumbSchema } from '../lib/structuredData';

export default function LearnArticle() {
    const { slug } = useParams();
    const { t } = useTranslation();
    const article = getArticleBySlug(slug);

    useSEO({
        title: article ? article.title : t('learn.not_found'),
        description: article ? article.excerpt : undefined,
        type: article ? 'article' : 'website',
        noindex: !article,
        jsonLd: article
            ? [
                articleSchema(article),
                breadcrumbSchema([
                    { name: t('common.home'), path: '/' },
                    { name: t('learn.title'), path: '/learn' },
                    { name: article.title, path: `/learn/${article.slug}` },
                ]),
            ]
            : undefined,
    });

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-serif text-slate-900 mb-4">{t('learn.not_found')}</h1>
                    <Link to="/learn" className="text-brand-primary hover:text-brand-secondary">
                        {t('learn.back_to_articles')}
                    </Link>
                </div>
            </div>
        );
    }

    const related = articles.filter(a => a.slug !== slug).slice(0, 3);

    return (
        <div className="min-h-screen bg-white pt-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto px-6 md:px-12">
                <Link
                    to="/learn"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-brand-primary transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm uppercase tracking-wider font-bold">{t('learn.back_to_articles')}</span>
                </Link>

                <div className="flex items-center gap-4 mb-6 text-xs text-slate-400 uppercase tracking-widest font-bold">
                    <span className="text-brand-primary">{article.category}</span>
                    <span className="flex items-center gap-1.5 normal-case font-medium tracking-normal">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readMinutes} {t('learn.min_read')}
                    </span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-8 font-bold leading-tight">
                    {article.title}
                </h1>

                <div className="relative h-[400px] overflow-hidden rounded-2xl mb-12">
                    <ArticleImage src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>

                <div className="space-y-10 mb-20">
                    {article.sections.map((section, index) => (
                        <section key={index}>
                            <h2 className="font-serif text-2xl md:text-3xl text-slate-900 mb-4">{section.heading}</h2>
                            {section.paragraphs.map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-slate-600 font-light leading-relaxed text-lg mb-4">
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    ))}
                </div>

                {/* Related */}
                <div className="border-t border-slate-100 pt-12">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
                        {t('learn.back_to_articles')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {related.map((rel) => (
                            <Link key={rel.slug} to={`/learn/${rel.slug}`} className="group">
                                <div className="relative h-36 overflow-hidden rounded-xl mb-3">
                                    <ArticleImage
                                        src={rel.image}
                                        alt={rel.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h4 className="font-serif text-lg text-slate-900 group-hover:text-brand-primary transition-colors leading-snug">
                                    {rel.title}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
