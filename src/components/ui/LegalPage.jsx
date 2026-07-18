import React from 'react';
import { useTranslation } from '../../lib/translations';
import { useSEO } from '../../hooks/useSEO';

export default function LegalPage({ title, lastUpdated, sections, seoDescription }) {
    const { t } = useTranslation();
    useSEO({ title, description: seoDescription });

    return (
        <div className="min-h-screen bg-white py-24 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto px-6 md:px-12">
                <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-4 font-bold">{title}</h1>
                <p className="text-sm text-slate-400 mb-12">
                    {t('common.last_updated')}: {lastUpdated}
                </p>
                <div className="space-y-10">
                    {sections.map((section, index) => (
                        <section key={index}>
                            <h2 className="font-serif text-2xl text-slate-900 mb-4">{section.heading}</h2>
                            {section.paragraphs.map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-slate-600 font-light leading-relaxed mb-4">
                                    {paragraph}
                                </p>
                            ))}
                            {section.list && (
                                <ul className="list-disc pl-6 space-y-2 text-slate-600 font-light leading-relaxed">
                                    {section.list.map((item, lIndex) => (
                                        <li key={lIndex}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
