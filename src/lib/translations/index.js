import bg from './bg.json';
import en from './en.json';

const translations = { bg, en };
const defaultLang = 'bg';

export const useTranslation = () => {
    const lang = defaultLang;

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[lang];

        for (const k of keys) {
            value = value?.[k];
        }

        // Fallback to English if key not found in Bulgarian
        if (!value && lang !== 'en') {
            let fallback = translations['en'];
            for (const k of keys) {
                fallback = fallback?.[k];
            }
            return fallback || key;
        }

        return value || key;
    };

    return { t, lang };
};
