import bg from './bg.json';
import en from './en.json';

const translations = { bg, en };
const defaultLang = 'bg';

// Defined at module scope so the reference is stable across renders. Callers
// list `t` in useEffect/useCallback dependency arrays; a per-render closure
// would make those effects re-run forever.
const t = (key) => {
    const keys = key.split('.');
    let value = translations[defaultLang];

    for (const k of keys) {
        value = value?.[k];
    }

    // Fallback to English if key not found in Bulgarian
    if (!value && defaultLang !== 'en') {
        let fallback = translations['en'];
        for (const k of keys) {
            fallback = fallback?.[k];
        }
        return fallback || key;
    }

    return value || key;
};

export const useTranslation = () => {
    return { t, lang: defaultLang };
};
