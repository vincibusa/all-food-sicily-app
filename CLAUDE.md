# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AllFoodSicily is a React Native Expo app for discovering restaurants, hotels, and travel guides in Sicily. The app features AI-powered chat functionality using Firebase Gemini, data from Supabase, and location-based services.

## Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npx expo start` - Start development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run web version
- `npm run test` - Run Jest tests in watch mode
- `npm run lint` - Run ESLint

### Building and Distribution
- `eas build --platform android --profile production` - Build production Android APK
- `eas build --platform ios --profile production` - Build production iOS
- `eas build --platform all --profile preview` - Build preview for both platforms
- `npm run reset-project` - Reset to blank project template

## Architecture

### Navigation Structure
- Uses Expo Router with file-based routing
- Root layout (`app/_layout.tsx`) wraps app with providers: PerformanceProvider, ThemeProvider
- Tab navigation (`app/(tabs)/_layout.tsx`) with 5 tabs: Home, Locali (Restaurants), Hotel, Guide, Chat AI
- Detail pages are Stack screens outside tab navigation (e.g., `ristoranti/[id]`)

### Data Layer
- **Supabase**: Primary database for restaurants, hotels, guides, categories, coupons
- **Firebase**: AI chat functionality using Gemini 2.5 Flash model
- **Services**: Organized by feature (`restaurant.service.ts`, `hotel.service.ts`, etc.)
- **Types**: Centralized TypeScript definitions in `types/index.ts`

### State Management
- Context-based state management (ThemeContext, PerformanceContext)
- No Redux or external state management library
- Local state with hooks for component-level state

### Styling System
- Design tokens in `constants/DesignTokens.ts`
- Theme system using Context API
- WCAG 2.1 AA compliant colors
- Uses Expo's built-in styling with StyleSheet

### Key Features
- **Location Services**: Uses expo-location for nearby restaurants/hotels
- **Maps Integration**: react-native-maps with Google Maps API
- **AI Chat**: Firebase Gemini integration for food/travel recommendations
- **Performance Optimization**: Custom hooks for battery saver, network optimization
- **Haptic Feedback**: Cross-platform haptic feedback system
- **Caching**: Service-level caching for API responses

### Component Structure
- **Pages**: In `app/` directory following Expo Router conventions
- **Components**: Organized by feature in `components/` (Home/, Chat/, etc.)
- **Shared Components**: Generic components like LazyImage, LoadingStates, etc.
- **Services**: API integration and business logic
- **Utils**: Helper functions for haptics, transitions, typography

### Database Schema (Supabase)
- `restaurants`: Core restaurant data with location, ratings, categories
- `hotels`: Hotel listings with star ratings and amenities
- `guides`: Travel guides with rich content and gallery
- `categories`: Classification system for all content types
- `coupons`: Discount codes tied to restaurants
- `guide_sections`: Structured content blocks for guides
- `guide_sponsors`: Sponsor information for guides

### Build Configuration
- **EAS Build**: Configured for Android APK and iOS builds
- **Bundle ID**: `com.bacienz.allfoodsicily`
- **Google Maps**: Android API key configured in app.json
- **Permissions**: Location access for nearby features

### Environment & Auth
- No user authentication system (read-only app)
- Supabase configured for anonymous access
- API keys are committed (public read-only access)

## Development Notes

### Running Tests
The project uses Jest with Expo preset. Tests run in watch mode by default.

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` maps to root)
- Expo TypeScript base configuration

### Performance Considerations
- LazyImage component for optimized image loading
- Skeleton loading states for better UX
- Performance monitoring context for tracking metrics
- Battery saver mode support