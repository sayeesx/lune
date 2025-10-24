import { fonts } from '@/theme/fonts';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#4CAF50',
        backgroundColor: '#FFFFFF',
        height: 70,
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#100F15',
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '400',
        color: '#4A4A4D',
        lineHeight: 18,
      }}
      text2NumberOfLines={3}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#F44336',
        backgroundColor: '#FFFFFF',
        height: 70,
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#100F15',
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '400',
        color: '#4A4A4D',
        lineHeight: 18,
      }}
      text2NumberOfLines={3}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#2652F9',
        backgroundColor: '#FFFFFF',
        height: 70,
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#100F15',
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '400',
        color: '#4A4A4D',
        lineHeight: 18,
      }}
      text2NumberOfLines={3}
    />
  ),
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const segmentsRef = useRef<string[]>(segments as unknown as string[]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const { session, isLoading } = useAuth();

  useEffect(() => {
    // keep a live ref of the current segments for non-hook callbacks
    segmentsRef.current = segments as unknown as string[];
  }, [segments]);

  useEffect(() => {
    async function bootstrap() {
      await Font.loadAsync(fonts);
      setIsBootstrapping(false);
    }
    bootstrap();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isBootstrapping || isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, router]);

  if (isBootstrapping) {
    // Prevent flashing: show a loading spinner while bootstrapping
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(features)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
