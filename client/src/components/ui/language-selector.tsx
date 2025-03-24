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
    'logout': 'Logout',
    'signup': 'Sign Up',
    'dashboard': 'Dashboard',
    'menu': 'Menu',
    'language': 'Language',
    'offline_message': 'You are currently offline. Some features may be limited.',
    'welcome': 'Welcome to AI Health Assistant',
    'find_doctor': 'Find a Doctor',
    'book_appointment': 'Book an Appointment',
    'health_tips': 'Health Tips',
    'emergency_contact': 'Emergency Contact',
    'search': 'Search',
    'profile': 'Profile',
    'settings': 'Settings',
    'notifications': 'Notifications',
    'about_us': 'About Us',
    'contact_us': 'Contact Us',
    'privacy_policy': 'Privacy Policy',
    'terms_of_service': 'Terms of Service',
    'language_support': 'Language Support',
    'language_support_message': 'AI Health Assistant is available in multiple languages to serve the diverse communities across Africa. Select your preferred language to get health information in a language you understand best.',
    'change_language': 'Change language',
    'from_founder': 'From the Founder',
    'founder_quote': 'Growing up in Africa, I witnessed firsthand the challenges of limited healthcare access. AI Health Assistant is born from my vision to leverage technology to overcome these barriers, providing reliable health information and support to those who need it most.',
    'founder_title': 'Founder & CEO',
    'african_initiative': 'Our African Initiative',
  },
  sw: {
    'home': 'Nyumbani',
    'hospitals': 'Hospitali',
    'chatbot': 'Chatbot ya AI',
    'mental_health': 'Afya ya Akili',
    'first_aid': 'Huduma ya Kwanza',
    'login': 'Ingia',
    'logout': 'Toka',
    'signup': 'Jisajili',
    'dashboard': 'Dashibodi',
    'menu': 'Menyu',
    'language': 'Lugha',
    'offline_message': 'Uko nje ya mtandao. Baadhi ya huduma zinaweza kuwa na vikwazo.',
    'welcome': 'Karibu kwenye Msaidizi wa Afya wa AI',
    'find_doctor': 'Tafuta Daktari',
    'book_appointment': 'Weka Miadi',
    'health_tips': 'Vidokezo vya Afya',
    'emergency_contact': 'Mawasiliano ya Dharura',
    'search': 'Tafuta',
    'profile': 'Wasifu',
    'settings': 'Mipangilio',
    'notifications': 'Arifa',
    'about_us': 'Kuhusu Sisi',
    'contact_us': 'Wasiliana Nasi',
    'privacy_policy': 'Sera ya Faragha',
    'terms_of_service': 'Masharti ya Huduma',
    'language_support': 'Msaada wa Lugha',
    'language_support_message': 'Msaidizi wa Afya wa AI unapatikana kwa lugha mbalimbali ili kuhudumia jamii mbalimbali barani Afrika. Chagua lugha unayopendelea kupata habari za afya kwa lugha unayoelewa vizuri zaidi.',
    'change_language': 'Badilisha lugha',
    'from_founder': 'Kutoka kwa Mwanzilishi',
    'founder_quote': 'Nikikulia Afrika, nilishuhudia changamoto za upatikanaji mdogo wa huduma za afya. Msaidizi wa Afya wa AI umezaliwa kutokana na maono yangu ya kutumia teknolojia kuzishinda vizuizi hivi, na kutoa taarifa na msaada wa afya kwa wale wanaozihitaji zaidi.',
    'founder_title': 'Mwanzilishi na Mkurugenzi Mkuu',
    'african_initiative': 'Mpango Wetu wa Afrika',
  },
  fr: {
    'home': 'Accueil',
    'hospitals': 'Hôpitaux',
    'chatbot': 'Chatbot IA',
    'mental_health': 'Santé Mentale',
    'first_aid': 'Premiers Secours',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'signup': 'Inscription',
    'dashboard': 'Tableau de Bord',
    'menu': 'Menu',
    'language': 'Langue',
    'offline_message': 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.',
    'welcome': 'Bienvenue à Assistant Santé IA',
    'find_doctor': 'Trouver un Médecin',
    'book_appointment': 'Prendre Rendez-vous',
    'health_tips': 'Conseils de Santé',
    'emergency_contact': 'Contact d\'Urgence',
    'search': 'Rechercher',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'notifications': 'Notifications',
    'about_us': 'À Propos de Nous',
    'contact_us': 'Contactez-Nous',
    'privacy_policy': 'Politique de Confidentialité',
    'terms_of_service': 'Conditions d\'Utilisation',
    'language_support': 'Support Linguistique',
    'language_support_message': 'Assistant Santé IA est disponible en plusieurs langues pour servir les diverses communautés d\'Afrique. Sélectionnez votre langue préférée pour obtenir des informations de santé dans la langue que vous comprenez le mieux.',
    'change_language': 'Changer de langue',
    'from_founder': 'Message du Fondateur',
    'founder_quote': 'Ayant grandi en Afrique, j\'ai été témoin des défis liés à l\'accès limité aux soins de santé. Assistant Santé IA est né de ma vision d\'utiliser la technologie pour surmonter ces barrières, en fournissant des informations et un soutien de santé fiables à ceux qui en ont le plus besoin.',
    'founder_title': 'Fondateur et PDG',
    'african_initiative': 'Notre Initiative Africaine',
  },
  am: {
    'home': 'መነሻ',
    'hospitals': 'ሆስፒታሎች',
    'chatbot': 'የሰው ሰራሽ ምልልስ',
    'mental_health': 'የአእምሮ ጤና',
    'first_aid': 'የመጀመሪያ እርዳታ',
    'login': 'ግባ',
    'logout': 'ውጣ',
    'signup': 'ይመዝገቡ',
    'dashboard': 'ዳሽቦርድ',
    'menu': 'ምናሌ',
    'language': 'ቋንቋ',
    'welcome': 'እንኳን ወደ AI የጤና ረዳት በደህና መጡ',
    'find_doctor': 'ዶክተር ፈልግ',
    'profile': 'መገለጫ',
    'settings': 'ቅንብሮች',
  },
  ha: {
    'home': 'Gida',
    'hospitals': 'Asibiti',
    'chatbot': 'Mai ba da Amsa na AI',
    'mental_health': 'Lafiyar Hankali',
    'first_aid': 'Agajin Farko',
    'login': 'Shiga',
    'logout': 'Fita',
    'signup': 'Yi Rajista',
    'dashboard': 'Dashbod',
    'menu': 'Menu',
    'language': 'Harshe',
    'welcome': 'Barka da zuwa AI Mai Taimaka Lafiya',
    'find_doctor': 'Nemo Likita',
    'profile': 'Bayanan Kai',
    'settings': 'Saituna',
  },
  ar: {
    'home': 'الرئيسية',
    'hospitals': 'المستشفيات',
    'chatbot': 'المحادثة الذكية',
    'mental_health': 'الصحة النفسية',
    'first_aid': 'الإسعافات الأولية',
    'login': 'تسجيل الدخول',
    'logout': 'تسجيل الخروج',
    'signup': 'إنشاء حساب',
    'dashboard': 'لوحة التحكم',
    'menu': 'القائمة',
    'language': 'اللغة',
    'welcome': 'مرحبًا بك في مساعد الصحة الذكي',
    'find_doctor': 'ابحث عن طبيب',
    'profile': 'الملف الشخصي',
    'settings': 'الإعدادات',
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
    // Instead of throwing an error, provide a fallback context
    // This helps when components are rendering before the provider is ready
    console.warn('useLanguage was called outside of LanguageProvider, using fallback');
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string) => key
    };
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