# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AllFood Sicily App is a React Native/Expo mobile application for discovering restaurants and reading food-related articles in Sicily. Part of the larger AllFood platform ecosystem consisting of a FastAPI backend and React web dashboard.

## Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **Language**: TypeScript with strict mode
- **Routing**: Stack navigation with tab-based main navigation
- **State Management**: React Context (ThemeContext)
- **Styling**: React Native StyleSheet (no external CSS framework)
- **Testing**: Jest with expo preset

## Development Commands

```bash
# Setup
npm install

# Development
npm start            # Start Expo dev server
npm run android      # Run on Android emulator  
npm run ios          # Run on iOS simulator
npm run web          # Run as web app

# Testing & Quality
npm test             # Run Jest tests with watch mode
npm run lint         # Run Expo lint

# Project Management
npm run reset-project # Reset to blank template
```

## Architecture

### File-Based Routing Structure
```
app/
├── _layout.tsx           # Root layout with Stack navigation
├── index.tsx            # Landing/splash screen
├── login.tsx            # Authentication screen
├── register.tsx         # User registration
├── (tabs)/              # Tab navigation group
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Home screen
│   ├── ristoranti.tsx   # Restaurants list
│   ├── guide.tsx        # Guides/articles list  
│   └── profilo.tsx      # User profile
├── ristoranti/[id].tsx  # Restaurant detail (dynamic route)
├── guide/[id].tsx       # Guide detail (dynamic route)
└── account/             # Account management screens
```

### Core Services
- `services/api.ts`: Base API client with error handling and auth
- `services/api.config.ts`: API configuration and endpoints
- `services/auth.service.ts`: Authentication logic
- `services/restaurant.service.ts`: Restaurant data operations
- `services/guide.service.ts`: Article/guide data operations

### Key Components
- `components/Home/`: Homepage-specific components (HeroSection, RestaurantCard, ArticleCard)
- `components/ListCard.tsx`: Reusable list item component
- `context/ThemeContext.tsx`: Theme management system

## API Integration

The app connects to a FastAPI backend with the following configuration:

- **Base URL**: `https://all-food-backend--all-food-sicily.europe-west4.hosted.app`
- **API Version**: `/api/v1`
- **Authentication**: Bearer token stored in global auth_token
- **Timeout**: 10 seconds
- **Error Handling**: Custom ApiError class with status codes

### Main Endpoints Used
- `/auth/*`: Authentication operations
- `/restaurants/`: Restaurant data and search
- `/articles/`: Article/guide content
- `/categories/`: Content categorization

## TypeScript Configuration

- Extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Includes all `.ts/.tsx` files and Expo types

## Development Workflow

1. Use `npm start` to launch Expo development server
2. Choose target platform (iOS/Android/Web) from Expo CLI
3. File-based routing automatically handles new screens in `app/` directory
4. Use TypeScript interfaces from `types/index.ts` for type safety
5. API calls go through centralized `apiClient` singleton
6. Theme switching available via `ThemeContext`

## Key Patterns

- **Navigation**: Stack navigator at root, tabs for main screens, modal presentation for details
- **Data Fetching**: Centralized API client with automatic auth header injection
- **Error Handling**: Custom ApiError class with detailed logging
- **Type Safety**: Strict TypeScript with defined interfaces for all data models
- **State Management**: React Context for global state (theme, auth)

## Notes

- App uses file-based routing - new screens go in `app/` directory
- API client automatically handles authentication headers
- Theme system supports light/dark mode switching
- All screens have `headerShown: false` for custom UI control