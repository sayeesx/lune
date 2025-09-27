// components/services/CarePrograms.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { radii } from '../../theme/colors';
import { Section } from '../ui/Section';

const cards = [
  { title: 'Control Diabetes', desc: 'Personalized plans', colors: ['#FFE066', '#FFCD38'] },
  { title: 'Dental Treatments', desc: 'Care & cosmetics', colors: ['#B9F6CA', '#69F0AE'] },
  { title: 'Eye Care Packages', desc: 'Vision & exams', colors: ['#66A6FF', '#89F7FE'] },
];

export function CarePrograms() {
  return (
    <Section title="Care Programs">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 2 }}>
        {cards.map((c, i) => (
          <LinearGradient key={i} colors={c.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.desc}>{c.desc}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: { width: 260, height: 160, borderRadius: radii.xl, padding: 18, justifyContent: 'flex-end' },
  title: { fontFamily: 'Inter-Bold', fontSize: 18, color: '#000' },
  desc: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#000', opacity: 0.75, marginTop: 6 },
});
