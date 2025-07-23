/**
 * API configuration for AllFood mobile app
 */

// Backend API configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.34:8000',
  API_VERSION: '/api/v1',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/app-login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    RESTAURANTS: {
      LIST: '/restaurants/',
      DETAIL: '/restaurants/{id}',
      SEARCH: '/restaurants/search/',
      CREATE: '/restaurants/',
      UPDATE: '/restaurants/{id}',
      DELETE: '/restaurants/{id}',
    },
    ARTICLES: {
      LIST: '/articles/',
      DETAIL: '/articles/{id}',
      DETAIL_BY_SLUG: '/articles/slug/{slug}',
      PUBLISHED: '/articles/published/',
      SEARCH: '/articles/search/',
      CREATE: '/articles/',
      UPDATE: '/articles/{id}',
      DELETE: '/articles/{id}',
    },
    CATEGORIES: {
      LIST: '/categories/',
      DETAIL: '/categories/{id}',
      DETAIL_BY_SLUG: '/categories/slug/{slug}',
      CREATE: '/categories/',
      UPDATE: '/categories/{id}',
      DELETE: '/categories/{id}',
    },
    GUIDES: {
      LIST: '/guides/',
      DETAIL: '/guides/{id}',
      CREATE: '/guides/',
      UPDATE: '/guides/{id}',
      DELETE: '/guides/{id}',
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