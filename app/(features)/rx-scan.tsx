import RoundBackButton from '../../components/navigation/RoundBackButton';
import { TOP_NAV_HEIGHT } from '@/components/TopNavBar';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

const styles = {
  container: {
    flex: 1,
  },
  content: {
    paddingTop: TOP_NAV_HEIGHT,
  },
};

export default function RxScanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <RoundBackButton />
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        <FeatureScreen
          icon="📄"
          title="Rx Scan"
          description="Extract and interpret handwritten prescriptions with ease"
        />
      </ScrollView>
    </SafeAreaView>
  );
}