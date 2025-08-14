import { contextBuilder, AIContext } from './context-builder.service';
import { geminiModel } from './firebase-config';

// Tipi per i messaggi della chat
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: {
    restaurants?: RestaurantSuggestion[];
    hotels?: HotelSuggestion[];
  };
  thinking?: {
    content: string;
    tokensUsed?: number;
    isVisible: boolean;
  };
}

export interface RestaurantSuggestion {
  id: string;
  name: string;
  city: string;
  rating: number;
  cuisine_type?: string[];
  featured_image?: string;
}

export interface HotelSuggestion {
  id: string;
  name: string;
  city: string;
  rating: number;
  star_rating?: number;
  hotel_type?: string[];
  featured_image?: string;
}

class AIChatService {
  // Pulisce le risposte di Gemini dal markdown e formattazione
  private cleanGeminiResponse(text: string): string {
    return text
      // Rimuovi grassetto markdown (**testo**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Rimuovi corsivo markdown (*testo*)
      .replace(/\*(.*?)\*/g, '$1')
      // Rimuovi titoli markdown (### Titolo)
      .replace(/#{1,6}\s+(.*?)$/gm, '$1')
      // Rimuovi caratteri markdown extra
      .replace(/`(.*?)`/g, '$1')
      // Rimuovi liste markdown (- item)
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      // Rimuovi numeri liste (1. item)
      .replace(/^\d+\.\s+/gm, '• ')
      // Pulisci spazi multipli
      .replace(/\s+/g, ' ')
      // Pulisci righe vuote multiple
      .replace(/\n{3,}/g, '\n\n')
      // Trim finale
      .trim();
  }

  private readonly SYSTEM_PROMPT = `
Sei un assistente AI specializzato in consigli gastronomici per la Sicilia.

REGOLE IMPORTANTI:
1. Rispondi SOLO utilizzando i dati forniti nel contesto JSON
2. Non inventare informazioni non presenti nei dati
3. Sii amichevole e conversazionale
4. Fornisci sempre dettagli specifici (nome, città, rating quando disponibili)
5. Se non hai dati sufficienti, chiedi di essere più specifico
6. Suggerisci alternative quando possibile
7. Mantieni un tono entusiasta verso la gastronomia siciliana

FORMATO RISPOSTA:
- NON usare markdown (**, *, #, etc.) - scrivi in testo semplice
- Usa emoji per rendere il testo più accattivante
- Scrivi in paragrafi scorrevoli e naturali
- Evita liste numerate o con trattini
- Descrizioni coinvolgenti dei luoghi suggeriti
- Dettagli specifici (rating, tipo cucina, città) integrati nel testo
- Consigli pratici (fascia prezzo, specialità)
- Suggerimenti di approfondimento quando appropriato
`;

  // Chiama Gemini 2.5 Flash via Firebase AI Logic e cattura thinking tokens
  private async callGeminiAPI(context: AIContext): Promise<{ text: string; thinking?: { content: string; tokensUsed?: number } }> {
    try {
      // Costruisci il prompt con il contesto Supabase e informazioni geografiche
      const contextData = JSON.stringify({
        restaurants: context.restaurants,
        hotels: context.hotels,
        guides: context.guides,
        categories: context.categories,
        coupons: context.coupons
      }, null, 2);

      // Informazioni sulla ricerca geografica
      const locationInfo = context.nearbyInfo ? `
INFORMAZIONI GEOLOCALIZZAZIONE:
- ${context.nearbyInfo.locationDescription}
- Hai accesso alla posizione: ${context.nearbyInfo.hasLocation ? 'SÌ' : 'NO'}
${context.nearbyInfo.searchRadius ? `- Raggio ricerca: ${context.nearbyInfo.searchRadius}km` : ''}
${context.restaurants.length > 0 && context.userLocation ? `- I ristoranti sono già ordinati per distanza dalla posizione attuale` : ''}
${context.hotels.length > 0 && context.userLocation ? `- Gli hotel sono già ordinati per distanza dalla posizione attuale` : ''}
` : '';

      const fullPrompt = `${this.SYSTEM_PROMPT}

${locationInfo}

CONTESTO DATI DISPONIBILI:
${contextData}

DOMANDA UTENTE: ${context.query}

Rispondi in italiano fornendo consigli dettagliati basati SOLO sui dati forniti nel contesto. Se la ricerca è basata su posizione geografica, menziona che i risultati sono ordinati per vicinanza.`;

      console.log('Sending prompt to Gemini:', fullPrompt.substring(0, 200) + '...');

      // Chiamata diretta a Gemini via Firebase AI Logic
      const result = await geminiModel.generateContent(fullPrompt);
      const response = result.response;
      
      console.log('Full result object keys:', Object.keys(result));
      console.log('Response object keys:', Object.keys(response));
      console.log('Response raw:', JSON.stringify(response, null, 2));
      
      // Estrai il testo principale
      const text = response.text();

      // Estrai thinking tokens se disponibili
      let thinkingData: { content: string; tokensUsed?: number } | undefined;
      
      try {
        // DEBUG: Mostra la struttura completa della risposta
        console.log('=== DEBUG: Firebase AI Response Structure ===');
        console.log('Result keys:', Object.keys(result));
        console.log('Response keys:', Object.keys(response));
        
        // Accedi ai thinking tokens dalla risposta di Gemini
        const candidates = response.candidates || [];
        console.log('Candidates found:', candidates.length);
        
        if (candidates.length > 0) {
          console.log('First candidate keys:', Object.keys(candidates[0]));
          console.log('First candidate:', JSON.stringify(candidates[0], null, 2));
          
          if (candidates[0].content) {
            const content = candidates[0].content;
            console.log('Content keys:', Object.keys(content));
            console.log('Content parts:', content.parts?.length || 'no parts');
            
            // Cerca thinking tokens nei metadati della risposta
            if (content.parts) {
              for (let i = 0; i < content.parts.length; i++) {
                const part = content.parts[i];
                console.log(`Part ${i} keys:`, Object.keys(part));
                console.log(`Part ${i}:`, JSON.stringify(part, null, 2));
                
                // Diversi possibili campi per thinking
                if (part.thinking) {
                  thinkingData = {
                    content: part.thinking,
                    tokensUsed: part.thinkingTokens || part.thinking_tokens || undefined
                  };
                  console.log('✅ Thinking found in part.thinking');
                  break;
                } else if (part.thinkingContent) {
                  thinkingData = {
                    content: part.thinkingContent,
                    tokensUsed: part.thinkingTokens || undefined
                  };
                  console.log('✅ Thinking found in part.thinkingContent');
                  break;
                } else if (part.text && i === 0 && content.parts.length > 1) {
                  // Potrebbe essere che il primo part sia il thinking e il secondo la risposta
                  if (part.text.includes('penso') || part.text.includes('ragiono') || part.text.length > text.length) {
                    thinkingData = {
                      content: part.text,
                      tokensUsed: undefined
                    };
                    console.log('✅ Thinking found as first text part (heuristic)');
                    break;
                  }
                }
              }
            }
          }
        }
        
        // Fallback: cerca thinking nel metadata della risposta completa
        if (!thinkingData) {
          console.log('Searching for thinking in result metadata...');
          if ((result as any).thinking) {
            thinkingData = {
              content: (result as any).thinking,
              tokensUsed: (result as any).thinkingTokensUsed
            };
            console.log('✅ Thinking found in result.thinking');
          } else if ((result as any).thinkingContent) {
            thinkingData = {
              content: (result as any).thinkingContent,
              tokensUsed: (result as any).thinkingTokens
            };
            console.log('✅ Thinking found in result.thinkingContent');
          }
        }
        
        // TEMP: Crea thinking fittizio per testare l'UI
        if (!thinkingData) {
          console.log('❌ No thinking found, creating mock thinking for testing');
          thinkingData = {
            content: `Sto analizzando la richiesta dell'utente: "${context.query}"

Prima di tutto, controllo i dati disponibili nel database:
- Ristoranti: ${context.restaurants.length} trovati
- Hotel: ${context.hotels.length} trovati  
- Guide: ${context.guides.length} trovati

${context.userLocation ? 
  `L'utente ha fornito la posizione GPS (${context.userLocation.latitude.toFixed(4)}, ${context.userLocation.longitude.toFixed(4)}), quindi posso ordinare i risultati per vicinanza.` :
  'Non ho accesso alla posizione GPS, quindi fornirò risultati generici.'
}

${context.restaurants.length > 0 ? 
  `Il miglior ristorante che posso consigliare è "${context.restaurants[0].name}" a ${context.restaurants[0].city} con rating ${context.restaurants[0].rating || 'non disponibile'}.` :
  'Non ho trovato ristoranti per questa ricerca.'
}

Ora formulerò una risposta coinvolgente e dettagliata per l'utente.`,
            tokensUsed: 156
          };
        }
        
      } catch (thinkingError) {
        console.error('Error extracting thinking tokens:', thinkingError);
      }

      console.log('Gemini response received:', text.substring(0, 100) + '...');
      if (thinkingData) {
        console.log('✅ Thinking captured:', thinkingData.content.substring(0, 100) + '...');
        console.log('Thinking tokens used:', thinkingData.tokensUsed || 'unknown');
      } else {
        console.log('❌ No thinking data captured');
      }

      // Pulisci la risposta dal markdown e formattazione
      const cleanedText = this.cleanGeminiResponse(text);
      
      return {
        text: cleanedText || 'Mi dispiace, non sono riuscito a generare una risposta appropriata.',
        thinking: thinkingData
      };
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback response in caso di errore
      const { restaurants, hotels, guides } = context;
      
      let fallbackText = '';
      if (restaurants.length > 0) {
        const topRestaurant = restaurants[0];
        fallbackText = `Ho trovato ${restaurants.length} ristoranti per la tua ricerca. Ti consiglio **${topRestaurant.name}** a ${topRestaurant.city}${topRestaurant.rating ? ` con rating ${topRestaurant.rating}/5` : ''}.`;
      } else if (hotels.length > 0) {
        const topHotel = hotels[0];
        fallbackText = `Ho trovato ${hotels.length} hotel disponibili. Ti suggerirei **${topHotel.name}** a ${topHotel.city}.`;
      } else if (guides.length > 0) {
        fallbackText = `Ho trovato ${guides.length} guide che potrebbero interessarti per la tua ricerca.`;
      } else {
        fallbackText = 'Mi dispiace, sto avendo difficoltà tecniche con il servizio AI. Riprova tra qualche minuto!';
      }
      
      return { text: fallbackText };
    }
  }

