import RoundBackButton from '../../components/navigation/RoundBackButton';
import { TOP_NAV_HEIGHT } from '@/components/TopNavBar';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

export default function LabSenseScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoundBackButton />
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingTop: TOP_NAV_HEIGHT }}>
        <FeatureScreen
          icon="🧪"
          title="LabSense"
          description="Analyze and understand your lab results with AI assistance"
        />
      </ScrollView>
    </SafeAreaView>
  );
}