import 'react-native-url-polyfill/auto';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootLayout from './app/_layout';
import { AuthProvider } from './context/auth';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootLayout />
      </SafeAreaProvider>
    </AuthProvider>
  );
}