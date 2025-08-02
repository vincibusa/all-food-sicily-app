/**
 * Colors.ts - Updated with Design Tokens
 * WCAG 2.1 AA Compliant Color System
 * Updated: Gennaio 2025
 */

import { ThemeTokens } from './DesignTokens';

// Light theme colors only
const tintColorLight = ThemeTokens.light.brand.primary;

export default {
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
};