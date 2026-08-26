import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export function ThemeLanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex items-center gap-6">
      {/* Language Switcher */}
      <div className="flex gap-2">
        {(['en', 'hi', 'bn'] as const).map(l => (
          <button 
            key={l} 
            onClick={() => setLanguage(l)} 
            className={`px-2 py-1 text-xs font-bold rounded border transition-colors ${
              language === l 
                ? 'bg-purple-600 text-white border-purple-500' 
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
            }`}
          >
            {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'বাংলা'}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/20"></div>

      {/* Theme Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => changeTheme('dark')}
          className="w-5 h-5 rounded-full transition-all"
          style={{ background: '#13161e', border: theme === 'dark' ? '2px solid #a855f7' : '1px solid #262a3a' }}
          title="Dark Theme"
        />
        <button
          onClick={() => changeTheme('saffron')}
          className="w-5 h-5 rounded-full transition-all"
          style={{ background: '#fffaf2', border: theme === 'saffron' ? '2px solid #e65100' : '1px solid #e8d8c8' }}
          title="Vedic Saffron Theme"
        />
        <button
          onClick={() => changeTheme('cyan')}
          className="w-5 h-5 rounded-full transition-all"
          style={{ background: '#05131a', border: theme === 'cyan' ? '2px solid #00e5ff' : '1px solid #1e3f52' }}
          title="Cyber Cyan Theme"
        />
      </div>
    </div>
  );
}

