import { fromCents, toCents } from './price';

/**
 * Subscription plan data, in one place because two screens need it and they
 * must not disagree: the public page quotes the price to the customer, and the
 * admin inquiry view derives it again when reading the request back.
 *
 * It deliberately does **not** travel in the inquiry. The browser used to send
 * `details.pricePerDelivery`, which meant staff were quoting from a number the
 * requester could set to anything. What gets stored is the *choice* — frequency
 * and quantity, both validated against these ids by `submit_inquiry()` — and
 * the price is derived from it wherever it is displayed.
 *
 * Labels stay with the pages; they are translated. Only ids and money live here.
 */
export const SUBSCRIPTION_DISCOUNT = 0.15;

export const SUBSCRIPTION_FREQUENCIES = ['weekly', 'biweekly', 'monthly'];

export const SUBSCRIPTION_QUANTITIES = [
    { id: '250', regularPrice: 9.15 },
    { id: '500', regularPrice: 18.30 },
    { id: '1000', regularPrice: 36.61 },
];

/** Integer cents throughout, for the reason documented in price.js. */
export const subscriptionPrice = (regularEur) =>
    fromCents(Math.round(toCents(regularEur) * (1 - SUBSCRIPTION_DISCOUNT)));

/** Price per delivery for a stored quantity id, or null if it is not a known plan. */
export const subscriptionPriceForQuantity = (quantityId) => {
    const plan = SUBSCRIPTION_QUANTITIES.find((q) => q.id === String(quantityId));
    return plan ? subscriptionPrice(plan.regularPrice) : null;
};
