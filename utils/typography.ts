/**
 * Typography Utilities - Dynamic Text Support
 * Implements accessibility features for text scaling
 * Conforme alle WCAG 2.1 AA guidelines per l'accessibilità
 */

import { PixelRatio, Platform } from 'react-native';
import { TypographyTokens } from '../constants/DesignTokens';

// ==========================================
// 📏 ACCESSIBILITY TEXT SCALING
// ==========================================

/**
 * Tipi di contenuto per il text scaling
 */
export enum TextContentType {
  DISPLAY = 'display',     // Titoli grandi, hero text
  HEADING = 'heading',     // Titoli di sezione
  BODY = 'body',          // Testo principale
  CAPTION = 'caption',    // Testo piccolo, metadati
  BUTTON = 'button',      // Testo sui pulsanti
  LABEL = 'label',        // Etichette form
}

/**
 * Livelli di scaling del testo per accessibilità 
 */
export enum TextScaleLevel {
  EXTRA_SMALL = 'extraSmall',    // 85%
  SMALL = 'small',               // 90%
  NORMAL = 'normal',             // 100%
  MEDIUM = 'medium',             // 115%
  LARGE = 'large',               // 130%
  EXTRA_LARGE = 'extraLarge',    // 150%
  EXTRA_EXTRA_LARGE = 'extraExtraLarge', // 200%
}

/**
 * Mapping dei livelli di scaling
 */
const SCALE_FACTORS: Record<TextScaleLevel, number> = {
  [TextScaleLevel.EXTRA_SMALL]: 0.85,
  [TextScaleLevel.SMALL]: 0.90,
  [TextScaleLevel.NORMAL]: 1.0,
  [TextScaleLevel.MEDIUM]: 1.15,
  [TextScaleLevel.LARGE]: 1.30,
  [TextScaleLevel.EXTRA_LARGE]: 1.50,
  [TextScaleLevel.EXTRA_EXTRA_LARGE]: 2.0,
};

/**
 * Limiti massimi per tipo di contenuto (prevenire testi troppo grandi)
 */
const MAX_SCALE_BY_CONTENT: Record<TextContentType, number> = {
  [TextContentType.DISPLAY]: 1.50,      // I titoli non dovrebbero crescere troppo
  [TextContentType.HEADING]: 1.30,      // Titoli di sezione limitati
  [TextContentType.BODY]: 2.0,          // Testo corpo può crescere molto
  [TextContentType.CAPTION]: 1.50,      // Caption non troppo grandi
  [TextContentType.BUTTON]: 1.30,       // Bottoni limitati per usabilità
  [TextContentType.LABEL]: 1.50,        // Etichette moderate
};

// ==========================================
// 🔤 DYNAMIC FONT SIZE CALCULATOR
// ==========================================

/**
 * Calcola la dimensione del font dinamica basata su:
 * - Tipo di contenuto
 * - Livello di scaling utente
 * - Pixel density del device
 */
export function getDynamicFontSize(
  baseFontSize: number,
  contentType: TextContentType = TextContentType.BODY,
  userScaleLevel: TextScaleLevel = TextScaleLevel.NORMAL
): number {
  // Applica il fattore di scala dell'utente
  const userScaleFactor = SCALE_FACTORS[userScaleLevel];
  
  // Applica il limite massimo per il tipo di contenuto
  const maxScale = MAX_SCALE_BY_CONTENT[contentType];
  const effectiveScale = Math.min(userScaleFactor, maxScale);
  
  // Calcola la dimensione finale
  let finalSize = baseFontSize * effectiveScale;
  
  // Normalizza per la pixel density (Android principalmente)
  if (Platform.OS === 'android') {
    finalSize = finalSize / PixelRatio.getFontScale();
  }
  
  // Arrotonda per evitare pixel fractional
  return Math.round(finalSize * 10) / 10;
}

/**
 * Hook per ottenere dimensioni tipografiche dinamiche
 */
export function getDynamicTypography(userScaleLevel: TextScaleLevel = TextScaleLevel.NORMAL) {
  return {
    // Display sizes
    display: {
      xs: getDynamicFontSize(TypographyTokens.fontSize['2xl'], TextContentType.DISPLAY, userScaleLevel),
      sm: getDynamicFontSize(TypographyTokens.fontSize['3xl'], TextContentType.DISPLAY, userScaleLevel),
      lg: getDynamicFontSize(TypographyTokens.fontSize['4xl'], TextContentType.DISPLAY, userScaleLevel),
    },
    
    // Heading sizes
    heading: {
      xs: getDynamicFontSize(TypographyTokens.fontSize.lg, TextContentType.HEADING, userScaleLevel),
      sm: getDynamicFontSize(TypographyTokens.fontSize.xl, TextContentType.HEADING, userScaleLevel),
      lg: getDynamicFontSize(TypographyTokens.fontSize['2xl'], TextContentType.HEADING, userScaleLevel),
    },
    
    // Body text
    body: {
      xs: getDynamicFontSize(TypographyTokens.fontSize.sm, TextContentType.BODY, userScaleLevel),
      sm: getDynamicFontSize(TypographyTokens.fontSize.base, TextContentType.BODY, userScaleLevel),
      lg: getDynamicFontSize(TypographyTokens.fontSize.lg, TextContentType.BODY, userScaleLevel),
    },
    
    // Caption text
    caption: {
      xs: getDynamicFontSize(TypographyTokens.fontSize.xs, TextContentType.CAPTION, userScaleLevel),
      sm: getDynamicFontSize(TypographyTokens.fontSize.sm, TextContentType.CAPTION, userScaleLevel),
    },
    
    // Button text
    button: {
      xs: getDynamicFontSize(TypographyTokens.fontSize.sm, TextContentType.BUTTON, userScaleLevel),
      sm: getDynamicFontSize(TypographyTokens.fontSize.base, TextContentType.BUTTON, userScaleLevel),
      lg: getDynamicFontSize(TypographyTokens.fontSize.lg, TextContentType.BUTTON, userScaleLevel),
    },
    
    // Label text
    label: {
      xs: getDynamicFontSize(TypographyTokens.fontSize.xs, TextContentType.LABEL, userScaleLevel),
      sm: getDynamicFontSize(TypographyTokens.fontSize.sm, TextContentType.LABEL, userScaleLevel),
    },
  };
}

