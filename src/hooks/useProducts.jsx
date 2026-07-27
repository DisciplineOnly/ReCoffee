import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// Import local JSON just for the image mapping fallback
import localProducts from '../data/products.json';

// An RLS denial, a dropped column and an unreachable host all arrive here as a
// single rejected promise, and `console.warn('Falling back to local JSON data.')`
// said nothing about which. Whoever reads the log needs to know whether to fix a
// policy, run a migration or check the network.
const FAILURE_BY_CODE = {
    '42501': 'permission denied — an RLS policy or a missing grant on products/product_flavors',
    '42P01': 'schema mismatch — the table does not exist',
    '42703': 'schema mismatch — a selected column does not exist',
};

// supabase-js does not rethrow the fetch failure. It wraps it in the same shape
// as a Postgres error — empty `code`, the stringified original in `message` —
// so the outage case, the one most worth naming, has to be matched on text.
const NETWORK_MESSAGE = /failed to fetch|networkerror|network request failed|fetch failed|load failed/i;

function describeFailure(error) {
    if (!error) return 'unknown failure (no error object)';
    if (FAILURE_BY_CODE[error.code]) return FAILURE_BY_CODE[error.code];
    if (typeof error.code === 'string' && error.code.startsWith('PGRST')) {
        return `PostgREST rejected the request (${error.code}) — usually a stale schema cache or a bad query`;
    }
    if (error instanceof TypeError || (!error.code && NETWORK_MESSAGE.test(error.message ?? ''))) {
        return 'network failure — the Supabase host was unreachable (offline, bad VITE_SUPABASE_URL, or CORS)';
    }
    return 'unclassified failure';
}

/**
 * Hook to fetch products from Supabase.
 *
 * On failure it serves `src/data/products.json` — prices baked into the bundle
 * at build time — so the catalog still browses during an outage. That fallback
 * is deliberate, but it used to be *silent*: stale prices flowed into the cart
 * and on into checkout with nothing telling anyone. `degraded` is how the rest
 * of the app knows, so it can say so and refuse to take an order it cannot
 * price. An empty catalog is **not** degraded — zero products is a real answer
 * from a healthy database, and falling back on it would resurrect a catalog the
 * admin deliberately emptied.
 *
 * @returns {Object} { products, loading, error, degraded }
 */
export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [degraded, setDegraded] = useState(false);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);

                // Fetch products
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (productsError) throw productsError;

                // Fetch flavors for all products
                const { data: flavorsData, error: flavorsError } = await supabase
                    .from('product_flavors')
                    .select('product_id, flavor_name_bg');

                if (flavorsError) throw flavorsError;

                // Merge into frontend format
                const mergedProducts = productsData.map(product => {
                    const productFlavors = flavorsData
                        .filter(f => f.product_id === product.id)
                        .map(f => f.flavor_name_bg);

                    // Find local product to get the image URL as fallback
                    // We match by slug since that is unique and stable
                    const localMatch = localProducts.find(lp => lp.slug === product.slug);
                    const localImages = localMatch ? localMatch.images : [];

                    // Prioritize DB image, fallback to local
                    const validImages = product.image_url ? [product.image_url] : localImages;

                    // Merchandising: sale price becomes the effective selling price so
                    // cart/checkout math stays correct; originalPrice is kept for display.
                    const onSale = product.sale_price != null && Number(product.sale_price) < Number(product.price);
                    const effectivePrice = onSale ? Number(product.sale_price) : Number(product.price);

                    // "New" badge: explicit admin-controlled flag
                    const isNew = product.is_new === true;

                    return {
                        id: product.id,
                        slug: product.slug,
                        name: product.name_bg,
                        nameEn: product.name_en,
                        description: product.description_bg,
                        descriptionEn: product.description_en,
                        price: effectivePrice,
                        originalPrice: onSale ? Number(product.price) : null,
                        onSale,
                        isNew,
                        currency: 'BGN', // Hardcoded for now
                        images: validImages,
                        category: product.category,
                        origin: product.origin,
                        process: product.process,
                        roastLevel: product.roast_level,
                        flavorNotes: productFlavors,
                        weight: product.weight_grams,
                        inStock: product.in_stock,
                        featured: product.featured
                    };
                });

                if (mergedProducts.length === 0) {
                    // A healthy round-trip that returned nothing. Not a fallback
                    // case: the shop is genuinely empty and should look it.
                    console.info('Catalog fetch succeeded but returned zero products.');
                }

                setProducts(mergedProducts);
                setDegraded(false);
                setError(null);
            } catch (err) {
                console.error(
                    `Catalog fetch failed — ${describeFailure(err)}. Serving the local JSON catalog; checkout is blocked while this lasts.`,
                    { code: err?.code, message: err?.message, details: err?.details, hint: err?.hint }
                );
                setProducts(localProducts);
                setDegraded(true);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return { products, loading, error, degraded };
}
