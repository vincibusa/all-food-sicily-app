import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/context/ThemeContext';

interface ThinkingBubbleProps {
  thinking: {
    content: string;
    tokensUsed?: number;
    isVisible: boolean;
  };
  onToggleVisibility: () => void;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ 
  thinking, 
  onToggleVisibility 
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(thinking.isVisible);
  
  // Animazioni
  const animatedHeight = useRef(new Animated.Value(thinking.isVisible ? 1 : 0)).current;
  const animatedOpacity = useRef(new Animated.Value(thinking.isVisible ? 1 : 0)).current;
  const rotationAnimation = useRef(new Animated.Value(thinking.isVisible ? 1 : 0)).current;

  useEffect(() => {
    // Sincronizza lo stato locale con quello del parent
    setIsExpanded(thinking.isVisible);
    
    // Anima l'apertura/chiusura
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: thinking.isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: thinking.isVisible ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotationAnimation, {
        toValue: thinking.isVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [thinking.isVisible]);

  const handleToggle = () => {
    onToggleVisibility();
  };

  const spin = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const formatThinkingContent = (content: string): string => {
    // Pulisci il contenuto del thinking per una migliore visualizzazione
    return content
      // Rimuovi eccessivi caratteri speciali
      .replace(/[\*\#\_\`]/g, '')
      // Rimuovi righe vuote multiple
      .replace(/\n{3,}/g, '\n\n')
      // Trim finale
      .trim();
  };

  return (
    <View style={[
      styles.thinkingContainer,
      { 
        backgroundColor: colors.background + '80',
        borderColor: colors.tint + '30',
      }
    ]}>
      {/* Header del thinking bubble */}
      <TouchableOpacity 
        style={[
          styles.thinkingHeader,
          { backgroundColor: colors.tint + '15' }
        ]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.thinkingHeaderContent}>
          <MaterialIcons 
            name="psychology" 
            size={16} 
            color={colors.tint} 
            style={styles.thinkingIcon}
          />
          <Text style={[
            styles.thinkingTitle,
            { color: colors.tint }
          ]}>
            Processo di ragionamento AI
          </Text>
          {thinking.tokensUsed && (
            <View style={[
              styles.tokensBadge,
              { backgroundColor: colors.tint + '20' }
            ]}>
              <Text style={[
                styles.tokensText,
                { color: colors.tint }
              ]}>
                {thinking.tokensUsed} tokens
              </Text>
            </View>
          )}
        </View>
        
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons 
            name="expand-more" 
            size={20} 
            color={colors.tint}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Contenuto del thinking (espandibile con animazione) */}
      <Animated.View
        style={[
          styles.thinkingContent,
          {
            borderTopColor: colors.tint + '20',
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 250], // Altezza massima del contenuto
            }),
            opacity: animatedOpacity,
            overflow: 'hidden',
          },
        ]}
      >
        <ScrollView 
          style={styles.thinkingScrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <Text style={[
            styles.thinkingText,
            { color: colors.text + '80' }
          ]}>
            {formatThinkingContent(thinking.content)}
          </Text>
        </ScrollView>
        
        {/* Footer con info aggiuntive */}
        <View style={[
          styles.thinkingFooter,
          { borderTopColor: colors.border }
        ]}>
          <Text style={[
            styles.thinkingFooterText,
            { color: colors.text + '60' }
          ]}>
            💭 Questo è il processo di ragionamento interno di Gemini 2.5 Flash
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  thinkingContainer: {
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  thinkingHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingIcon: {
    marginRight: 8,
  },
  thinkingTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  tokensBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  tokensText: {
    fontSize: 11,
    fontWeight: '500',
  },
  thinkingContent: {
    borderTopWidth: 1,
  },
  thinkingScrollView: {
    maxHeight: 200, // Limita l'altezza per non occupare troppo spazio
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  thinkingText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Font monospace per il thinking
    fontStyle: 'italic',
  },
  thinkingFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thinkingFooterText: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});