// ==========================================
// 📱 SYSTEM INTEGRATION
// ==========================================

/**
 * Rileva il livello di scaling preferito dal sistema operativo
 * iOS: Rispetta le impostazioni Dynamic Type
 * Android: Rispetta le impostazioni Font Scale
 */
export function getSystemTextScaleLevel(): TextScaleLevel {
  const fontScale = PixelRatio.getFontScale();
  
  if (fontScale <= 0.85) return TextScaleLevel.EXTRA_SMALL;
  if (fontScale <= 0.90) return TextScaleLevel.SMALL;
  if (fontScale <= 1.0) return TextScaleLevel.NORMAL;
  if (fontScale <= 1.15) return TextScaleLevel.MEDIUM;
  if (fontScale <= 1.30) return TextScaleLevel.LARGE;
  if (fontScale <= 1.50) return TextScaleLevel.EXTRA_LARGE;
  
  return TextScaleLevel.EXTRA_EXTRA_LARGE;
}

/**
 * Calcola line height dinamico basato sulla font size
 */
export function getDynamicLineHeight(
  fontSize: number,
  contentType: TextContentType = TextContentType.BODY
): number {
  // Line height base dal design system
  let baseLineHeight = TypographyTokens.lineHeight.normal;
  
  // Aggiusta line height per tipo di contenuto
  switch (contentType) {
    case TextContentType.DISPLAY:
      baseLineHeight = TypographyTokens.lineHeight.tight;
      break;
    case TextContentType.HEADING:
      baseLineHeight = TypographyTokens.lineHeight.tight;
      break;
    case TextContentType.CAPTION:
      baseLineHeight = TypographyTokens.lineHeight.relaxed;
      break;
    default:
      baseLineHeight = TypographyTokens.lineHeight.normal;
  }
  
  return Math.round(fontSize * baseLineHeight);
}

// ==========================================
// 🎨 TYPOGRAPHY STYLE GENERATOR
// ==========================================

/**
 * Genera oggetto di stile completo per il testo
 */
export function createTextStyle(
  baseFontSize: number,
  contentType: TextContentType = TextContentType.BODY,
  options: {
    fontWeight?: keyof typeof TypographyTokens.fontWeight;
    userScaleLevel?: TextScaleLevel;
    color?: string;
  } = {}
) {
  const {
    fontWeight = 'normal',
    userScaleLevel = getSystemTextScaleLevel(),
    color = '#000000'
  } = options;
  
  const fontSize = getDynamicFontSize(baseFontSize, contentType, userScaleLevel);
  const lineHeight = getDynamicLineHeight(fontSize, contentType);
  
  return {
    fontSize,
    lineHeight,
    fontWeight: TypographyTokens.fontWeight[fontWeight],
    color,
    fontFamily: TypographyTokens.fontFamily.primary,
  };
}

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Verifica se il testo è sufficientemente grande per l'accessibilità
 */
export function isAccessibleFontSize(fontSize: number, contentType: TextContentType): boolean {
  // WCAG 2.1 AA: testo normale min 16px, testo grande min 14px
  const minSizes: Record<TextContentType, number> = {
    [TextContentType.DISPLAY]: 18,
    [TextContentType.HEADING]: 16,
    [TextContentType.BODY]: 16,
    [TextContentType.CAPTION]: 14,
    [TextContentType.BUTTON]: 16,
    [TextContentType.LABEL]: 14,
  };
  
  return fontSize >= minSizes[contentType];
}

/**
 * Calcola il contrast ratio necessario per la font size data
 */
export function getRequiredContrastRatio(fontSize: number, fontWeight: string): number {
  // WCAG 2.1 AA guidelines
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || fontWeight === '700'));
  
  return isLargeText ? 3.0 : 4.5; // Large text: 3:1, Normal text: 4.5:1
}

export default {
  getDynamicFontSize,
  getDynamicTypography,
  getSystemTextScaleLevel,
  getDynamicLineHeight,
  createTextStyle,
  isAccessibleFontSize,
  getRequiredContrastRatio,
  TextContentType,
  TextScaleLevel,
};