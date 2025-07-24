/**
 * Colors.ts - Updated with Design Tokens
 * WCAG 2.1 AA Compliant Color System
 * Updated: Gennaio 2025
 */

import { ThemeTokens } from './DesignTokens';

// Legacy support - manteniamo i colori esistenti per retro-compatibilità
const tintColorLight = ThemeTokens.light.brand.primary;
const tintColorDark = ThemeTokens.dark.brand.primary;

export default {
  light: {
    // Text colors - WCAG AA compliant
    text: ThemeTokens.light.text.primary,
    textSecondary: ThemeTokens.light.text.secondary,
    textTertiary: ThemeTokens.light.text.tertiary,
    textDisabled: ThemeTokens.light.text.disabled,
    textInverse: ThemeTokens.light.text.inverse,
    
    // Backgrounds
    background: ThemeTokens.light.background.primary,
    backgroundSecondary: ThemeTokens.light.background.secondary,
    
    // Surfaces
    card: ThemeTokens.light.surface.primary,
    cardElevated: ThemeTokens.light.surface.elevated,
    
    // Brand colors
    primary: ThemeTokens.light.brand.primary,
    secondary: ThemeTokens.light.brand.secondary,
    accent: ThemeTokens.light.brand.accent,
    
    // Interactive elements
    tint: tintColorLight,
    interactive: ThemeTokens.light.interactive.primary,
    interactiveHover: ThemeTokens.light.interactive.primaryHover,
    interactiveDisabled: ThemeTokens.light.interactive.disabled,
    
    // Navigation
    tabIconDefault: ThemeTokens.light.text.tertiary,
    tabIconSelected: tintColorLight,
    
    // Borders and dividers
    border: ThemeTokens.light.border.primary,
    borderSecondary: ThemeTokens.light.border.secondary,
    borderAccent: ThemeTokens.light.border.accent,
    
    // Shadows
    cardShadow: ThemeTokens.light.shadow.primary,
    elevatedShadow: ThemeTokens.light.shadow.elevated,
    
    // Semantic colors
    success: '#22c55e',
    warning: '#f97316',
    error: '#dc2626',
    info: '#0ea5e9',
  },
  
  dark: {
    // Text colors - WCAG AA compliant
    text: ThemeTokens.dark.text.primary,
    textSecondary: ThemeTokens.dark.text.secondary,
    textTertiary: ThemeTokens.dark.text.tertiary,
    textDisabled: ThemeTokens.dark.text.disabled,
    textInverse: ThemeTokens.dark.text.inverse,
    
    // Backgrounds
    background: ThemeTokens.dark.background.primary,
    backgroundSecondary: ThemeTokens.dark.background.secondary,
    
    // Surfaces
    card: ThemeTokens.dark.surface.primary,
    cardElevated: ThemeTokens.dark.surface.elevated,
    
    // Brand colors
    primary: ThemeTokens.dark.brand.primary,
    secondary: ThemeTokens.dark.brand.secondary,
    accent: ThemeTokens.dark.brand.accent,
    
    // Interactive elements
    tint: tintColorDark,
    interactive: ThemeTokens.dark.interactive.primary,
    interactiveHover: ThemeTokens.dark.interactive.primaryHover,
    interactiveDisabled: ThemeTokens.dark.interactive.disabled,
    
    // Navigation
    tabIconDefault: ThemeTokens.dark.text.tertiary,
    tabIconSelected: tintColorDark,
    
    // Borders and dividers
    border: ThemeTokens.dark.border.primary,
    borderSecondary: ThemeTokens.dark.border.secondary,
    borderAccent: ThemeTokens.dark.border.accent,
    
    // Shadows
    cardShadow: ThemeTokens.dark.shadow.primary,
    elevatedShadow: ThemeTokens.dark.shadow.elevated,
    
    // Semantic colors
    success: '#4ade80',
    warning: '#fb923c',
    error: '#f87171',
    info: '#38bdf8',
  },
}; 