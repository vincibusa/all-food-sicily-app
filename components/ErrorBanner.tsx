import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useDesignTokens } from '../hooks/useDesignTokens';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  type?: 'error' | 'warning' | 'info';
  visible?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Riprova',
  type = 'error',
  visible = true,
}) => {
  const tokens = useDesignTokens();

  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'error';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          background: tokens.colors.semantic.warning.background,
          text: tokens.colors.semantic.warning.light,
          border: tokens.colors.semantic.warning.light,
        };
      case 'info':
        return {
          background: tokens.colors.semantic.info.background,
          text: tokens.colors.semantic.info.light,
          border: tokens.colors.semantic.info.light,
        };
      default:
        return {
          background: tokens.colors.semantic.error.background,
          text: tokens.colors.semantic.error.light,
          border: tokens.colors.semantic.error.light,
        };
    }
  };

  const colors = getColors();

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <MaterialIcons
          name={getIconName()}
          size={20}
          color={colors.text}
          style={styles.icon}
        />
        
        <Text
          style={[
            styles.message,
            { color: colors.text },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={[
              styles.retryButton,
              { borderColor: colors.text },
              tokens.helpers.touchTarget('minimum'),
            ]}
            accessibilityRole="button"
            accessibilityLabel={retryLabel}
          >
            <MaterialIcons name="refresh" size={16} color={colors.text} />
            <Text style={[styles.retryText, { color: colors.text }]}>
              {retryLabel}
            </Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.dismissButton, tokens.helpers.touchTarget('minimum')]}
            accessibilityRole="button"
            accessibilityLabel="Chiudi errore"
          >
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dismissButton: {
    padding: 4,
  },
});