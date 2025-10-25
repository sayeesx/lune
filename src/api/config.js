// API configuration & environment mapping
// Note: put your actual values in your project's .env or environment management
export const BASE_URL = process.env.RENDER_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'https://your-backend.example.com';
export const API_KEY = process.env.RENDER_API_KEY || process.env.EXPO_PUBLIC_RENDER_API_KEY || '';
export const TIMEOUT = 30000; // 30 seconds

export const ENDPOINTS = {
  doctor: '/api/doctor',
  rxscan: '/api/rxscan',
  medguide: '/api/medguide',
  labsense: '/api/labsense',
  scanvision: '/api/scanvision',
  medicalTranslation: '/api/medical-translation',
};

export default {
  BASE_URL,
  API_KEY,
  TIMEOUT,
  ENDPOINTS,
};
