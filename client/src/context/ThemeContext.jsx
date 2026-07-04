import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const { preferences, fetchPreferences } = useSettings();

  useEffect(() => {
    if (user && !preferences) {
      fetchPreferences();
    }
  }, [user, preferences, fetchPreferences]);

  // Enforce appearance and accessibility classes on HTML root body element
  useEffect(() => {
    const root = document.documentElement;
    
    // Fall back to default styling settings if not authenticated
    const activePrefs = preferences || {
      theme: 'SYSTEM',
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false
    };

    const { theme, fontSize, highContrast, reducedMotion } = activePrefs;

    // 1. Theme class handling (Dark / Light / System)
    root.classList.remove('dark');
    if (theme === 'DARK') {
      root.classList.add('dark');
    } else if (theme === 'SYSTEM') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      }
    }

    // 2. High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Reduced Motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // 4. Font Size scaling
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${fontSize.toLowerCase()}`);

  }, [preferences]);

  return (
    <ThemeContext.Provider value={{ preferences }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeSettings = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
