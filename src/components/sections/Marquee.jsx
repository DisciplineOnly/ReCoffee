import React from 'react';

export default function Marquee() {
    const content = (
        <>
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase mx-4">Free shipping on orders over $50</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase mx-4">Roasted fresh in Annapolis</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase mx-4">Sustainably Sourced</span>
            <span className="text-white/30">•</span>
        </>
    );

    return (
        <div className="w-full bg-slate-900 py-3 overflow-hidden whitespace-nowrap">
            <div className="inline-flex items-center animate-marquee">
                {/* Duplicated content for seamless scrolling */}
                {content}
                {content}
                {content}
                {content}
                {content}
                {content}
            </div>
        </div>
    );
}
