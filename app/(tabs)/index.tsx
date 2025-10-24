// app/(tabs)/index.tsx
import { supabase } from '@/lib/supabaseClient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Display name from auth session (fallback to 'there')
const DEFAULT_NAME = 'there';

// Healthcare features mapped to the design template
const healthcareFeatures = [
  {
    key: 'ai-doctor',
    icon: require('@/assets/feature-icons/aidoctor.svg'),
    title: 'AI Doctor',
    description: 'Smart medical consultations',
    onPress: () => router.push('/(features)/ai-doctor')
  },
  {
    key: 'rx-scan',
    icon: require('@/assets/feature-icons/rxscan.svg'),
    title: 'Rx Scan',
    description: 'Prescription OCR scan',
    onPress: () => router.push('/(features)/rx-scan')
  },
  {
    key: 'med-guide',
    icon: require('@/assets/feature-icons/medbook.svg'),
    title: 'MedGuide',
    description: 'Medication guidance',
    onPress: () => router.push('/(features)/med-guide')
  },
  {
    key: 'lab-sense',
    icon: require('@/assets/feature-icons/labsense.svg'),
    title: 'LabSense',
    description: 'Lab result analysis',
    onPress: () => router.push('/(features)/lab-sense')
  },
  {
    key: 'scan-vision',
    icon: require('@/assets/feature-icons/scanvision.svg'),
    title: 'ScanVision',
    description: 'Medical image analysis',
    onPress: () => router.push('/(features)/scan-vision')
  },
  {
    key: 'medical-translation',
    icon: require('@/assets/feature-icons/medtranslation.svg'),
    title: 'Medical Translation',
    description: 'Translate medical terms',
    onPress: () => router.push('/(features)/medical-translation')
  },
];

// Recent chat history examples
const recentChats = [
  'Analyze my symptoms',
  'Check medication dosage',
  'Scan prescription label',
  'Explain lab results',
];

