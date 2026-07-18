import React from 'react';

export default function PageHeader({ badge, title, intro, align = 'center' }) {
    const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
    return (
        <div className={`mb-16 max-w-3xl ${alignClass}`}>
            {badge && (
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3 block">
                    {badge}
                </span>
            )}
            <h1 className="font-serif text-4xl md:text-6xl text-slate-900 mb-6 font-bold leading-tight">
                {title}
            </h1>
            {intro && (
                <p className="text-slate-600 font-light text-lg leading-relaxed">
                    {intro}
                </p>
            )}
        </div>
    );
}
