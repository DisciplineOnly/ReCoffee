// Central place for company / contact / legal details shown across the site.
// Update here once — footer, contact page, legal pages and checkout all read from it.

export const siteConfig = {
    brandName: 'ReCoffee',
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
    delivery: {
        freeOverBgn: 100,
        standardFeeBgn: 5,
        couriers: ['Econt', 'Speedy'],
    },
};

export default siteConfig;