// Improved shimmer effect component for premium button
const ShimmerEffect = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  const [shimmerOffset, setShimmerOffset] = useState(-200);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerOffset(prev => prev > 200 ? -200 : prev + 1);
    }, 16); // 60fps
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[{ overflow: 'hidden', position: 'relative' }, style]}>
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: shimmerOffset,
          width: 60,
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          transform: [{ skewX: '30deg' }],
          zIndex: 1,
        }}
      />
      <View style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState<string>(DEFAULT_NAME);
  const [inputText, setInputText] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const screenData = Dimensions.get('window');
  const inputScale = useRef(new Animated.Value(1)).current;
  const inputElevation = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const fullName = (session?.user?.user_metadata?.full_name as string | undefined)?.trim();
      if (fullName && fullName.length > 0) {
        setDisplayName(fullName.split(' ')[0]);
      } else {
        const email = session?.user?.email ?? '';
        if (email) setDisplayName(email.split('@')[0]);
      }

      // Profiles table fallback
      const userId = session?.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle();
        const pName = (profile?.full_name as string | undefined)?.trim();
        if (pName && pName.length > 0) setDisplayName(pName.split(' ')[0]);
      }
    })();
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // Navigate to chat with the input text
      router.push({
        pathname: '/(tabs)/chat',
        params: { initialMessage: inputText.trim() }
      });
      setInputText('');
    }
  };

  const handleChatHistoryPress = (chatText: string) => {
    router.push({
      pathname: '/(tabs)/chat',
      params: { initialMessage: chatText }
    });
  };

  const handlePremiumPress = () => {
    router.push('/(tabs)/premium');
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleSeeAllPress = () => {
    router.push('/(tabs)/chat');
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    Animated.spring(inputScale, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();

    Animated.timing(inputElevation, {
      toValue: 16,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    Animated.spring(inputScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.timing(inputElevation, {
      toValue: 8,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputPress = () => {
    if (inputText.trim()) {
      router.push({
        pathname: '/(tabs)/chat',
        params: { initialMessage: inputText.trim() }
      });
    } else {
      router.push('/(tabs)/chat');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      
      {/* Scrollable Content with Header */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          {/* User Profile & Premium Button */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handleProfilePress}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="account" size={24} color="#666" />
              </View>
          </TouchableOpacity>
        </View>
            <TouchableOpacity style={styles.premiumButton} onPress={handlePremiumPress}>
              <ShimmerEffect style={styles.premiumShimmer}>
                <LinearGradient
                  colors={['#FF8C00', '#FFA500']}
                  style={styles.premiumGradient}
                >
                  <MaterialCommunityIcons name="crown" size={16} color="#FFF" />
                  <Text style={styles.premiumText}>Try premium</Text>
      </LinearGradient>
              </ShimmerEffect>
          </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Hello {displayName}, 👋</Text>
            <Text style={styles.tagline}>Make anything you want, whenever you want.</Text>
          </View>
        </View>

        {/* Main Content */}
        {/* Feature Cards Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {healthcareFeatures.map((feature, index) => (
              <TouchableOpacity
                key={feature.key}
                style={styles.featureCard}
                onPress={feature.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Image source={feature.icon} style={styles.iconImage} resizeMode="contain" />
                  </View>
                  <TouchableOpacity style={styles.arrowButton}>
                    <MaterialCommunityIcons name="chevron-right" size={16} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chat History Section */}
        <View style={styles.chatHistorySection}>
          <View style={styles.chatHistoryHeader}>
            <Text style={styles.chatHistoryTitle}>Chat history</Text>
            <TouchableOpacity onPress={handleSeeAllPress}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chatPills}>
            {recentChats.slice(0, 2).map((chat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chatPill}
                onPress={() => handleChatHistoryPress(chat)}
                activeOpacity={0.7}
              >
                <Text style={styles.chatPillText}>{chat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add padding for floating input */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Input Section */}
      <View style={[styles.floatingInput, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View 
          style={[
            styles.inputContainer,
            {
              transform: [{ scale: inputScale }],
              elevation: inputElevation,
            }
          ]}
        >
          <TouchableOpacity style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.textInputContainer} onPress={handleInputPress}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onSubmitEditing={handleSendMessage}
              editable={true}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.micButton}>
            <MaterialCommunityIcons name="microphone" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <MaterialCommunityIcons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: screenWidth * 0.06, // 6% of screen width
    paddingBottom: screenHeight * 0.03, // 3% of screen height
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: screenHeight * 0.03, // 3% of screen height
  },
  avatarContainer: {
    flex: 1,
  },
  avatar: {
    width: Math.max(48, screenWidth * 0.12), // Minimum 48px, 12% of screen width
    height: Math.max(48, screenWidth * 0.12),
    borderRadius: Math.max(24, screenWidth * 0.06),
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumShimmer: {
    borderRadius: 20,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.04, // 4% of screen width
    paddingVertical: screenHeight * 0.01, // 1% of screen height
    gap: 6,
  },
  premiumText: {
    color: '#FFF',
    fontSize: screenWidth * 0.035, // 3.5% of screen width
    fontFamily: 'Inter-SemiBold',
  },
  greetingSection: {
    marginBottom: screenHeight * 0.01, // 1% of screen height
  },
  greeting: {
    fontSize: screenWidth * 0.07, // 7% of screen width
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tagline: {
    fontSize: screenWidth * 0.04, // 4% of screen width
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  content: {
    paddingHorizontal: screenWidth * 0.06, // 6% of screen width
    paddingTop: screenHeight * 0.02, // 2% of screen height
  },
  featuresSection: {
    marginBottom: screenHeight * 0.04, // 4% of screen height
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8, // Small gap between cards
    paddingHorizontal: 16, // Consistent padding
  },
  featureCard: {
    width: (screenWidth - 32 - 16 - 8) / 2, // Total width minus content padding, grid padding, and gap, divided by 2
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Math.max(16, screenWidth * 0.04), // Minimum 16px, 4% of screen width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: Math.max(16, screenHeight * 0.02), // Minimum 16px, 2% of screen height
    marginHorizontal: 4, // Small horizontal margin for better spacing
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40, // Fixed size for better consistency
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  arrowButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: screenWidth * 0.04, // 4% of screen width
    fontFamily: 'Inter-SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: screenWidth * 0.032, // 3.2% of screen width
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
  },
  chatHistorySection: {
    marginBottom: screenHeight * 0.04, // 4% of screen height
  },
  chatHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatHistoryTitle: {
    fontSize: screenWidth * 0.045, // 4.5% of screen width
    fontFamily: 'Inter-SemiBold',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: screenWidth * 0.035, // 3.5% of screen width
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  chatPills: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  chatPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  chatPillText: {
    fontSize: screenWidth * 0.035, // 3.5% of screen width
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  floatingInput: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: screenWidth * 0.06, // 6% of screen width
    paddingTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: screenWidth * 0.04, // 4% of screen width
    fontFamily: 'Inter-Regular',
    color: '#1A1A1A',
    paddingVertical: 8,
    minHeight: 40,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
