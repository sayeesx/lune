import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/Toast';
import RootLayout from './app/_layout';

export default function App() {
  return (
    <SafeAreaProvider>
      <RootLayout />
      <Toast config={toastConfig} />
}