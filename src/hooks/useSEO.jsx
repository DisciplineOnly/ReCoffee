import { useEffect } from 'react';

const DEFAULT_TITLE = 'ReCoffee | Прясно изпечено специално кафе';
const DEFAULT_DESCRIPTION = 'ReCoffee — специално кафе, изпечено в София. Единични произходи, смеси и абонамент с безплатна доставка над 100 лв.';

/**
 * Lightweight per-route SEO: sets document title, meta description and canonical URL.
 * (SPA without SSR — this covers browsers and JS-rendering crawlers.)
 */
export function useSEO({ title, description } = {}) {
    useEffect(() => {
        document.title = title ? `${title} | ReCoffee` : DEFAULT_TITLE;

        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', description || DEFAULT_DESCRIPTION);

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', window.location.origin + window.location.pathname);
    }, [title, description]);
}

export default useSEO;
