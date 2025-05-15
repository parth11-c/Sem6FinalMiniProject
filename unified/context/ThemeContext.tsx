import React, { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themeColors = {
  light: {
    background: '#F5F9F5',
    text: '#1A3A1A',
    secondaryText: '#2D4D2D',
    cardBackground: '#E8F5E9',
    searchBackground: '#E0F2E0',
    buttonBackground: '#2E7D32',
    buttonText: '#FFFFFF',
    tagBackground: '#C8E6C9',
    gradient: ['#F5F9F5', '#E8F5E9'],
  },
  dark: {
    background: '#1A2A1A',
    text: '#E8F5E9',
    secondaryText: '#B0D0B0',
    cardBackground: '#2A3A2A',
    searchBackground: '#2A3A2A',
    buttonBackground: '#4CAF50',
    buttonText: '#FFFFFF',
    tagBackground: '#1B5E20',
    gradient: ['#1A2A1A', '#2A3A2A'],
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 