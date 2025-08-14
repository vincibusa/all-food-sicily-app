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
- Descrizioni coinvolgenti dei luoghi suggeriti
- Dettagli specifici (rating, tipo cucina, città)
- Consigli pratici (fascia prezzo, specialità)
- Suggerimenti di approfondimento quando appropriato
`;

  // Chiama Gemini 2.5 Flash via Firebase AI Logic
  private async callGeminiAPI(context: AIContext): Promise<string> {
    try {
      // Costruisci il prompt con il contesto Supabase
      const contextData = JSON.stringify({
        restaurants: context.restaurants,
        hotels: context.hotels,
        guides: context.guides,
        categories: context.categories,
        coupons: context.coupons
      }, null, 2);

      const fullPrompt = `${this.SYSTEM_PROMPT}

CONTESTO DATI DISPONIBILI:
${contextData}

DOMANDA UTENTE: ${context.query}

Rispondi in italiano fornendo consigli dettagliati basati SOLO sui dati forniti nel contesto.`;

      console.log('Sending prompt to Gemini:', fullPrompt.substring(0, 200) + '...');

      // Chiamata diretta a Gemini via Firebase AI Logic
      const result = await geminiModel.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      console.log('Gemini response received:', text.substring(0, 100) + '...');

      return text || 'Mi dispiace, non sono riuscito a generare una risposta appropriata.';
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback response in caso di errore
      const { restaurants, hotels, guides } = context;
      
      if (restaurants.length > 0) {
        const topRestaurant = restaurants[0];
        return `Ho trovato ${restaurants.length} ristoranti per la tua ricerca. Ti consiglio **${topRestaurant.name}** a ${topRestaurant.city}${topRestaurant.rating ? ` con rating ${topRestaurant.rating}/5` : ''}.`;
      }
      
      if (hotels.length > 0) {
        const topHotel = hotels[0];
        return `Ho trovato ${hotels.length} hotel disponibili. Ti suggerirei **${topHotel.name}** a ${topHotel.city}.`;
      }
      
      if (guides.length > 0) {
        return `Ho trovato ${guides.length} guide che potrebbero interessarti per la tua ricerca.`;
      }
      
      return 'Mi dispiace, sto avendo difficoltà tecniche con il servizio AI. Riprova tra qualche minuto!';
    }
  }

  // Invia messaggio e ottieni risposta
  async sendMessage(userMessage: string): Promise<ChatMessage> {
    try {
      // 1. Costruisci il contesto dai dati Supabase
      const context = await contextBuilder.buildContext(userMessage);
      
      // 2. Chiama Gemini con il contesto
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
      
      // 4. Crea il messaggio di risposta
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        suggestions: (restaurantSuggestions.length > 0 || hotelSuggestions.length > 0) ? suggestions : undefined
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

  // Ottieni suggerimenti di domande quick
  getQuickSuggestions(): string[] {
    return [
      "Migliori pizzerie a Catania",
      "Ristoranti di pesce a Palermo", 
      "Hotel con vista mare a Taormina",
      "Dove mangiare cannoli a Palermo",
      "Ristoranti stellati in Sicilia",
      "Hotel di lusso a Siracusa",
      "Locali con musica dal vivo a Palermo",
      "Dove dormire a Cefalù"
    ];
  }

  // Pulisci cronologia conversazione
  clearConversation(): void {
    // Implementation per pulire la cronologia locale
    console.log('Conversation cleared');
  }
}

export const aiChatService = new AIChatService();