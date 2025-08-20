import { 
  BrandColors, 
  NeutralColors, 
  SemanticColors, 
  ThemeTokens, 
  TypographyTokens, 
  SpacingTokens, 
  BorderRadiusTokens, 
  AnimationTokens,
  ComponentTokens,
  AccessibilityTokens,
  ResponsiveTokens
} from '../constants/DesignTokens';
import { useTheme } from '../app/context/ThemeContext';

/**
 * Hook to access design tokens consistently across the app
 * Provides access to colors, typography, spacing, and component-specific tokens
 */
export const useDesignTokens = () => {
  const { colors } = useTheme();

  return {
    // Color tokens
    colors: {
      brand: BrandColors,
      neutral: NeutralColors,
      semantic: SemanticColors,
      theme: ThemeTokens.light,
      current: colors, // Current theme colors from context
    },
    
    // Typography tokens
    typography: TypographyTokens,
    
    // Spacing tokens
    spacing: SpacingTokens,
    
    // Border radius tokens
    radius: BorderRadiusTokens,
    
    // Animation tokens
    animation: AnimationTokens,
    
    // Component-specific tokens
    components: ComponentTokens,
    
    // Accessibility tokens
    accessibility: AccessibilityTokens,
    
    // Responsive tokens
    responsive: ResponsiveTokens,
    
    // Helper functions for common patterns
    helpers: {
      // Get touch target styles for accessibility
      touchTarget: (size: 'minimum' | 'recommended' | 'comfortable' = 'recommended') => ({
        minWidth: AccessibilityTokens.touchTarget[size],
        minHeight: AccessibilityTokens.touchTarget[size],
      }),
      
      // Get card shadow styles
      cardShadow: (elevation: 'low' | 'medium' | 'high' = 'medium') => {
        const shadows = {
          low: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          },
          medium: ComponentTokens.card.shadow,
          high: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          },
        };
        return shadows[elevation];
      },
      
      // Get button styles by variant
      buttonStyles: (variant: 'primary' | 'secondary' | 'tertiary', size: 'small' | 'medium' | 'large' = 'medium') => ({
        height: ComponentTokens.button.height[size],
        paddingHorizontal: ComponentTokens.button.padding.horizontal,
        paddingVertical: ComponentTokens.button.padding.vertical,
        borderRadius: ComponentTokens.button.borderRadius,
        fontSize: ComponentTokens.button.fontSize[size],
        backgroundColor: variant === 'primary' ? colors.primary : 
                        variant === 'secondary' ? colors.card : 
                        'transparent',
        borderWidth: variant === 'tertiary' ? 1 : 0,
        borderColor: variant === 'tertiary' ? colors.border : 'transparent',
      }),
      
      // Get focus ring styles for accessibility
      focusRing: () => ({
        borderWidth: AccessibilityTokens.focus.ringWidth,
        borderColor: AccessibilityTokens.focus.ringColor,
        borderOffset: AccessibilityTokens.focus.ringOffset,
      }),
      
      // Get responsive value based on screen size
      responsive: (values: { sm?: any; md?: any; lg?: any; xl?: any }, screenWidth: number) => {
        if (screenWidth >= ResponsiveTokens.breakpoints.xl && values.xl !== undefined) return values.xl;
        if (screenWidth >= ResponsiveTokens.breakpoints.lg && values.lg !== undefined) return values.lg;
        if (screenWidth >= ResponsiveTokens.breakpoints.md && values.md !== undefined) return values.md;
        return values.sm;
      },
    },
  };
};

export default useDesignTokens;