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

    // Timestamp di inizio thinking per calcolare la durata
    const thinkingStartTime = Date.now();

    // Crea messaggio temporaneo di "thinking" che appare subito
    const thinkingMessageId = `thinking-${Date.now()}`;
    const thinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      text: '', // Vuoto perché mostreremo solo il thinking
      isUser: false,
      timestamp: new Date(),
      thinking: {
        content: '🤔 Sto analizzando la tua richiesta...\n\n⏳ Il modello sta elaborando i dati dal database e formulando una risposta personalizzata.',
        tokensUsed: 0,
        isVisible: true // Mostra subito il thinking
      }
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Ottieni posizione corrente se disponibile
      let currentLocation = location;
      if (!currentLocation && hasPermission) {
        currentLocation = await getCurrentLocation();
      }

      // Chiama il servizio AI con posizione (converti null a undefined)
      const aiResponse = await aiChatService.sendMessage(textToSend, currentLocation || undefined);
      console.log('📱 Chat received AI response with thinking:', !!aiResponse.thinking);
      
      // Se c'è thinking reale dall'AI, aggiorna il messaggio temporaneo con quello
      if (aiResponse.thinking) {
        console.log('🧠 Updating thinking with real AI content');
        console.log('📝 Thinking content preview:', aiResponse.thinking.content.substring(0, 50) + '...');
        
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingMessageId ? {
            ...msg,
            thinking: {
              ...aiResponse.thinking!,
              isVisible: true
            }
          } : msg
        ));
        
        // Mostra il thinking reale per un po' (2 secondi)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Rimuovi il thinking dalla risposta finale - vogliamo mostrarlo solo durante l'elaborazione
      const aiResponseFinal: ChatMessage = {
        ...aiResponse,
        thinking: undefined // Nessun thinking nella risposta finale
      };
      
      // Sostituisci il messaggio temporaneo con la risposta finale
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessageId ? aiResponseFinal : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Mi dispiace, sto avendo problemi tecnici. Riprova tra poco!',
        isUser: false,
        timestamp: new Date()
      };
      
      // Sostituisci il messaggio temporaneo con l'errore
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessageId ? errorMessage : msg
      ));
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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // Non mostrare la card se è AI, sta pensando e non ha testo
    const isThinkingOnly = !item.isUser && item.thinking?.isVisible && !item.text.trim();
    
    return (
      <View style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
        !isThinkingOnly && { 
          backgroundColor: item.isUser ? colors.tint : colors.background,
          borderWidth: item.isUser ? 0 : 1,
          borderColor: item.isUser ? 'transparent' : colors.border,
          shadowColor: item.isUser ? 'transparent' : '#000',
          shadowOffset: item.isUser ? { width: 0, height: 0 } : { width: 0, height: 1 },
          shadowOpacity: item.isUser ? 0 : 0.1,
          shadowRadius: item.isUser ? 0 : 2,
          elevation: item.isUser ? 0 : 2,
        }
      ]}>
        {/* Mostra il thinking bubble per messaggi AI con thinking tokens */}
        {!item.isUser && item.thinking && (
          <ThinkingBubble
            thinking={item.thinking}
            onToggleVisibility={() => handleToggleThinking(item.id)}
          />
        )}
        
        {/* Mostra il testo solo se non è vuoto */}
        {item.text.trim() && (
          <Text style={[
            styles.messageText,
            { color: item.isUser ? '#FFFFFF' : colors.text }
          ]}>
            {item.text}
          </Text>
        )}
        
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
        
        {/* Mostra timestamp solo se non è thinking-only */}
        {!isThinkingOnly && (
          <Text style={[
            styles.timestamp,
            { color: item.isUser ? '#FFFFFF80' : colors.text + '60' }
          ]}>
            {item.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    );
  };

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.aiAvatar, { backgroundColor: colors.tint }]}>
              <MaterialIcons name="smart-toy" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                AllFood AI
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

{/* Loading rimosso: ora il thinking appare direttamente nei messaggi */}

        {/* AI Disclaimer Simple */}
        <View style={[styles.simpleDisclaimer, { backgroundColor: colors.background }]}>
          <Text style={[styles.disclaimerText, { color: colors.text + '70' }]}>
            AllFood AI potrebbe commettere errori
          </Text>
        </View>

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
  simpleDisclaimer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});