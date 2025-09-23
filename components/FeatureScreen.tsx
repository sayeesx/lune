import { colors } from '@/theme/colors';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Card, StyledText } from './ui/core';

interface FeatureScreenProps {
  title: string;
  description: string;
  icon: string;
  children?: React.ReactNode;
}

const FeatureScreen: React.FC<FeatureScreenProps> = ({ 
  title, 
  description, 
  icon,
  children 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.header}>
          <View style={styles.iconContainer}>
            <StyledText style={styles.icon}>{icon}</StyledText>
          </View>
          <StyledText variant="h2" style={styles.title}>{title}</StyledText>
          <StyledText variant="body" color={colors.textSecondary} style={styles.description}>
            {description}
          </StyledText>
        </Card>
        
        <View style={styles.content}>
          {children || (
            <Card variant="outlined" style={styles.comingSoonCard}>
              <StyledText variant="h3" color={colors.textSecondary} style={styles.comingSoon}>
                Feature coming soon...
              </StyledText>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary + '10',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  comingSoonCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    opacity: 0.8,
  },
  comingSoon: {
    fontStyle: 'italic',
  },
});

export default FeatureScreen;