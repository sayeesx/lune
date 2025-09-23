import { Card, StyledText } from '@/components/ui/core';
import { colors } from '@/theme/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.header}>
        <StyledText variant="h2" style={styles.title}>Health Reports</StyledText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  header: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
  },
});