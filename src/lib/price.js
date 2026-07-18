// Bulgaria's fixed BGN → EUR conversion rate (official peg used for the euro changeover).
export const BGN_PER_EUR = 1.95583;

export const toEur = (bgn) => bgn / BGN_PER_EUR;

// "12.90 лв (6.60 €)" — dual display required during the BGN/EUR transition period.
export const formatPrice = (bgn) =>
    `${bgn.toFixed(2)} лв (${toEur(bgn).toFixed(2)} €)`;

export const formatBgn = (bgn) => `${bgn.toFixed(2)} лв`;

export const formatEur = (bgn) => `${toEur(bgn).toFixed(2)} €`;
