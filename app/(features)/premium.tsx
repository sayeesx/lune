import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState(1);

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
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Premium</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#2652F9', '#032EA6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.crownContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.crownCircle}
              >
                <Image 
                  source={require('../../assets/home-icons/premium.png')}
                  style={styles.premiumIcon}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={styles.bannerTitle}>Unlock Premium</Text>
            <Text style={styles.bannerSubtitle}>
              Experience the full power of AI-driven healthcare
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
                  selectedPlan === index && styles.selectedPlan,
                  plan.popular && styles.bestValueCard
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedPlan(index)}
              >
                {plan.popular && (
                  <LinearGradient
                    colors={['#FFD700', '#FFC000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.popularBadge}
                  >
                    <MaterialCommunityIcons name="star" size={14} color="#100F15" />
                    <Text style={styles.popularText}>Best Value</Text>
                  </LinearGradient>
                )}
                <View style={styles.planTop}>
                  <Text style={[
                    styles.planName,
                    selectedPlan === index && styles.selectedText,
                    plan.popular && styles.bestValueText
                  ]}>
                    {plan.name}
                  </Text>
                  {selectedPlan === index && (
                    <View style={styles.checkmark}>
                      <MaterialCommunityIcons name="check-circle" size={24} color="#2652F9" />
                    </View>
                  )}
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[
                    styles.price,
                    selectedPlan === index && styles.selectedText,
                    plan.popular && styles.bestValuePrice
                  ]}>
                    {plan.price}
                  </Text>
                  <Text style={[
                    styles.period,
                    plan.popular && styles.bestValueText
                  ]}>
                    {plan.period}
                  </Text>
                </View>
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savings}>{plan.savings}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <View style={styles.featuresList}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <LinearGradient
                  colors={['rgba(38, 82, 249, 0.12)', 'rgba(3, 46, 166, 0.08)']}
                  style={styles.featureIcon}
                >
                  <MaterialCommunityIcons 
                    name={feature.icon as any} 
                    size={24} 
                    color="#2652F9" 
                  />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={styles.ctaButton} 
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2652F9', '#032EA6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Image 
              source={require('../../assets/home-icons/premium.png')}
              style={styles.ctaIcon}
              resizeMode="contain"
            />
            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.{'\n'}
          Cancel anytime from your account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100F15',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#100F15',
  },
  scrollContent: {
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: 24,
    paddingBottom: 40,
  },
  bannerContainer: {
    marginBottom: 32,
  },
  banner: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  crownContainer: {
    marginBottom: 20,
  },
  crownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumIcon: {
    width: 56,
    height: 56,
    tintColor: '#FFFFFF',
  },
  bannerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  plansSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 14,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#1A1A24',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A2A38',
    position: 'relative',
  },
  selectedPlan: {
    backgroundColor: 'rgba(38, 82, 249, 0.08)',
    borderColor: '#2652F9',
    transform: [{ scale: 1.02 }],
  },
  bestValueCard: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularText: {
    color: '#100F15',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.3,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#9199B1',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  bestValueText: {
    color: '#FFFFFF',
  },
  bestValuePrice: {
    color: '#FFFFFF',
  },
  checkmark: {
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#9199B1',
    letterSpacing: -0.5,
  },
  period: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9199B1',
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  savings: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9199B1',
    lineHeight: 20,
  },
  ctaButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2652F9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  ctaIcon: {
    width: 22,
    height: 22,
    tintColor: '#FFFFFF',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.3,
  },
  termsText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9199B1',
    textAlign: 'center',
    lineHeight: 20,
  },
});
