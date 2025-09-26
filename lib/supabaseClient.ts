import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize Supabase client
const supabaseUrl = (Constants.expoConfig?.extra?.supabaseUrl as string) || (process.env.EXPO_PUBLIC_SUPABASE_URL as string);
const supabaseAnonKey = (Constants.expoConfig?.extra?.supabaseAnonKey as string) || (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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