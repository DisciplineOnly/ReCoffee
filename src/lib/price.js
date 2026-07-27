// Bulgaria's fixed BGN → EUR conversion rate (official peg used for the euro changeover).
export const BGN_PER_EUR = 1.95583;

/**
 * Money arithmetic in integer stotinki.
 *
 * Every price here is BGN to two decimals, but summing them as IEEE-754
 * doubles accumulates error: a cart whose lines total exactly 100.00 can add
 * up to 99.99999999999999. Formatting hides it — `toFixed(2)` prints "100.00"
 * either way — but a *comparison* does not, and the free-delivery threshold is
 * a comparison. The customer then reads "100.00 лв" beside a 5 лв delivery
 * charge that should not be there.
 *
 * A single multiplication or a two-line sum never drifts far enough to matter
 * at 100 — the error is below half an ULP. Three or more lines do: roughly one
 * in six random multi-line carts totalling exactly 100.00 lands below it.
 *
 * `Math.round` is what makes the conversion safe: 4.30 * 100 is
 * 430.00000000000006 as a double, and rounding lands it on 430.
 */
export const toStotinki = (bgn) => Math.round(Number(bgn) * 100);

export const fromStotinki = (stotinki) => stotinki / 100;

export const toEur = (bgn) => bgn / BGN_PER_EUR;

/**
 * "6.60 € (12.90 лв)" — dual display for the changeover period.
 *
 * **The euro leads.** It is the currency in circulation; the lev figure is the
 * informational one shown alongside it. Prices are still *stored* in BGN
 * (`products.price`, `orders.total`, `store_settings`) and every calculation
 * happens in stotinki, so this is a presentation decision and nothing else —
 * converting the columns would be a different and much larger change.
 *
 * Admin screens deliberately stay in lev: they edit the stored value, and
 * showing an operator a converted number they cannot type back is worse than
 * showing them the column.
 */
export const formatPrice = (bgn) =>
    `${toEur(bgn).toFixed(2)} € (${bgn.toFixed(2)} лв)`;

export const formatBgn = (bgn) => `${bgn.toFixed(2)} лв`;

export const formatEur = (bgn) => `${toEur(bgn).toFixed(2)} €`;
