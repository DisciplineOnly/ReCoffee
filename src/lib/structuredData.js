/**
 * Schema.org JSON-LD builders.
 *
 * These feed `useSEO({ jsonLd })`, which injects them into the document head.
 * Because the app is client-rendered, JS-injected JSON-LD is read by crawlers
 * that execute JavaScript (Google does) but not by those that don't — most
 * social scrapers and several AI crawlers. The Organization and WebSite graphs
 * every page needs are therefore *also* hardcoded into index.html, where they
 * are visible without rendering. Keep the two in sync if you change identity.
 *
 * Everything returns a plain object; callers never build JSON by hand.
 */

import { siteConfig } from './siteConfig';

const SITE = siteConfig.url;

/** Absolute URL from a site-relative path. */
export function absoluteUrl(path = '/') {
    if (!path) return SITE;
    if (path.startsWith('http')) return path;
    return `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Stable @id for the organization, so other nodes can reference it. */
export const ORGANIZATION_ID = `${SITE}/#organization`;

export function organizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Store',
        '@id': ORGANIZATION_ID,
        name: siteConfig.brandName,
        legalName: siteConfig.legalName,
        vatID: siteConfig.vatNumber,
        url: SITE,
        logo: absoluteUrl('/og-image.jpg'),
        image: absoluteUrl('/og-image.jpg'),
        email: siteConfig.email,
        telephone: siteConfig.phone,
        priceRange: '$$',
        currenciesAccepted: 'BGN',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'бул. „Витоша" 45',
            addressLocality: 'София',
            postalCode: '1000',
            addressCountry: 'BG',
        },
        sameAs: Object.values(siteConfig.social),
    };
}

export function webSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: siteConfig.brandName,
        inLanguage: 'bg-BG',
        publisher: { '@id': ORGANIZATION_ID },
        potentialAction: {
            '@type': 'SearchAction',
            // `q` is the parameter Shop.jsx actually reads — see SearchOverlay,
            // which navigates to /shop?q=…
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE}/shop?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * @param {Array<{name: string, path: string}>} trail
 */
export function breadcrumbSchema(trail) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
        })),
    };
}

/**
 * Product offer. `product` is the camelCase frontend shape from useProducts.
 * `price` is already the effective (sale-aware) price, which is what a shopper
 * actually pays and therefore what belongs in the offer.
 */
export function productSchema(product, { image } = {}) {
    if (!product) return null;

    const url = absoluteUrl(`/shop/${product.slug}`);

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.slug,
        image: [absoluteUrl(image || product.images?.[0] || '/og-image.jpg')],
        brand: {
            '@type': 'Brand',
            name: product.origin || siteConfig.brandName,
        },
        ...(product.weight ? { weight: { '@type': 'QuantitativeValue', value: product.weight, unitCode: 'GRM' } } : {}),
        offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'BGN',
            price: Number(product.price).toFixed(2),
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@id': ORGANIZATION_ID },
        },
    };
}

/**
 * FAQPage — the schema answer engines lean on hardest. `items` is the same
 * `{ q, a }` shape the FAQ page already renders.
 */
export function faqSchema(items) {
    // Some answers are JSX (they embed links), which cannot go into JSON-LD.
    // Those entries carry a `plain` string; anything still not a string is
    // dropped rather than serialised into nonsense.
    const answerable = items
        .map(({ q, a, plain }) => ({ q, text: typeof plain === 'string' ? plain : a }))
        .filter(({ q, text }) => typeof q === 'string' && typeof text === 'string');

    if (!answerable.length) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: answerable.map(({ q, text }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text },
        })),
    };
}

export function articleSchema(article) {
    if (!article) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.date,
        inLanguage: 'bg-BG',
        articleSection: article.category,
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        mainEntityOfPage: absoluteUrl(`/learn/${article.slug}`),
        ...(article.image ? { image: [absoluteUrl(article.image)] } : {}),
    };
}