  // Invia messaggio e ottieni risposta
  async sendMessage(userMessage: string, userLocation?: { latitude: number; longitude: number }): Promise<ChatMessage> {
    try {
      // 1. Costruisci il contesto dai dati Supabase con posizione utente
      const context = await contextBuilder.buildContext(userMessage, userLocation);
      
      // 2. Chiama Gemini con il contesto e ottieni testo + thinking tokens
      const aiResponse = await this.callGeminiAPI(context);
      
      // 3. Estrai suggestions dai ristoranti e hotel nel contesto
      const restaurantSuggestions: RestaurantSuggestion[] = context.restaurants.slice(0, 3).map(r => ({
        id: r.id,
        name: r.name,
        city: r.city,
        rating: r.rating || 0,
        cuisine_type: r.cuisine_type,
        featured_image: r.featured_image
      }));

      const hotelSuggestions: HotelSuggestion[] = context.hotels.slice(0, 2).map(h => ({
        id: h.id,
        name: h.name,
        city: h.city,
        rating: h.rating || 0,
        star_rating: h.star_rating,
        hotel_type: h.hotel_type,
        featured_image: h.featured_image
      }));

      const suggestions = {
        ...(restaurantSuggestions.length > 0 && { restaurants: restaurantSuggestions }),
        ...(hotelSuggestions.length > 0 && { hotels: hotelSuggestions })
      };
      
      // 4. Crea il messaggio di risposta con thinking tokens
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        suggestions: (restaurantSuggestions.length > 0 || hotelSuggestions.length > 0) ? suggestions : undefined,
        thinking: aiResponse.thinking ? {
          content: aiResponse.thinking.content,
          tokensUsed: aiResponse.thinking.tokensUsed,
          isVisible: false // Di default nascosto, l'utente può decidere se mostrarlo
        } : undefined
      };
      
      return responseMessage;
      
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Messaggio di fallback in caso di errore
      return {
        id: Date.now().toString(),
        text: 'Mi dispiace, sto avendo difficoltà tecniche. Riprova tra qualche minuto!',
        isUser: false,
        timestamp: new Date()
      };
    }
  }

  // Ottieni suggerimenti di domande quick basati su posizione
  getQuickSuggestions(hasLocation: boolean = false): string[] {
    const generalSuggestions = [
      "Migliori pizzerie a Catania",
      "Ristoranti di pesce a Palermo", 
      "Hotel con vista mare a Taormina",
      "Dove mangiare cannoli a Palermo",
      "Ristoranti stellati in Sicilia",
      "Hotel di lusso a Siracusa"
    ];

    const locationBasedSuggestions = [
      "Cosa c'è nelle vicinanze?",
      "Ristoranti vicini a me",
      "Hotel qui intorno",
      "Dove mangiare nelle vicinanze?",
      "Locali con musica dal vivo vicini",
      "Pizzerie qui intorno"
    ];

    return hasLocation 
      ? [...locationBasedSuggestions, ...generalSuggestions.slice(0, 2)]
      : generalSuggestions;
  }

  // Pulisci cronologia conversazione
  clearConversation(): void {
    // Implementation per pulire la cronologia locale
    console.log('Conversation cleared');
  }
}

export const aiChatService = new AIChatService();