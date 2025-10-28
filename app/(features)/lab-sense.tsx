import RoundBackButton from '../../components/navigation/RoundBackButton';
import { TOP_NAV_HEIGHT } from '@/components/TopNavBar';
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LabSenseScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoundBackButton />
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: TOP_NAV_HEIGHT }}>

      </ScrollView>
    </SafeAreaView>
  );
}