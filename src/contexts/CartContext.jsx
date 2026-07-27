import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { siteConfig } from '../lib/siteConfig';
import { useProducts } from '../hooks/useProducts';
import { fromStotinki, toStotinki } from '../lib/price';

const CART_KEY = 'recoffee_cart';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

/**
 * What goes in localStorage: `{ productId, slug, quantity, grindType }` and
 * nothing else.
 *
 * This used to persist the whole product object, which meant a cart built in
 * January still quoted January's price and `onSale` in March — nothing
 * revalidated it on load, on the cart page, or at checkout. Since T1 the server
 * prices the order, so a stale snapshot can no longer decide what a customer
 * pays; but it could still decide what they were *shown*, and being quoted one
 * price and charged another is its own problem.
 *
 * `slug` is stored alongside `productId` on purpose. The local-JSON fallback in
 * useProducts emits ids like "prod_009" that are not the database uuids, and a
 * cart can outlive the fallback session that created it. The slug is the one
 * key that is stable across both sources.
 */
const normalizeStoredLine = (entry) => {
    if (!entry || typeof entry !== 'object') return null;

    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return null;

    const grindType = typeof entry.grindType === 'string' ? entry.grindType : 'none';

    // Current shape.
    if (entry.productId != null || entry.slug != null) {
        return {
            productId: entry.productId ?? null,
            slug: entry.slug ?? null,
            quantity,
            grindType,
        };
    }

    // Pre-T8 shape: the entire product object was nested under `product`. Live
    // in real browsers, so it is converted rather than discarded.
    if (entry.product && typeof entry.product === 'object') {
        return {
            productId: entry.product.id ?? null,
            slug: entry.product.slug ?? null,
            quantity,
            grindType,
        };
    }

    return null;
};

