import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

type ColorScheme = 'light' | 'dark';
type ThemeContextType = {
  colorScheme: ColorScheme;
  colors: typeof Colors.light;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  useSystemTheme: boolean;
  setUseSystemTheme: (use: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme() as ColorScheme || 'light';
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(deviceColorScheme);

  // Aggiorna il tema quando cambia quello del dispositivo (se useSystemTheme è true)
  useEffect(() => {
    if (useSystemTheme) {
      setColorScheme(deviceColorScheme);
    }
  }, [deviceColorScheme, useSystemTheme]);

  const toggleColorScheme = () => {
    setUseSystemTheme(false);  // Disabilita il tema di sistema quando l'utente cambia manualmente
    setColorScheme(prevScheme => (prevScheme === 'light' ? 'dark' : 'light'));
  };

  const handleSetColorScheme = (scheme: ColorScheme) => {
    setUseSystemTheme(false);  // Disabilita il tema di sistema quando l'utente cambia manualmente
    setColorScheme(scheme);
  };

  const colors = Colors[colorScheme];

  const value = {
    colorScheme,
    colors,
    setColorScheme: handleSetColorScheme,
    toggleColorScheme,
    useSystemTheme,
    setUseSystemTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 