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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useHaptics } from '../../utils/haptics';
import { useLocation } from '../../hooks/useLocation';
import { aiChatService, ChatMessage, RestaurantSuggestion, HotelSuggestion } from '../../services/ai-chat.service';
import { RestaurantCard } from '../../components/Home/RestaurantCard';
import { HotelCard } from '../../components/Home/HotelCard';
import { ThinkingBubble } from '../../components/Chat/ThinkingBubble';

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { onTap } = useHaptics();
  const { location, getCurrentLocation, hasPermission, calculateDistance } = useLocation();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState(aiChatService.getQuickSuggestions());
  
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

  // Aggiorna quick suggestions quando cambia la disponibilità della posizione
  useEffect(() => {
    setQuickSuggestions(aiChatService.getQuickSuggestions(hasPermission && !!location));
  }, [hasPermission, location]);

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
      // Ottieni posizione corrente se disponibile
      let currentLocation = location;
      if (!currentLocation && hasPermission) {
        currentLocation = await getCurrentLocation();
      }

      // Chiama il servizio AI con posizione (converti null a undefined)
      const aiResponse = await aiChatService.sendMessage(textToSend, currentLocation || undefined);
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

  // Gestisce il toggle della visibilità del thinking per un messaggio specifico
  const handleToggleThinking = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId && message.thinking
          ? {
              ...message,
              thinking: {
                ...message.thinking,
                isVisible: !message.thinking.isVisible
              }
            }
          : message
      )
    );
  };

  // Mappa le suggestion ai formati card
  const mapRestaurantSuggestionToCard = (suggestion: RestaurantSuggestion) => ({
    id: suggestion.id,
    name: suggestion.name,
    featured_image: suggestion.featured_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    city: suggestion.city,
    province: 'Sicily', // Default per la Sicilia
    rating: suggestion.rating,
    price_range: 2, // Default medio
    category_name: suggestion.cuisine_type?.[0] || 'Ristorante'
  });

  const mapHotelSuggestionToCard = (suggestion: HotelSuggestion) => ({
    id: suggestion.id,
    name: suggestion.name,
    featured_image: suggestion.featured_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    city: suggestion.city,
    province: 'Sicily', // Default per la Sicilia
    rating: suggestion.rating,
    star_rating: suggestion.star_rating,
    price_range: 3, // Default medio-alto per hotel
    hotel_type: suggestion.hotel_type || ['hotel'],
    category_name: suggestion.hotel_type?.[0] || 'Hotel'
  });

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage,
      { backgroundColor: item.isUser ? colors.tint : colors.card }
    ]}>
      {/* Mostra il thinking bubble per messaggi AI con thinking tokens */}
      {!item.isUser && item.thinking && (
        <ThinkingBubble
          thinking={item.thinking}
          onToggleVisibility={() => handleToggleThinking(item.id)}
        />
      )}
      
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
          {item.suggestions.restaurants && item.suggestions.restaurants.length > 0 && (
            <>
              <Text style={[styles.suggestionsSectionTitle, { color: colors.text }]}>
                🍽️ Ristoranti consigliati
              </Text>
              <View style={styles.suggestionsGrid}>
                {item.suggestions.restaurants.map((suggestion) => (
                  <View key={suggestion.id} style={styles.suggestionCardWrapper}>
                    <RestaurantCard
                      item={mapRestaurantSuggestionToCard(suggestion)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
          
          {/* Hotel suggestions */}
          {item.suggestions.hotels && item.suggestions.hotels.length > 0 && (
            <>
              <Text style={[styles.suggestionsSectionTitle, { color: colors.text, marginTop: item.suggestions.restaurants ? 16 : 0 }]}>
                🏨 Hotel consigliati
              </Text>
              <View style={styles.suggestionsGrid}>
                {item.suggestions.hotels.map((suggestion) => (
                  <View key={suggestion.id} style={styles.suggestionCardWrapper}>
                    <HotelCard
                      item={mapHotelSuggestionToCard(suggestion)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
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
            {/* Indicatore posizione */}
            {hasPermission && location && (
              <View style={[styles.locationIndicator, { backgroundColor: colors.tint + '20' }]}>
                <MaterialIcons name="location-on" size={16} color={colors.tint} />
                <Text style={[styles.locationText, { color: colors.tint }]}>GPS</Text>
              </View>
            )}
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
            <View style={styles.loadingTextContainer}>
              <MaterialIcons name="psychology" size={16} color={colors.tint} style={styles.loadingIcon} />
              <Text style={[styles.loadingText, { color: colors.text + '80' }]}>
                AI sta pensando e scrivendo...
              </Text>
            </View>
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
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  },
  suggestionsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionsGrid: {
    gap: 12,
  },
  suggestionCardWrapper: {
    width: '100%',
    alignItems: 'center',
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
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingIcon: {
    marginRight: 6,
  },
  loadingText: {
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