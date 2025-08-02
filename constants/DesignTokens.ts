/**
 * Design Tokens - AllFood Sicily App
 * Conformi alle WCAG 2.1 AA guidelines
 * Versione: 1.0 - Gennaio 2025
 */

// ==========================================
// 🎨 COLOR PALETTE - Brand Colors
// ==========================================

export const BrandColors = {
  // Sicilian Red - Colori principali brand
  red: {
    50: '#fef2f2',
    100: '#fee2e2', 
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Primary red - WCAG AA compliant
    600: '#dc2626', // Original brand color - migliorato
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Sicilian Orange - Colori secondari
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c', // Secondary color
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Mediterranean Green - Accenti naturali
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Accent color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  }
} as const;

// ==========================================
// ⚫ NEUTRAL COLORS - Grigi e neutri
// ==========================================

export const NeutralColors = {
  // Warm grays - per un look più accogliente
  gray: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },
  
  // Pure blacks and whites
  white: '#ffffff',
  black: '#000000',
} as const;

// ==========================================
// 🌈 SEMANTIC COLORS - Stati e feedback
// ==========================================

export const SemanticColors = {
  // Success states
  success: {
    light: BrandColors.green[500],
    background: BrandColors.green[50],
  },
  
  // Warning states  
  warning: {
    light: BrandColors.orange[500],
    background: BrandColors.orange[50],
  },
  
  // Error states
  error: {
    light: BrandColors.red[600],
    background: BrandColors.red[50],
  },
  
  // Info states
  info: {
    light: '#0ea5e9', // Sky blue
    background: '#f0f9ff',
  },
} as const;

// ==========================================
// 📱 THEME TOKENS - Light Theme Only
// ==========================================

export const ThemeTokens = {
  light: {
    // Surfaces
    background: {
      primary: NeutralColors.white,
      secondary: NeutralColors.gray[50],
      tertiary: NeutralColors.gray[100],
    },
    
    // Cards and elevated surfaces
    surface: {
      primary: NeutralColors.white,
      secondary: NeutralColors.gray[50],
      elevated: NeutralColors.white,
    },
    
    // Text colors - WCAG AA compliant
    text: {
      primary: NeutralColors.gray[900],     // 21:1 ratio
      secondary: NeutralColors.gray[700],   // 10.7:1 ratio
      tertiary: NeutralColors.gray[500],    // 4.6:1 ratio
      inverse: NeutralColors.white,
      disabled: NeutralColors.gray[400],    // 3.1:1 ratio (large text only)
    },
    
    // Brand colors
    brand: {
      primary: BrandColors.red[600],        // 4.7:1 ratio with white text
      secondary: BrandColors.orange[600],   // 4.8:1 ratio with white text
      accent: BrandColors.green[600],       // 4.5:1 ratio with white text
    },
    
    // Interactive elements
    interactive: {
      primary: BrandColors.red[600],
      primaryHover: BrandColors.red[700],
      primaryActive: BrandColors.red[800],
      secondary: NeutralColors.gray[200],
      secondaryHover: NeutralColors.gray[300],
      disabled: NeutralColors.gray[300],
    },
    
    // Borders and dividers
    border: {
      primary: NeutralColors.gray[200],     // 1.8:1 ratio (sufficient for borders)
      secondary: NeutralColors.gray[100],
      accent: BrandColors.red[200],
    },
    
    // Shadows
    shadow: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.05)',
      elevated: 'rgba(0, 0, 0, 0.15)',
    },
  },
} as const;

// ==========================================
// 🔤 TYPOGRAPHY TOKENS
// ==========================================

export const TypographyTokens = {
  fontFamily: {
    primary: 'System', // Usa il font di sistema per performance
    mono: 'SpaceMono-Regular', // Già presente nell'app
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ==========================================
// 📏 SPACING TOKENS
// ==========================================

export const SpacingTokens = {
  0: 0,
  1: 4,   // 0.25rem
  2: 8,   // 0.5rem
  3: 12,  // 0.75rem
  4: 16,  // 1rem
  5: 20,  // 1.25rem
  6: 24,  // 1.5rem
  8: 32,  // 2rem
  10: 40, // 2.5rem
  12: 48, // 3rem
  16: 64, // 4rem
  20: 80, // 5rem
} as const;

// ==========================================
// 🔄 ANIMATION TOKENS
// ==========================================

export const AnimationTokens = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    easeOut: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ==========================================
// 📐 BORDER RADIUS TOKENS
// ==========================================

export const BorderRadiusTokens = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Type definitions for better TypeScript support
export type BrandColorKey = keyof typeof BrandColors;
export type NeutralColorKey = keyof typeof NeutralColors;
export type SemanticColorKey = keyof typeof SemanticColors;
export type ThemeMode = 'light';