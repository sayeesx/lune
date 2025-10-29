import axios, { AxiosInstance } from 'axios';
import { API_KEY, BASE_URL, ENDPOINTS, TIMEOUT } from './config';

export type ApiResponse<T = any> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
});

// Request interceptor for logging
client.interceptors.request.use(
  (req) => {
    try {
      // keep logs minimal in production
       
      console.log('[API] Request:', req.method, req.url);
    } catch (e) {}
    return req;
  },
  (err) => {
     
    console.warn('[API] Request error:', err?.message || err);
    return Promise.reject(err);
  }
);

// Response interceptor for logging
client.interceptors.response.use(
  (res) => {
    try {
       
      console.log('[API] Response:', res.status, res.config.url);
    } catch (e) {}
    return res;
  },
  (err) => {
     
    console.warn('[API] Response error:', err?.response?.status, err?.message || err);
    return Promise.reject(err);
  }
);

const handleErrorMessage = (err: any): string => {
  if (!err) return 'An unexpected error occurred';

  // Timeout
  if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again';

  // Network error
  if (!err.response) return 'Please check your internet connection';

  // Server-provided error
  const data = err.response.data || {};
  return data.message || data.error || err.message || 'An unexpected server error occurred';
};

const post = async <T = any>(endpoint: string, payload: any = {}): Promise<ApiResponse<T>> => {
  try {
    const res = await client.post<T>(endpoint, payload);
    return { success: true, data: res.data as T, error: null };
  } catch (error) {
    const message = handleErrorMessage(error);
    return { success: false, data: null, error: message };
  }
};

export const consultDoctor = async (message: string, conversationHistory: { role: string; content: string }[] = []): Promise<ApiResponse> => {
  return post(ENDPOINTS.doctor, { message, conversationHistory });
};

export const analyzePrescription = async (prescriptionText: string): Promise<ApiResponse> => {
  return post(ENDPOINTS.rxscan, { prescriptionText });
};

export const getMedicineInfo = async (medicineName: string): Promise<ApiResponse> => {
  return post(ENDPOINTS.medguide, { medicineName });
};

export const interpretLabResults = async (labResults: any): Promise<ApiResponse> => {
  return post(ENDPOINTS.labsense, { labResults });
};

export const analyzeMedicalImage = async (imageData: any, message = ''): Promise<ApiResponse> => {
  // If backend expects multipart/form-data, adapt here.
  return post(ENDPOINTS.scanvision, { imageData, message });
};

export const translateMedicalTerm = async (term: string, targetLanguage = 'en'): Promise<ApiResponse> => {
  return post(ENDPOINTS.medicalTranslation, { term, targetLanguage });
};

export default {
  consultDoctor,
  analyzePrescription,
  getMedicineInfo,
  interpretLabResults,
  analyzeMedicalImage,
  translateMedicalTerm,
};
