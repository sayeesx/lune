import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import { Stack } from 'expo-router';
import React from 'react';

export default function FeaturesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: fontFamily.semibold,
        },
        headerBackTitle: 'Back',
        headerBackTitleStyle: {
          fontFamily: fontFamily.regular,
        },
      }}>
      <Stack.Screen 
        name="ai-doctor" 
        options={{ 
          title: 'AI Doctor',
        }} 
      />
      <Stack.Screen 
        name="rx-scan" 
        options={{ 
          title: 'Rx Scan',
        }} 
      />
      <Stack.Screen 
        name="lab-sense" 
        options={{ 
          title: 'Lab Sense',
        }} 
      />
      <Stack.Screen 
        name="med-guide" 
        options={{ 
          title: 'Med Guide',
        }} 
      />
      <Stack.Screen 
        name="scan-vision" 
        options={{ 
          title: 'Scan Vision',
        }} 
      />
      <Stack.Screen 
        name="symptom-ai" 
        options={{ 
          title: 'Symptom AI',
        }} 
      />
    </Stack>
  );
}