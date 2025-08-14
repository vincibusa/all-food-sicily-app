import { initializeApp } from 'firebase/app';
import { getAI, getGenerativeModel } from '@firebase/ai';

// Firebase configuration for all-food-sicily project
const firebaseConfig = {
  apiKey: "AIzaSyBjokeY_ORy3ThyBcpXgCPOy3PwQi1-Tw4",
  authDomain: "all-food-sicily.firebaseapp.com",
  projectId: "all-food-sicily",
  storageBucket: "all-food-sicily.firebasestorage.app",
  messagingSenderId: "737058285176",
  appId: "1:737058285176:web:859cca45ce6b6c9ebbef8d",
  measurementId: "G-B3MHRK72MP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase AI
const ai = getAI(app);

// Initialize Gemini 2.5 Flash model with thinking capability
export const geminiModel = getGenerativeModel(ai, { 
  model: "gemini-2.5-flash",
  generationConfig: {
    thinkingConfig: {
      thinkingBudget: 1024 // Budget appropriato per query gastronomiche (complessità media)
    }
  }
});

// Export the app instance
export default app;