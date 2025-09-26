import { fonts } from '@/theme/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function loadApp() {
      await Font.loadAsync(fonts);
      
      const userToken = await AsyncStorage.getItem('userToken');
      const inAuthGroup = segments[0] === 'auth';
      
      if (!userToken && !inAuthGroup) {
        // Redirect to login if there's no token and we're not in auth group
        router.replace('/auth/login');
      } else if (userToken && inAuthGroup) {
        // Redirect to home if we have a token but we're in auth group
        router.replace('/(tabs)');
      }
      setIsBootstrapping(false);
    }

    loadApp();
  }, [segments]);

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
    </ThemeProvider>
  );
}