const readStoredLines = () => {
    try {
        const saved = localStorage.getItem(CART_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        // A single malformed entry drops that line, not the whole cart.
        return parsed.map(normalizeStoredLine).filter(Boolean);
    } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        try {
            localStorage.removeItem(CART_KEY);
        } catch {
            // Storage unavailable; nothing further to do.
        }
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const { products, loading: productsLoading, degraded: catalogDegraded } = useProducts();

    // Lazy init so stored lines are known on the very first render — otherwise a
    // hard refresh on /checkout would see an empty cart and redirect to /cart.
    // The hydrated `cart` still has to wait for the catalog, which is what
    // `cartLoading` below is for.
    const [lines, setLines] = useState(readStoredLines);
    const [noticeDismissed, setNoticeDismissed] = useState(false);

    // "The catalog fetch settled", not "it found something". This used to also
    // require `products.length > 0`, which meant a genuinely empty catalog left
    // it false forever — /cart spun and /checkout rendered nothing, with no way
    // out.
    const catalogReady = !productsLoading;

    // The stricter flag: a catalog worth *writing back* against. The degraded
    // fallback resolves lines by slug to local-JSON ids like "prod_009", and an
    // empty result would prune every line the customer had. Neither belongs in
    // localStorage, and neither is grounds for telling someone their product is
    // discontinued.
    const catalogTrusted = catalogReady && !catalogDegraded && products.length > 0;

    const catalogIndex = useMemo(() => {
        const byId = new Map();
        const bySlug = new Map();
        products.forEach((product) => {
            if (product.id != null) byId.set(product.id, product);
            if (product.slug) bySlug.set(product.slug, product);
        });
        return { byId, bySlug };
    }, [products]);

    const resolve = (line) =>
        catalogIndex.byId.get(line.productId) ??
        (line.slug ? catalogIndex.bySlug.get(line.slug) : undefined);

    // The cart every consumer sees, joined against the live catalog. Shape is
    // unchanged — `{ product, quantity, grindType }` — so prices, stock and sale
    // flags are now whatever the catalog says right now.
    const cart = useMemo(() => {
        if (!catalogReady) return [];
        return lines.reduce((acc, line) => {
            const product = resolve(line);
            if (product) acc.push({ product, quantity: line.quantity, grindType: line.grindType });
            return acc;
        }, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalogReady, catalogIndex, lines]);

    // Persist the *canonical* projection rather than raw state. Two things get
    // fixed on the way out, without a second state variable or a setState in an
    // effect:
    //
    //   - ids are rewritten to the catalog's own. A line migrated from a
    //     fallback session carries "prod_009" while the resolved product's id is
    //     a uuid, and removeFromCart/updateQuantity are called with the latter.
    //   - lines that no longer resolve are dropped, so the cart self-heals on
    //     the next load instead of carrying a dead entry forever.
    //
    // Skipped unless the catalog is trusted — the degraded local-JSON path and
    // an empty result both fail that test, and pruning a customer's cart
    // against a catalog we do not trust would be worse than keeping a stale
    // line.
    useEffect(() => {
        const canonical =
            catalogTrusted
                ? lines.reduce((acc, line) => {
                    const product = resolve(line);
                    if (product) {
                        acc.push({
                            productId: product.id,
                            slug: product.slug ?? null,
                            quantity: line.quantity,
                            grindType: line.grindType,
                        });
                    }
                    return acc;
                }, [])
                : lines;

        try {
            localStorage.setItem(CART_KEY, JSON.stringify(canonical));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lines, catalogTrusted, catalogIndex]);

    // True only while there is something stored that has not been joined yet, so
    // an empty cart never shows a spinner.
    const cartLoading = !catalogReady && lines.length > 0;

    // Derived, not stored: anything that failed to resolve against a healthy
    // catalog. It is excluded from `cart` immediately and gone from storage by
    // the next load, so the notice shows once and does not follow the customer
    // around.
    const unavailableCount = catalogTrusted ? lines.length - cart.length : 0;

    const addToCart = (product, quantity, grindType) => {
        setLines((prev) => {
            const existingIndex = prev.findIndex(
                (line) =>
                    (line.productId === product.id || (!!line.slug && line.slug === product.slug)) &&
                    line.grindType === grindType
            );

            if (existingIndex > -1) {
                // Replace the entry rather than mutating it: [...prev] is a
                // shallow copy, so `prev[existingIndex].quantity += …` would
                // write straight into current state.
                return prev.map((line, index) =>
                    index === existingIndex ? { ...line, quantity: line.quantity + quantity } : line
                );
            }

            return [...prev, { productId: product.id, slug: product.slug ?? null, quantity, grindType }];
        });
    };

    // Callers pass `item.product.id`, which is the catalog's id. A stored line
    // may still carry a stale one (a fallback session's "prod_009", or a uuid
    // from a different Supabase project), so match on the resolved product and
    // fall back to the raw value only when nothing resolves.
    const identifies = (line, productId) => (resolve(line)?.id ?? line.productId) === productId;

    const removeFromCart = (productId, grindType) => {
        setLines((prev) => prev.filter((line) => !(identifies(line, productId) && line.grindType === grindType)));
    };

    const updateQuantity = (productId, grindType, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, grindType);
            return;
        }

        setLines((prev) =>
            prev.map((line) =>
                identifies(line, productId) && line.grindType === grindType ? { ...line, quantity } : line
            )
        );
    };

    const clearCart = () => {
        setLines([]);
        setNoticeDismissed(false);
    };

    const dismissUnavailable = () => setNoticeDismissed(true);

    // The one place cart money is actually added up. Everything below is a
    // projection of this, so the float sum that used to live in getCartTotal()
    // can no longer reach a threshold comparison.
    const getCartTotalStotinki = () =>
        cart.reduce((total, item) => total + toStotinki(item.product.price) * item.quantity, 0);

    const getCartTotal = () => fromStotinki(getCartTotalStotinki());

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Single source of truth for the *displayed* fee: siteConfig.delivery holds
    // both numbers, so anything showing a threshold must read them from here
    // rather than repeating the literals. The charged fee is computed by
    // place_order() from store_settings — see the note in siteConfig.js.
    // Compared in stotinki, not in BGN. `getCartTotal() >= freeOverBgn` read
    // 99.99999999999999 >= 100 for a cart whose lines total exactly 100.00 and
    // charged the fee anyway, next to a subtotal that printed "100.00 лв".
    const getDeliveryFee = () => {
        const { freeOverBgn, standardFeeBgn } = siteConfig.delivery;
        return getCartTotalStotinki() >= toStotinki(freeOverBgn) ? 0 : standardFeeBgn;
    };

    const getGrandTotal = () =>
        fromStotinki(getCartTotalStotinki() + toStotinki(getDeliveryFee()));

    const value = {
        cart,
        cartLoading,
        // Re-exported rather than read from useProducts() again: every extra
        // call is another catalog fetch, and CartProvider already made one.
        // Anything under the provider can ask whether the prices on screen came
        // from the database or from the bundle.
        catalogDegraded,
        unavailableCount: noticeDismissed ? 0 : unavailableCount,
        dismissUnavailable,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getDeliveryFee,
        getGrandTotal
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
