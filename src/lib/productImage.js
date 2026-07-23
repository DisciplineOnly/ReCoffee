/**
 * Product imagery helpers.
 *
 * Catalog photos live in `public/products/<slug>.jpg`. Anything missing (a new
 * product added from the admin before its photo is uploaded) falls back to a
 * neutral placeholder instead of a broken image icon.
 */

export const PLACEHOLDER_IMAGE = '/products/placeholder.svg';

export function productImage(product) {
    return product?.images?.[0] || PLACEHOLDER_IMAGE;
}

/** `onError` handler for <img>; swaps in the placeholder once, never loops. */
export function onImageError(e) {
    if (e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) return;
    e.currentTarget.src = PLACEHOLDER_IMAGE;
}
