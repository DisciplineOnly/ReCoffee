// Central place for company / contact / legal details shown across the site.
// Update here once — footer, contact page, legal pages and checkout all read from it.

export const siteConfig = {
    brandName: 'ReCoffee',
    // Canonical origin, no trailing slash. Used for canonical URLs, Open Graph,
    // JSON-LD and the sitemap generator.
    url: 'https://recoffee.bg',
    legalName: '„РеКофи" ЕООД',
    vatNumber: 'BG206123456',
    email: 'hello@recoffee.bg',
    supportEmail: 'support@recoffee.bg',
    wholesaleEmail: 'b2b@recoffee.bg',
    phone: '+359 2 987 65 43',
    phoneHref: 'tel:+35929876543',
    address: 'бул. „Витоша" 45, 1000 София, България',
    workingHours: 'Понеделник – Петък: 08:00 – 19:00 · Събота: 09:00 – 17:00',
    orderCutoff: 'Поръчки, направени до 14:00 ч. в работен ден, се изпращат същия ден.',
    social: {
        instagram: 'https://www.instagram.com/recoffee.bg',
        facebook: 'https://www.facebook.com/recoffee.bg',
    },
    // DISPLAY ONLY. The database is authoritative for what a customer is
    // actually charged: place_order() computes the delivery fee from the
    // `store_settings` row, ignoring anything the browser sends. These two
    // numbers only drive what the cart, checkout and marketing copy *show*, so
    // keep them in step with `store_settings.free_delivery_over_eur` /
    // `standard_delivery_fee_eur` or the quoted fee will not match the charged
    // one. **Euro, like every other amount in this codebase.**
    delivery: {
        freeOverEur: 50,
        standardFeeEur: 2.56,
        couriers: ['Econt', 'Speedy'],
    },
};

export default siteConfig;
