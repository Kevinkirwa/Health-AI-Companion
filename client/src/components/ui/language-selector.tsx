import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define available languages
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ar', name: 'Arabic', flag: '🇪🇬' },
];

// Define language context type
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

// Create language context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Sample translations for demonstration
const translations: Record<string, Record<string, string>> = {
  en: {
    'home': 'Home',
    'hospitals': 'Hospitals',
    'chatbot': 'AI Chatbot',
    'mental_health': 'Mental Health',
    'first_aid': 'First Aid',
    'login': 'Login',
    'signup': 'Sign Up',
    'offline_message': 'You are currently offline. Some features may be limited.',
    'welcome': 'Welcome to AI Health Assistant',
    'find_doctor': 'Find a Doctor',
    'book_appointment': 'Book an Appointment',
    'health_tips': 'Health Tips',
  },
  sw: {
    'home': 'Nyumbani',
    'hospitals': 'Hospitali',
    'chatbot': 'Chatbot ya AI',
    'mental_health': 'Afya ya Akili',
    'first_aid': 'Huduma ya Kwanza',
    'login': 'Ingia',
    'signup': 'Jisajili',
    'offline_message': 'Uko nje ya mtandao. Baadhi ya huduma zinaweza kuwa na vikwazo.',
    'welcome': 'Karibu kwenye Msaidizi wa Afya wa AI',
    'find_doctor': 'Tafuta Daktari',
    'book_appointment': 'Weka Miadi',
    'health_tips': 'Vidokezo vya Afya',
  },
  fr: {
    'home': 'Accueil',
    'hospitals': 'Hôpitaux',
    'chatbot': 'Chatbot IA',
    'mental_health': 'Santé Mentale',
    'first_aid': 'Premiers Secours',
    'login': 'Connexion',
    'signup': 'Inscription',
    'offline_message': 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.',
    'welcome': 'Bienvenue à Assistant Santé IA',
    'find_doctor': 'Trouver un Médecin',
    'book_appointment': 'Prendre Rendez-vous',
    'health_tips': 'Conseils de Santé',
  },
};

// For languages without translations yet, use English as fallback
const fallbackLanguage = 'en';

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get initial language from localStorage or use browser language or default to English
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) return savedLanguage;
      
      const browserLanguage = navigator.language.split('-')[0];
      if (languages.some(lang => lang.code === browserLanguage)) {
        return browserLanguage;
      }
    }
    return 'en'; // Default to English
  };

  const [language, setLanguageState] = useState(getInitialLanguage());

  // Set language and save to localStorage
  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
  };

  // Translation function
  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if translation not found
    if (translations[fallbackLanguage] && translations[fallbackLanguage][key]) {
      return translations[fallbackLanguage][key];
    }
    
    // Return the key itself if no translation found
    return key;
  };

  // Update document language attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language selector component
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="relative inline-block">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Text component that uses the current language
export function Text({ id, fallback }: { id: string; fallback?: string }) {
  const { t } = useLanguage();
  return <>{t(id) || fallback || id}</>;
}