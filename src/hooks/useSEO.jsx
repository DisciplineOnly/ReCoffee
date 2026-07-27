import { useEffect } from 'react';
import { siteConfig } from '../lib/siteConfig';
import { formatEur } from '../lib/price';

const DEFAULT_TITLE = 'ReCoffee | Прясно изпечено специално кафе';
const DEFAULT_DESCRIPTION = `ReCoffee — специално кафе, изпечено в София. Единични произходи, смеси и абонамент с безплатна доставка над ${formatEur(siteConfig.delivery.freeOverBgn)}.`;
const DEFAULT_IMAGE = '/og-image.jpg';

/** Upsert a <meta> by name= or property=, creating it on first use. */
function setMeta(attr, key, content) {
    let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

function setLink(rel, href) {
    let tag = document.head.querySelector(`link[rel="${rel}"]`);
    if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
}

/**
 * Per-route SEO: title, description, canonical, Open Graph, Twitter card,
 * indexing directive and JSON-LD.
 *
 * The app is client-rendered, so everything here runs after hydration. Crawlers
 * that execute JavaScript (Google) see it; those that don't fall back to the
 * static tags in index.html. That is why index.html carries a complete default
 * set rather than placeholders — a non-rendering crawler must still get a valid
 * title, description, preview image and organization graph.
 *
 * @param {object}   opts
 * @param {string}   [opts.title]       Page title; site name is appended.
 * @param {string}   [opts.description] Meta description.
 * @param {string}   [opts.image]       Preview image, site-relative or absolute.
 * @param {string}   [opts.type]        Open Graph type. Defaults to 'website'.
 * @param {boolean}  [opts.noindex]     Keep the page out of search results.
 * @param {object|object[]} [opts.jsonLd] Schema.org node(s) from lib/structuredData.
 */
export function useSEO({ title, description, image, type = 'website', noindex = false, jsonLd } = {}) {
    // Objects/arrays are rebuilt every render, so identity would thrash the
    // effect. Serialising is cheap here (a handful of small nodes) and makes the
    // dependency compare by value.
    const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

    useEffect(() => {
        const fullTitle = title ? `${title} | ${siteConfig.brandName}` : DEFAULT_TITLE;
        const desc = description || DEFAULT_DESCRIPTION;
        const canonical = window.location.origin + window.location.pathname;
        const preview = image
            ? (image.startsWith('http') ? image : siteConfig.url + image)
            : siteConfig.url + DEFAULT_IMAGE;

        document.title = fullTitle;
        setMeta('name', 'description', desc);
        setLink('canonical', canonical);

        // Cart, checkout and account pages are useless in a search result and
        // would leak thin duplicate URLs; robots.txt blocks most of them too.
        setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:type', type);
        setMeta('property', 'og:url', canonical);
        setMeta('property', 'og:image', preview);
        setMeta('property', 'og:site_name', siteConfig.brandName);
        setMeta('property', 'og:locale', 'bg_BG');

        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', desc);
        setMeta('name', 'twitter:image', preview);

        // Route-specific JSON-LD only. The Organization/WebSite graph lives in
        // index.html and is deliberately left alone here.
        const previous = document.head.querySelectorAll('script[data-seo-jsonld]');
        previous.forEach(node => node.remove());

        if (jsonLdKey) {
            const nodes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
            nodes.filter(Boolean).forEach(node => {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-seo-jsonld', '');
                script.textContent = JSON.stringify(node);
                document.head.appendChild(script);
            });
        }

        return () => {
            document.head
                .querySelectorAll('script[data-seo-jsonld]')
                .forEach(node => node.remove());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, image, type, noindex, jsonLdKey]);
}

export default useSEO;
