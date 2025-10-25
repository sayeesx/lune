import axios from 'axios';
import { API_KEY, BASE_URL, ENDPOINTS, TIMEOUT } from './config';

// Create axios instance
const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
});

// Request interceptor for logging
client.interceptors.request.use((req) => {
  try {
    console.log('[API] Request:', req.method, req.url, req.data ? req.data : '');
  } catch (e) {
    // ignore logging errors
  }
  return req;
}, (err) => {
  console.warn('[API] Request error:', err?.message || err);
  return Promise.reject(err);
});

// Response interceptor for logging
client.interceptors.response.use((res) => {
  try {
    console.log('[API] Response:', res.status, res.data ? res.data : 'no-data');
  } catch (e) {}
  return res;
}, (err) => {
  console.warn('[API] Response error:', err?.response?.status, err?.message || err);
  return Promise.reject(err);
});

const handleErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred';

  // Timeout
  if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again';

  // Network error
  if (!err.response) return 'Please check your internet connection';

  // Server-provided error
  const data = err.response.data || {};
  return data.message || data.error || err.message || 'An unexpected server error occurred';
};

const post = async (endpoint, payload = {}) => {
  try {
    const res = await client.post(endpoint, payload);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    const message = handleErrorMessage(error);
    return { success: false, data: null, error: message };
  }
};

export const consultDoctor = async (message, conversationHistory = []) => {
  return post(ENDPOINTS.doctor, { message, conversationHistory });
};

export const analyzePrescription = async (prescriptionText) => {
  return post(ENDPOINTS.rxscan, { prescriptionText });
};

export const getMedicineInfo = async (medicineName) => {
  return post(ENDPOINTS.medguide, { medicineName });
};

export const interpretLabResults = async (labResults) => {
  return post(ENDPOINTS.labsense, { labResults });
};

export const analyzeMedicalImage = async (imageData, message = '') => {
  // imageData can be base64 or form-data depending on backend; currently sending as JSON placeholder
  return post(ENDPOINTS.scanvision, { imageData, message });
};

export const translateMedicalTerm = async (term, targetLanguage = 'en') => {
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
