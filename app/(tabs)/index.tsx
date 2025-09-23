import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const features = [
  {
    icon: '🩺',
    title: 'AI Doctor',
    description: 'Chat with our virtual medical assistant',
    route: '/(features)/ai-doctor',
  },
  {
    icon: '📄',
    title: 'Rx Scan',
    description: 'Extract text from prescription handwriting',
    route: '/(features)/rx-scan',
  },
  {
    icon: '💊',
    title: 'MedGuide',
    description: 'Get medicine suggestions and information',
    route: '/(features)/med-guide',
  },
  {
    icon: '🧪',
    title: 'LabSense',
    description: 'Analyze and understand lab results',
    route: '/(features)/lab-sense',
  },
  {
    icon: '🩻',
    title: 'ScanVision',
    description: 'Analyze medical scan results',
    route: '/(features)/scan-vision',
  },
  {
    icon: '🤖',
    title: 'SymptomAI',
    description: 'AI-powered symptom checking',
    route: '/(features)/symptom-ai',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Lune 🌙</Text>
        <Text style={styles.subtitle}>Your AI-powered healthcare assistant</Text>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <Link 
            key={index} 
            href={feature.route as any}
            asChild
          >
            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureTitle, { fontFamily: fontFamily.semibold }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDescription, { fontFamily: fontFamily.regular }]}>
                {feature.description}
              </Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
