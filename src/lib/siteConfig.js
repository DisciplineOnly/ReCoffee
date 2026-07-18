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
    // Physical locations — also used as pickup points in checkout.
    locations: [
        {
            id: 'sofia_center',
            name: 'София – Център',
            address: 'бул. „Витоша" 45, 1000 София',
            hours: 'Пон – Пет: 08:00 – 19:00 · Съб: 09:00 – 17:00',
            phone: '+359 2 987 65 43',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop',
            mapUrl: 'https://maps.google.com/?q=бул.+Витоша+45,+София',
        },
        {
            id: 'sofia_lozenets',
            name: 'София – Лозенец',
            address: 'ул. „Златовръх" 22, 1164 София',
            hours: 'Пон – Пет: 08:00 – 19:00 · Съб: 09:00 – 15:00',
            phone: '+359 2 987 65 44',
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2787&auto=format&fit=crop',
            mapUrl: 'https://maps.google.com/?q=ул.+Златовръх+22,+София',
        },
        {
            id: 'plovdiv_center',
            name: 'Пловдив – Център',
            address: 'ул. „Княз Александър I" 12, 4000 Пловдив',
            hours: 'Пон – Съб: 09:00 – 19:00',
            phone: '+359 32 123 456',
            image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=2832&auto=format&fit=crop',
            mapUrl: 'https://maps.google.com/?q=ул.+Княз+Александър+I+12,+Пловдив',
        },
    ],
    delivery: {
        freeOverBgn: 100,
        standardFeeBgn: 5,
        couriers: ['Econt', 'Speedy'],
    },
};

export default siteConfig;
