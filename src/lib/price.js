// Bulgaria's fixed BGN ↔ EUR conversion rate (the official peg).
export const BGN_PER_EUR = 1.95583;

/**
 * **Every amount in this codebase is euro.** `products.price`, `orders.total`,
 * `store_settings.free_delivery_over_eur`, the cart, the subscription plans —
 * all EUR, stored and calculated. The lev is a derived display figure and
 * nothing more; no business rule reads it.
 *
 * That was not always true: until 20260727000016 the columns held BGN and the
 * euro was computed for display. If you find a number that behaves like lev,
 * it is a bug rather than a convention.
 */
export const toBgn = (eur) => eur * BGN_PER_EUR;

/**
 * Money arithmetic in integer cents.
 *
 * Prices are euro to two decimals, but summing them as IEEE-754 doubles
 * accumulates error: a cart that should total exactly 50.00 can add up to
 * 49.99999999999999. Formatting hides it — `toFixed(2)` prints "50.00" either
 * way — but a *comparison* does not, and the free-delivery threshold is a
 * comparison. The customer then reads "50.00 €" beside a delivery charge that
 * should not be there.
 *
 * A single multiplication or a two-line sum never drifts far enough to matter;
 * three or more lines do. Roughly one in six random multi-line carts totalling
 * exactly the threshold lands below it when compared as floats.
 *
 * `Math.round` is what makes the conversion safe: 4.30 * 100 is
 * 430.00000000000006 as a double, and rounding lands it on 430.
 */
export const toCents = (eur) => Math.round(Number(eur) * 100);

export const fromCents = (cents) => cents / 100;

/**
 * "6.60 € (12.90 лв)" — dual display for the changeover period.
 *
 * The euro leads because it is both the stored unit and the currency in
 * circulation. The lev in brackets is a courtesy for customers still converting
 * in their heads, and can be dropped once that stops being useful — deleting it
 * changes no arithmetic anywhere.
 */
export const formatPrice = (eur) =>
    `${eur.toFixed(2)} € (${toBgn(eur).toFixed(2)} лв)`;

export const formatEur = (eur) => `${eur.toFixed(2)} €`;

/** The lev equivalent of a euro amount. Display only — never fed back into a calculation. */
export const formatBgn = (eur) => `${toBgn(eur).toFixed(2)} лв`;
