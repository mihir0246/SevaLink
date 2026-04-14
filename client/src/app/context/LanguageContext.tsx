import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.surveys': 'Surveys',
    'nav.needs': 'Needs',
    'nav.volunteers': 'Volunteers',
    'nav.map': 'Map',
    'nav.reports': 'Reports',
    'nav.availableTasks': 'Available Tasks',
    'nav.myTasks': 'My Tasks',
    'nav.profile': 'Profile',

    // Landing Page
    'landing.hero.title': 'Connecting Community Needs with the Right Help',
    'landing.hero.subtitle': 'Empowering NGOs and volunteers to create meaningful impact through smart data collection and coordination',
    'landing.cta.getStarted': 'Get Started',
    'landing.cta.joinVolunteer': 'Join as Volunteer',

    // Common
    'common.accept': 'Accept',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.surveys': 'सर्वेक्षण',
    'nav.needs': 'आवश्यकताएं',
    'nav.volunteers': 'स्वयंसेवक',
    'nav.map': 'मानचित्र',
    'nav.reports': 'रिपोर्ट',
    'nav.availableTasks': 'उपलब्ध कार्य',
    'nav.myTasks': 'मेरे कार्य',
    'nav.profile': 'प्रोफ़ाइल',

    // Landing Page
    'landing.hero.title': 'सामुदायिक आवश्यकताओं को सही मदद से जोड़ना',
    'landing.hero.subtitle': 'स्मार्ट डेटा संग्रह और समन्वय के माध्यम से सार्थक प्रभाव बनाने के लिए एनजीओ और स्वयंसेवकों को सशक्त बनाना',
    'landing.cta.getStarted': 'शुरू करें',
    'landing.cta.joinVolunteer': 'स्वयंसेवक के रूप में शामिल हों',

    // Common
    'common.accept': 'स्वीकार करें',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.loading': 'लोड हो रहा है...',
  },
  mr: {
    // Navigation
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.surveys': 'सर्वेक्षण',
    'nav.needs': 'गरजा',
    'nav.volunteers': 'स्वयंसेवक',
    'nav.map': 'नकाशा',
    'nav.reports': 'अहवाल',
    'nav.availableTasks': 'उपलब्ध कार्ये',
    'nav.myTasks': 'माझी कार्ये',
    'nav.profile': 'प्रोफाइल',

    // Landing Page
    'landing.hero.title': 'समुदायाच्या गरजा योग्य मदतीशी जोडणे',
    'landing.hero.subtitle': 'स्मार्ट डेटा संकलन आणि समन्वयाद्वारे अर्थपूर्ण प्रभाव निर्माण करण्यासाठी एनजीओ आणि स्वयंसेवकांना सक्षम करणे',
    'landing.cta.getStarted': 'सुरू करा',
    'landing.cta.joinVolunteer': 'स्वयंसेवक म्हणून सामील व्हा',

    // Common
    'common.accept': 'स्वीकारा',
    'common.submit': 'सबमिट करा',
    'common.cancel': 'रद्द करा',
    'common.save': 'जतन करा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.loading': 'लोड होत आहे...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
