import React, { createContext, useContext } from 'react';
import Colors from '../../constants/Colors';

type ThemeContextType = {
  colors: typeof Colors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextValue: ThemeContextType = {
    colors: Colors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export default per soddisfare il requisito di Expo Router
export default ThemeProvider;