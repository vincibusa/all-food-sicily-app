import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../../app/context/ThemeContext';

interface ThinkingBubbleProps {
  thinking: {
    content: string;
    tokensUsed?: number;
    isVisible: boolean; // true while model is thinking; false once final response is shown
  };
  onToggleVisibility: () => void; // kept for compatibility; not used in minimal UI
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ thinking }) => {
  const { colors } = useTheme();

  const formatThinkingContent = (content: string): string => {
    return content
      .replace(/[\*\#\_\`]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  return (
    <View style={styles.container}>
      {thinking.isVisible ? (
        <View style={styles.inlineRow}>
          <ActivityIndicator size="small" color={colors.tint} style={styles.inlineIcon} />
          <Text style={[styles.liveText, { color: colors.text + '80' }]}>
            {formatThinkingContent(thinking.content)}
          </Text>
        </View>
      ) : (
        <Text style={[styles.summaryText, { color: colors.text + '60' }]}>
          {thinking.content}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 2,
    alignSelf: 'stretch',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    flex: 1,
  },
  inlineIcon: {
    marginRight: 8,
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
  liveText: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontStyle: 'italic',
  },
  summaryText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});