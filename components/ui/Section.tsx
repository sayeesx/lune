// components/ui/Section.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.wrap}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24, paddingHorizontal: 16 },
  header: { marginBottom: 12 },
  title: { fontFamily: 'Inter-Bold', fontSize: 20, color: '#000' },
  subtitle: { marginTop: 4, fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(0,0,0,0.6)' },
  content: { gap: 16 },
});
