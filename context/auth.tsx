import { supabase } from '@/lib/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      // First check for temp auth (for development bypass)
      const tempAuth = await AsyncStorage.getItem('tempAuth');
      if (tempAuth) {
        try {
          const parsed = JSON.parse(tempAuth);
          // Create a mock session object
          const mockSession = {
            access_token: parsed.session.access_token,
            user: parsed.user,
          } as any;
          setSession(mockSession);
          setIsLoading(false);
          return;
        } catch (e) {
          // If parsing fails, continue with normal flow
        }
      }

      // Normal Supabase auth flow
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};