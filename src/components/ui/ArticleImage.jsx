import React from 'react';
import { Coffee } from 'lucide-react';

/**
 * Article artwork, with a branded stand-in for articles that have no photo yet.
 *
 * `image` on an article in `src/data/articles.js` is optional: the Learn section
 * shipped with stock photography that has been removed, and real photography has
 * not replaced it. Rendering a panel rather than nothing keeps the card and hero
 * layouts the shape they were designed for, and avoids a broken-image icon.
 */
export default function ArticleImage({ src, alt, className = '' }) {
    if (src) {
        return <img src={src} alt={alt} className={className} />;
    }

    return (
        <div
            className={`bg-brand-primary/5 flex items-center justify-center ${className}`}
            role="presentation"
        >
            <Coffee className="w-1/5 h-1/5 max-w-16 max-h-16 text-brand-primary/25" />
        </div>
    );
}
