import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'bn';

const translations = {
  en: {
    // Sidebar
    'Dashboard': 'Dashboard',
    'Clients': 'Clients',
    'Kundli': 'Kundli',
    'Appointments': 'Appointments',
    'Consultations': 'Consultations',
    'Practice Management': 'Practice Management',
    'Workspace': 'Workspace',
    'Connected': 'Connected',
    'Offline Mode': 'Offline Mode',
    'Sync': 'Sync',

    // Kundli Page
    'Kundli Generator': 'Kundli Generator',
    'Offline_Calc': 'Offline • Real Calculation (Meeus Algorithms + Lahiri Ayanamsha)',
    'Load Saved': 'Load Saved',
    'Save Kundli': 'Save Kundli',
    'Print': 'Print',
    'Birth Details': 'Birth Details',
    'Full Name': 'Full Name',
    'Date of Birth': 'Date of Birth',
    'Time of Birth': 'Time of Birth',
    'City / Place': 'City / Place',
    'Latitude': 'Latitude',
    'Longitude': 'Longitude',
    'Timezone (UTC+)': 'Timezone (UTC+)',
    'Generate Kundli': 'Generate Kundli',
    'Calculating': 'Calculating...',
    
    // Tabs
    'D1_Rashi': 'D1 · Rashi',
    'D9_Navamsa': 'D9 · Navamsa',
    'D3_Drekkana': 'D3 · Drekkana',
    'D10_Dasamsa': 'D10 · Dasamsa',
    'Gochor': 'Gochor',
    'Planets': 'Planets',
    'Dasha': 'Dasha',

    // Chart texts
    'Lagna': 'Lagna',
    'Current Dasha': 'Current Dasha',
    'Moon Sign (Rashi)': 'Moon Sign (Rashi)',
    'Moon Nakshatra': 'Moon Nakshatra',
    'Pada': 'Pada',
    'Positions': 'Positions',
    'until': 'until',
    
    // Planets
    'Sun': 'Sun', 'Moon': 'Moon', 'Mars': 'Mars', 'Mercury': 'Mercury',
    'Jupiter': 'Jupiter', 'Venus': 'Venus', 'Saturn': 'Saturn',
    'Rahu': 'Rahu', 'Ketu': 'Ketu', 'Ascendant': 'Ascendant',

    // Signs
    'Aries': 'Aries', 'Taurus': 'Taurus', 'Gemini': 'Gemini', 'Cancer': 'Cancer',
    'Leo': 'Leo', 'Virgo': 'Virgo', 'Libra': 'Libra', 'Scorpio': 'Scorpio',
    'Sagittarius': 'Sagittarius', 'Capricorn': 'Capricorn', 'Aquarius': 'Aquarius', 'Pisces': 'Pisces'
  },
  hi: {
    // Sidebar
    'Dashboard': 'डैशबोर्ड',
    'Clients': 'ग्राहक (Clients)',
    'Kundli': 'कुण्डली',
    'Appointments': 'अपॉइंटमेंट',
    'Consultations': 'परामर्श',
    'Practice Management': 'प्रैक्टिस प्रबंधन',
    'Workspace': 'कार्यक्षेत्र',
    'Connected': 'ऑनलाइन',
    'Offline Mode': 'ऑफ़लाइन मोड',
    'Sync': 'सिंक (Sync)',

    // Kundli Page
    'Kundli Generator': 'कुण्डली निर्माण',
    'Offline_Calc': 'ऑफ़लाइन • सटीक गणना (Meeus Algorithms + Lahiri Ayanamsha)',
    'Load Saved': 'खोलें',
    'Save Kundli': 'सेव करें',
    'Print': 'प्रिंट',
    'Birth Details': 'जन्म विवरण',
    'Full Name': 'पूरा नाम',
    'Date of Birth': 'जन्म तिथि',
    'Time of Birth': 'जन्म समय',
    'City / Place': 'शहर / स्थान',
    'Latitude': 'अक्षांश (Latitude)',
    'Longitude': 'देशांतर (Longitude)',
    'Timezone (UTC+)': 'टाइमज़ोन (UTC+)',
    'Generate Kundli': 'कुण्डली बनाएं',
    'Calculating': 'गणना हो रही है...',
    
    // Tabs
    'D1_Rashi': 'D1 · राशि',
    'D9_Navamsa': 'D9 · नवमांश',
    'D3_Drekkana': 'D3 · द्रेष्काण',
    'D10_Dasamsa': 'D10 · दशमांश',
    'Gochor': 'गोचर',
    'Planets': 'ग्रह',
    'Dasha': 'दशा',

    // Chart texts
    'Lagna': 'लग्न',
    'Current Dasha': 'वर्तमान दशा',
    'Moon Sign (Rashi)': 'चन्द्र राशि',
    'Moon Nakshatra': 'चन्द्र नक्षत्र',
    'Pada': 'पद',
    'Positions': 'ग्रह स्थिति',
    'until': 'तक',

    // Planets
    'Sun': 'सूर्य', 'Moon': 'चन्द्र', 'Mars': 'मंगल', 'Mercury': 'बुध',
    'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि',
    'Rahu': 'राहु', 'Ketu': 'केतु', 'Ascendant': 'लग्न',

    // Signs
    'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
    'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
    'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
  },
  bn: {
    // Sidebar
    'Dashboard': 'ড্যাশবোর্ড',
    'Clients': 'ক্লায়েন্ট',
    'Kundli': 'কুণ্ডলী',
    'Appointments': 'অ্যাপয়েন্টমেন্ট',
    'Consultations': 'পরামর্শ',
    'Practice Management': 'প্র্যাকটিস ম্যানেজমেন্ট',
    'Workspace': 'ওয়ার্কস্পেস',
    'Connected': 'অনলাইন',
    'Offline Mode': 'অফলাইন মোড',
    'Sync': 'সিঙ্ক (Sync)',

    // Kundli Page
    'Kundli Generator': 'কুণ্ডলী তৈরি করুন',
    'Offline_Calc': 'অফলাইন • সঠিক গণনা (Meeus Algorithms + Lahiri Ayanamsha)',
    'Load Saved': 'খুলুন',
    'Save Kundli': 'সেভ করুন',
    'Print': 'প্রিন্ট',
    'Birth Details': 'জন্ম বিবরণ',
    'Full Name': 'পুরো নাম',
    'Date of Birth': 'জন্ম তারিখ',
    'Time of Birth': 'জন্ম সময়',
    'City / Place': 'শহর / স্থান',
    'Latitude': 'অক্ষাংশ (Latitude)',
    'Longitude': 'দ্রাঘিমাংশ (Longitude)',
    'Timezone (UTC+)': 'টাইমজোন (UTC+)',
    'Generate Kundli': 'কুণ্ডলী তৈরি করুন',
    'Calculating': 'গণনা করা হচ্ছে...',
    
    // Tabs
    'D1_Rashi': 'D1 · রাশি',
    'D9_Navamsa': 'D9 · নবমাংশ',
    'D3_Drekkana': 'D3 · দ্রেক্কাণ',
    'D10_Dasamsa': 'D10 · দশমাংশ',
    'Gochor': 'গোচর',
    'Planets': 'গ্রহ',
    'Dasha': 'দশা',

    // Chart texts
    'Lagna': 'লগ্ন',
    'Current Dasha': 'বর্তমান দশা',
    'Moon Sign (Rashi)': 'চন্দ্র রাশি',
    'Moon Nakshatra': 'চন্দ্র নক্ষত্র',
    'Pada': 'পদ',
    'Positions': 'গ্রহের অবস্থান',
    'until': 'পর্যন্ত',

    // Planets
    'Sun': 'সূর্য', 'Moon': 'চন্দ্র', 'Mars': 'মঙ্গল', 'Mercury': 'বুধ',
    'Jupiter': 'বৃহস্পতি', 'Venus': 'শুক্র', 'Saturn': 'শনি',
    'Rahu': 'রাহু', 'Ketu': 'কেতু', 'Ascendant': 'লগ্ন',

    // Signs
    'Aries': 'মেষ', 'Taurus': 'বৃষ', 'Gemini': 'মিথুন', 'Cancer': 'কর্কট',
    'Leo': 'সিংহ', 'Virgo': 'কন্যা', 'Libra': 'তুলা', 'Scorpio': 'বৃশ্চিক',
    'Sagittarius': 'ধনু', 'Capricorn': 'মকর', 'Aquarius': 'কুম্ভ', 'Pisces': 'মীন'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'hi', 'bn'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    return (dict as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
