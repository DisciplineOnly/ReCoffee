/**
 * Regenerates public/sitemap.xml from the app's own data.
 *
 *   node scripts/generate-sitemap.js
 *
 * The sitemap used to be maintained by hand, which is how it ended up listing
 * /locations (a route that no longer exists) while listing none of the product
 * pages. Deriving it from src/data/products.json, src/data/articles.js and the
 * route list below means it cannot drift again — regenerate it whenever the
 * catalogue or the routes change.
 *
 * Products come from the local mirror rather than the database on purpose: this
 * is a build-time script with no network or credentials, and the mirror is kept
 * in sync with the DB by convention (see CLAUDE.md).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { articles } from '../src/data/articles.js';
import { siteConfig } from '../src/lib/siteConfig.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const products = JSON.parse(
    readFileSync(resolve(root, 'src/data/products.json'), 'utf8')
);

// Static routes worth indexing. Cart, checkout, account, wishlist and the admin
// tree are deliberately absent — they are disallowed in robots.txt and marked
// noindex, so listing them here would contradict that.
const STATIC_ROUTES = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/shop', changefreq: 'daily', priority: '0.9' },
    { path: '/subscription', changefreq: 'monthly', priority: '0.8' },
    { path: '/wholesale', changefreq: 'monthly', priority: '0.7' },
    { path: '/learn', changefreq: 'weekly', priority: '0.6' },
    { path: '/faq', changefreq: 'monthly', priority: '0.6' },
    { path: '/delivery', changefreq: 'monthly', priority: '0.6' },
    { path: '/about', changefreq: 'yearly', priority: '0.5' },
    { path: '/contact', changefreq: 'yearly', priority: '0.5' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
    { path: '/terms', changefreq: 'yearly', priority: '0.2' },
    { path: '/cookies', changefreq: 'yearly', priority: '0.2' },
];

const escapeXml = (value) =>
    String(value).replace(/[<>&'"]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]
    );

const entries = [
    ...STATIC_ROUTES,
    ...products.map((product) => ({
        path: `/shop/${product.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
    })),
    ...articles.map((article) => ({
        path: `/learn/${article.slug}`,
        changefreq: 'yearly',
        priority: '0.5',
        lastmod: article.date,
    })),
];

const body = entries
    .map(({ path, changefreq, priority, lastmod }) => {
        const loc = `<loc>${escapeXml(siteConfig.url + path)}</loc>`;
        const mod = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
        return `  <url>${loc}${mod}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    })
    .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), xml, 'utf8');

console.log(
    `sitemap.xml written — ${entries.length} URLs ` +
    `(${STATIC_ROUTES.length} static, ${products.length} products, ${articles.length} articles)`
);
