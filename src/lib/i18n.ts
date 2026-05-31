import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import pt from '../locales/pt.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

const resources = {
    en: en,
    pt: pt,
    fr: fr,
    es: es
};

const getInitialLanguage = () => {
    const saved = localStorage.getItem('hello-language');
    if (saved) return saved;

    // Detect browser/system language
    const systemLang = navigator.language.split('-')[0];
    const supported = ['en', 'pt', 'es', 'fr'];
    
    return supported.includes(systemLang) ? systemLang : 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
