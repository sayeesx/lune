// API configuration & environment mapping (TypeScript)
export const BASE_URL: string = (process.env.EXPO_PUBLIC_RENDER_API_URL as string) || (process.env.RENDER_API_URL as string) || 'https://lune-backend-cm4k.onrender.com';
export const API_KEY: string | undefined = (process.env.EXPO_PUBLIC_RENDER_API_KEY as string) || (process.env.RENDER_API_KEY as string) || undefined;
export const TIMEOUT = 30000; // 30 seconds

export const ENDPOINTS = {
  doctor: '/api/doctor',
  rxscan: '/api/rxscan',
  medguide: '/api/medguide',
  labsense: '/api/labsense',
  scanvision: '/api/scanvision',
  medicalTranslation: '/api/medical-translation',
} as const;

export default {
  BASE_URL,
  API_KEY,
  TIMEOUT,
  ENDPOINTS,
};
