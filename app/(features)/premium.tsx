import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();

  const premiumFeatures = [
    {
      icon: 'robot',
      title: 'Advanced AI Consultations',
      description: 'Get personalized medical advice from our advanced AI system'
    },
    {
      icon: 'file-search',
      title: 'Unlimited Prescription Scans',
      description: 'Scan unlimited prescriptions with detailed analysis'
    },
    {
      icon: 'chart-line',
      title: 'Health Analytics',
      description: 'Track your health trends and get insights'
    },
    {
      icon: 'clock-outline',
      title: 'Priority Support',
      description: 'Get faster responses and priority customer support'
    },
    {
      icon: 'shield-check',
      title: 'Enhanced Security',
      description: 'Advanced encryption and privacy protection'
    },
    {
      icon: 'sync',
      title: 'Real-time Updates',
      description: 'Get the latest medical information and updates'
    }
  ];

  const plans = [
    {
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      popular: false
    },
    {
      name: 'Yearly',
      price: '$79.99',
      period: '/year',
      popular: true,
      savings: 'Save 33%'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF8C00', '#FFA500']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Plans</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#FF8C00', '#FFA500']}
            style={styles.banner}
          >
            <MaterialCommunityIcons name="crown" size={48} color="#FFF" />
            <Text style={styles.bannerTitle}>Upgrade to Premium</Text>
            <Text style={styles.bannerSubtitle}>
              Unlock all features and get the most out of Lune
            </Text>
          </LinearGradient>
        </View>

        {/* Pricing Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansContainer}>
            {plans.map((plan, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.planCard,
                  plan.popular && styles.popularPlan
                ]}
                activeOpacity={0.8}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
                {plan.savings && (
                  <Text style={styles.savings}>{plan.savings}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <View style={styles.featuresList}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name={feature.icon as any} size={24} color="#FF8C00" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF8C00', '#FFA500']}
            style={styles.ctaGradient}
          >
            <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
            <Text style={styles.ctaText}>Start Premium Trial</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Cancel anytime.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: screenWidth * 0.06,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: screenWidth * 0.05,
    fontFamily: 'Inter-Bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.06,
  },
  bannerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  banner: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerTitle: {
    fontSize: screenWidth * 0.06,
    fontFamily: 'Inter-Bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.05,
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  planName: {
    fontSize: screenWidth * 0.045,
    fontFamily: 'Inter-SemiBold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: screenWidth * 0.06,
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
  },
  period: {
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 2,
  },
  savings: {
    fontSize: screenWidth * 0.03,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  ctaButton: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    color: '#FFF',
    fontSize: screenWidth * 0.045,
    fontFamily: 'Inter-Bold',
  },
  termsText: {
    fontSize: screenWidth * 0.03,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});
