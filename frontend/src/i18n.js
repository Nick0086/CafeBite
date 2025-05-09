import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    // Add more languages as needed (e.g., 'es' for Spanish)
};

i18n
    .use(LanguageDetector) // Detects user's language
    .use(initReactI18next) // Integrates with React
    .init({
        resources,
        fallbackLng: 'en', // Default language if translation is missing
        interpolation: {
            escapeValue: false, // React escapes values by default
        },
        detection: {
            order: ['localStorage', 'navigator'], // Check localStorage first, then browser settings
            caches: ['localStorage'], // Persist language choice in localStorage
        },
    });

export default i18n;