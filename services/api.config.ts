/**
 * API configuration for AllFood mobile app
 */

// Backend API configuration
export const API_CONFIG = {
  BASE_URL: 'https://all-food-backend--all-food-sicily.europe-west4.hosted.app/',
  API_VERSION: '/api/v1',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    RESTAURANTS: {
      LIST: '/restaurants/',
      DETAIL: '/restaurants/{id}',
      SEARCH: '/restaurants/search/',
    },
    ARTICLES: {
      LIST: '/articles/',
      DETAIL: '/articles/{id}',
      DETAIL_BY_SLUG: '/articles/slug/{slug}',
    },
    CATEGORIES: {
      LIST: '/categories/',
      DETAIL: '/categories/{id}',
      DETAIL_BY_SLUG: '/categories/slug/{slug}',
    },
    GUIDES: {
      LIST: '/guides/',
      DETAIL: '/guides/{id}',
    },
    CITIES: {
      LIST: '/cities/',
    },
  },
};

// API headers configuration
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Timeout configuration (in milliseconds)
export const API_TIMEOUT = 10000;

// Retry configuration
export const API_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
};