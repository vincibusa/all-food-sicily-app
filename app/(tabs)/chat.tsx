import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { aiChatService, ChatMessage, RestaurantSuggestion, HotelSuggestion } from '../../services/ai-chat.service';

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickSuggestions] = useState(aiChatService.getQuickSuggestions());
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Messaggio di benvenuto
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: '👋 Ciao! Sono il tuo assistente AI per scoprire i migliori locali della Sicilia. Dimmi cosa stai cercando!',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    
    if (!textToSend || isLoading) return;

    onTap();

    // Messaggio utente
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Chiama il servizio AI
      const aiResponse = await aiChatService.sendMessage(textToSend);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Mi dispiace, sto avendo problemi tecnici. Riprova tra poco!',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll alla fine dopo un breve delay
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage,
      { backgroundColor: item.isUser ? colors.tint : colors.card }
    ]}>
      <Text style={[
        styles.messageText,
        { color: item.isUser ? '#FFFFFF' : colors.text }
      ]}>
        {item.text}
      </Text>
      
      {/* Render suggestions */}
      {item.suggestions && (
        <View style={styles.suggestionsContainer}>
          {/* Restaurant suggestions */}
          {item.suggestions.restaurants && item.suggestions.restaurants.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={[styles.suggestionCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => {
                onTap();
                router.push(`/ristoranti/${suggestion.id}`);
              }}
            >
              <View style={styles.suggestionHeader}>
                <Text style={[styles.suggestionName, { color: colors.text }]}>
                  {suggestion.name}
                </Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.text + '40'} />
              </View>
              <Text style={[styles.suggestionDetails, { color: colors.text + '80' }]}>
                📍 {suggestion.city} • ⭐ {suggestion.rating}/5
              </Text>
              {suggestion.cuisine_type && (
                <Text style={[styles.suggestionCuisine, { color: colors.text + '60' }]}>
                  🍽️ {suggestion.cuisine_type.join(', ')}
                </Text>
              )}
              <Text style={[styles.tapHint, { color: colors.tint }]}>
                Tocca per vedere i dettagli
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Hotel suggestions */}
          {item.suggestions.hotels && item.suggestions.hotels.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={[styles.suggestionCard, styles.hotelCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => {
                onTap();
                router.push(`/hotel/${suggestion.id}`);
              }}
            >
              <View style={styles.suggestionHeader}>
                <Text style={[styles.suggestionName, { color: colors.text }]}>
                  🏨 {suggestion.name}
                </Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color={colors.text + '40'} />
              </View>
              <Text style={[styles.suggestionDetails, { color: colors.text + '80' }]}>
                📍 {suggestion.city} • ⭐ {suggestion.rating}/5
                {suggestion.star_rating && ` • ${suggestion.star_rating} stelle`}
              </Text>
              {suggestion.hotel_type && (
                <Text style={[styles.suggestionCuisine, { color: colors.text + '60' }]}>
                  🏨 {suggestion.hotel_type.join(', ')}
                </Text>
              )}
              <Text style={[styles.tapHint, { color: colors.tint }]}>
                Tocca per vedere i dettagli
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <Text style={[
        styles.timestamp,
        { color: item.isUser ? '#FFFFFF80' : colors.text + '60' }
      ]}>
        {item.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderQuickSuggestions = () => (
    <View style={styles.quickSuggestionsContainer}>
      <Text style={[styles.quickSuggestionsTitle, { color: colors.text }]}>
        💡 Suggerimenti veloci:
      </Text>
      <View style={styles.quickSuggestionsGrid}>
        {quickSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickSuggestionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleQuickSuggestion(suggestion)}
          >
            <Text style={[styles.quickSuggestionText, { color: colors.text }]}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.aiAvatar, { backgroundColor: colors.tint }]}>
              <MaterialIcons name="smart-toy" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Chat AI
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
                Il tuo assistente gastronomico siciliano
              </Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={messages.length === 1 ? renderQuickSuggestions : null}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.text + '80' }]}>
              AI sta scrivendo...
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Scrivi il tuo messaggio..."
            placeholderTextColor={colors.text + '60'}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
            submitBehavior="newline"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.tint : colors.text + '20' }
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <FontAwesome 
              name="send" 
              size={18} 
              color={inputText.trim() ? '#FFFFFF' : colors.text + '60'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  suggestionCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hotelCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  suggestionDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  suggestionCuisine: {
    fontSize: 13,
    marginBottom: 6,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  quickSuggestionsContainer: {
    marginTop: 20,
  },
  quickSuggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickSuggestionsGrid: {
    gap: 8,
  },
  quickSuggestionBubble: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickSuggestionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});