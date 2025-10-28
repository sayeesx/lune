import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Initialize Supabase client
const supabaseUrl = (Constants.expoConfig?.extra?.supabaseUrl as string) || (process.env.EXPO_PUBLIC_SUPABASE_URL as string);
const supabaseAnonKey = (Constants.expoConfig?.extra?.supabaseAnonKey as string) || (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string);

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid printing sensitive values to logs. Provide a generic error instead.
  console.error('Supabase initialization failed: missing environment variables.');
  throw new Error('Missing Supabase environment variables');
}

// Intentionally do NOT log the Supabase URL or anon key to prevent leaking secrets in logs.

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // required for native / Expo
  },
});

// Types for auth responses
export interface AuthResponse {
  data: {
    user: any;
    session: any;
  } | null;
  error: Error | null;
}

// Helper function to handle auth errors
export const getErrorMessage = (error: any): string => {
  if (!error) return '';
  
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password';
    case 'Email not confirmed':
      return 'Please verify your email first';
    case 'User already registered':
      return 'This email is already registered';
    case 'Password is too weak':
      return 'Password should be at least 6 characters';
    default:
      return error.message || 'An error occurred';
  }
};