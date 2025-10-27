import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import RoundBackButton from '../../components/navigation/RoundBackButton';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  blue: '#2652F9',
  deepBlue: '#032EA6',
  charcoal: '#100F15',
  gray: '#9199B1',
  lightGray: '#F7F7F8',
  darkGray: '#4A4A4D',
  background: '#F8F9FC',
  border: '#E5E7EB',
};

const EXPO_PUBLIC_RENDER_API_URL = process.env.EXPO_PUBLIC_RENDER_API_URL;

const ThinkingLoader = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const textScrollValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // More precise text animation using sequence
    Animated.loop(
      Animated.sequence([
        // First transition with slight overshoot
        Animated.timing(textScrollValue, {
          toValue: -42,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textScrollValue, {
          toValue: -40,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(800),
        
        // Second transition
        Animated.timing(textScrollValue, {
          toValue: -82,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textScrollValue, {
          toValue: -80,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(800),
        
        // Third transition
        Animated.timing(textScrollValue, {
          toValue: -122,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textScrollValue, {
          toValue: -120,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(800),
        
        // Fourth transition
        Animated.timing(textScrollValue, {
          toValue: -162,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textScrollValue, {
          toValue: -160,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(800),
        
        // Reset to start
        Animated.timing(textScrollValue, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadingMessages = [
    'Searching for brand......',
    'Searching for brand......',
    'Searching by composition......',
    'Thinking longer for the medicine name........',
    'Searching beyond Lune Database....',
    'Finding similar medicines......',
  ];

  return (
    <View style={thinkingStyles.container}>
      <View style={thinkingStyles.loader}>
        <Animated.View
          style={[
            thinkingStyles.spinner,
            { transform: [{ rotate: spin }] }
          ]}
        />
        
        <View style={thinkingStyles.wordsContainer}>
          <Animated.View 
            style={[
              thinkingStyles.wordsWrapper,
              { transform: [{ translateY: textScrollValue }] }
            ]}
          >
            {loadingMessages.map((message, index) => (
              <View key={index} style={thinkingStyles.wordContainer}>
                <Text 
                  style={thinkingStyles.word} 
                  numberOfLines={1} 
                  ellipsizeMode="clip"
                >
                  {message}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const thinkingStyles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginVertical: 8,
    marginLeft: 16,
    maxWidth: screenWidth * 0.8, // Use screen width for better responsiveness
    backgroundColor: 'transparent',
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 40,
    paddingRight: 8, // Add some right padding
  },
  spinner: {
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: 'rgba(145, 153, 177, 0.2)',
    borderTopColor: '#9199B1',
    borderRadius: 12,
    flexShrink: 0,
  },
  wordsContainer: {
    flex: 1,
    height: 40,
    overflow: 'hidden',
    minWidth: 280, // Increased minWidth to show full text
    maxWidth: screenWidth * 0.7, // Limit maximum width
  },
  wordsWrapper: {
    // Animated container
  },
  wordContainer: {
    height: 40,
    justifyContent: 'center',
    width: '100%',
  },
  word: {
    color: '#9199B1',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    lineHeight: 40,
    height: 40,
    paddingLeft: 6,
    includeFontPadding: false,
    textAlignVertical: 'center',
    // Ensure text doesn't shrink or wrap
    flexShrink: 0,
    flexGrow: 0,
  },
});
// Animated Loading Dots Component (for send button)
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animate(dot1, 0);
    const anim2 = animate(dot2, 200);
    const anim3 = animate(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const opacity1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const opacity2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const opacity3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.loadingDotsContainer}>
      <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
      <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
      <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
    </View>
  );
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  medGuideData?: any;
  timestamp: string;
}

// Parse text with **bold** markers
const parseTextWithBold = (text: string) => {
  const regex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }

  return parts;
};

// Medicine Details Card Component
const MedicineCard = ({ match, alternatives, reply }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.medicineCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.medicineName}>{match?.name}</Text>
      <Text style={styles.medicineComposition}>{match?.short_composition1}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Manufacturer:</Text>
        <Text style={styles.infoValueBold}>{match?.manufacturer_name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Price:</Text>
        <Text style={styles.infoValue}>₹{match?.price}</Text>
      </View>
      <Text style={styles.packSize}>{match?.pack_size_label}</Text>

      <View style={[styles.typeBadge, { backgroundColor: COLORS.lightGray }]}>
        <Text style={styles.typeText}>{match?.type?.toUpperCase()}</Text>
      </View>

      {reply && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Uses:</Text>
          <Text style={styles.sectionContent}>{reply}</Text>
        </View>
      )}

      {match?.side_effects && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Side Effects:</Text>
          <Text style={styles.sectionContent}>{match.side_effects}</Text>
        </View>
      )}

      {match?.drug_interactions?.drug?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drug Interactions:</Text>
          {match.drug_interactions.drug.map((drug: string, idx: number) => (
            <View key={idx} style={styles.interactionRow}>
              <Text style={styles.drugName}>{drug}</Text>
              {match.drug_interactions.effect[idx] === 'LIFE-THREATENING' && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>⚠️ LIFE-THREATENING</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {alternatives?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternatives:</Text>
          {alternatives.map((alt: string, idx: number) => (
            <Text key={idx} style={styles.alternativeItem}>• {alt}</Text>
          ))}
        </View>
      )}

      <Text style={styles.disclaimer}>
        This is AI-assisted information. Always consult a healthcare professional for medical advice.
      </Text>
    </Animated.View>
  );
};

// Animated Message Bubble
interface AnimatedMessageBubbleProps {
  text: string;
  isUser?: boolean;
  isError?: boolean;
  showThinkingLoader?: boolean;
  medGuideData?: any;
}

function AnimatedMessageBubble({ 
  text, 
  isUser, 
  isError, 
  showThinkingLoader,
  medGuideData 
}: AnimatedMessageBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { 
        toValue: 1, 
        duration: 300, 
        easing: Easing.out(Easing.ease), 
        useNativeDriver: true 
      }),
      Animated.timing(translateY, { 
        toValue: 0, 
        duration: 300, 
        easing: Easing.out(Easing.cubic), 
        useNativeDriver: true 
      })
    ]).start();
  }, []);

  const animatedStyle = {
    opacity,
    transform: [{ translateY }]
  };

  if (showThinkingLoader) {
    return (
      <Animated.View style={animatedStyle}>
        <ThinkingLoader />
      </Animated.View>
    );
  }

  if (medGuideData) {
    return (
      <MedicineCard 
        match={medGuideData.match}
        alternatives={medGuideData.alternatives}
        reply={medGuideData.reply}
      />
    );
  }

  return (
    <Animated.View 
      style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.botBubble, 
        isError ? styles.errorBubble : null, 
        animatedStyle
      ]}
    >
      <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
        {parseTextWithBold(text).map((part, idx) => (
          <Text 
            key={idx} 
            style={part.bold ? styles.boldText : {}}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    </Animated.View>
  );
}

export default function MedGuideScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const messageIdCounterRef = useRef(0);

  const generateUniqueId = useCallback((role: string) => {
    const timestamp = Date.now();
    const counter = messageIdCounterRef.current++;
    const randomId = Math.random().toString(36).slice(2, 9);
    return `${role}-${timestamp}-${counter}-${randomId}`;
  }, []);

  const scrollToBottom = useCallback((animated: boolean = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  const appendMessage = useCallback((msg: Message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((m) => [...m, msg]);
    scrollToBottom(true);
  }, [scrollToBottom]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isSending || isTyping) return;
    
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    
    const userMsg: Message = {
      id: generateUniqueId('user'),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    appendMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${EXPO_PUBLIC_RENDER_API_URL}/api/medguide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();
      
      setIsTyping(false);
      setIsSending(false);

      if (data?.matches?.[0]) {
        appendMessage({
          id: generateUniqueId('assistant'),
          role: 'assistant',
          content: '',
          medGuideData: {
            match: data.matches[0],
            alternatives: data.alternatives || [],
            reply: data.reply,
          },
          timestamp: new Date().toISOString(),
        });
      } else if (data?.alternatives?.length > 0) {
        appendMessage({
          id: generateUniqueId('assistant'),
          role: 'assistant',
          content: `I couldn't find that exact medicine. Did you mean one of these?\n\n${data.alternatives.join('\n')}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        appendMessage({
          id: generateUniqueId('assistant'),
          role: 'assistant',
          content: data?.reply || 'No information found for this medicine.',
          timestamp: new Date().toISOString(),
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('MedGuide API error:', error);
      setIsTyping(false);
      setIsSending(false);
      
      appendMessage({
        id: generateUniqueId('error'),
        role: 'error',
        content: 'Sorry, there was a problem connecting to MedGuide AI.',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'error';
    
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}>
        <AnimatedMessageBubble 
          text={item.content} 
          isUser={isUser} 
          isError={isError}
          showThinkingLoader={false}
          medGuideData={item.medGuideData}
        />
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.navigationCard}>
                <RoundBackButton />
              </View>
            </View>
          </View>

          <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.chatContainer}>
              {messages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeTitle}>MedGuide AI</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Enter a medicine name to get details, uses, side effects, and alternatives.
                  </Text>
                  <Text style={styles.welcomeDisclaimer}>
                    This is AI-assisted information. Always consult a healthcare professional.
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardDismissMode="interactive"
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() => scrollToBottom(true)}
                />
              )}
              
              {isTyping && (
                <View style={[styles.msgRow, styles.msgLeft]}>
                  <AnimatedMessageBubble 
                    text=""
                    isUser={false}
                    showThinkingLoader={true}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <LinearGradient
                colors={['transparent', COLORS.background + 'E6', COLORS.background]}
                style={styles.inputGradient}
                pointerEvents="none"
              />
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Enter medicine name..."
                  placeholderTextColor={COLORS.gray}
                  style={styles.input}
                  multiline
                  maxLength={100}
                  returnKeyType="default"
                  blurOnSubmit={false}
                  editable={!isSending && !isTyping}
                  onFocus={() => {
                    setTimeout(() => scrollToBottom(true), 100);
                  }}
                />
                <TouchableOpacity 
                  style={[
                    styles.sendBtn, 
                    (!input.trim() || isSending || isTyping) && styles.sendBtnDisabled
                  ]} 
                  onPress={handleSend} 
                  disabled={isSending || !input.trim() || isTyping}
                  activeOpacity={0.7}
                >
                  {(isSending || isTyping) ? (
                    <LoadingDots />
                  ) : (
                    <Image
                      source={require('../../assets/navigation/send.png')}
                      style={[
                        styles.sendIcon,
                        { opacity: input.trim() ? 1 : 0.5 }
                      ]}
                      contentFit="contain"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
    paddingTop: 8,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
    marginBottom: 4,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  navigationCard: {
    alignSelf: 'flex-start',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: COLORS.blue,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  welcomeDisclaimer: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  msgRow: { 
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  msgLeft: {
    justifyContent: 'flex-start',
    maxWidth: '90%',
  },
  msgRight: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    maxWidth: '82%',
  },
  bubble: { 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  botBubble: { 
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  userBubble: { 
    backgroundColor: COLORS.blue,
    alignSelf: 'flex-end',
  },
  errorBubble: { 
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1
  },
  bubbleText: { 
    fontSize: 15.5, 
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  botText: { 
    color: COLORS.charcoal,
  },
  userText: { 
    color: COLORS.white,
  },
  boldText: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 3,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  input: { 
    flex: 1,
    color: COLORS.charcoal,
    fontSize: 15.5,
    lineHeight: 20,
    maxHeight: 80,
    paddingTop: 8,
    paddingBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  sendBtn: { 
    marginLeft: 8,
    backgroundColor: COLORS.blue,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { 
    backgroundColor: COLORS.lightGray,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
  },
  inputGradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
    zIndex: 2,
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: '100%',
  },
  medicineName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.blue,
    marginBottom: 6,
  },
  medicineComposition: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
  },
  infoValueBold: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
  },
  packSize: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: COLORS.darkGray,
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  interactionRow: {
    marginBottom: 8,
  },
  drugName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  warningBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
  },
  alternativeItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.darkGray,
    marginBottom: 4,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: 16,
    lineHeight: 16,
  },
});