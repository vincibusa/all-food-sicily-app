import React, { createContext, useContext } from 'react';
import Colors from '../../constants/Colors';

type ColorScheme = 'light';
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
  // Force light mode only
  const colorScheme: ColorScheme = 'light';
  const colors = Colors.light;

  // No-op functions for compatibility
  const toggleColorScheme = () => {
    // Do nothing - light mode only
  };

  const handleSetColorScheme = (scheme: ColorScheme) => {
    // Do nothing - light mode only
  };

  const setUseSystemTheme = (use: boolean) => {
    // Do nothing - light mode only
  };

  const value = {
    colorScheme,
    colors,
    setColorScheme: handleSetColorScheme,
    toggleColorScheme,
    useSystemTheme: false,
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

// Export default per soddisfare il requisito di Expo Router
export default ThemeProvider; 