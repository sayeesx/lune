import { useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { supabase } from '../../../lib/supabaseClient';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import useDoctor from '../../../src/hooks/useDoctor';

const COLORS = {
  white: '#FFFFFF',
  blue: '#2652F9',
  charcoal: '#100F15',
  gray: '#9199B1',
  lightGray: '#F7F7F8',
  background: '#F8F9FC',
  border: '#E5E7EB',
};

type Message = {
  id: string;
  chat_id: string;
  role: 'user' | 'doctor' | 'error';
  content: string;
  timestamp: string;
};

// ChatGPT-style Typing Indicator (3 bouncing dots)
const TypingIndicator = React.memo(() => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.typingIndicatorContainer}>
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
});

// Animated Loading Dots Component (for send button)
const LoadingDots = React.memo(() => {
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
});

// Animated Message Bubble Component - OPTIMIZED for smooth typing
interface AnimatedMessageBubbleProps {
  text: string;
  isUser?: boolean;
  isError?: boolean;
  showTypingIndicator?: boolean;
}

const AnimatedMessageBubble = React.memo(function AnimatedMessageBubble({
  text,
  isUser,
  isError,
  showTypingIndicator,
}: AnimatedMessageBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    // OPTIMIZE: Only animate once on mount, not during typing updates
    if (!hasAnimated.current && !showTypingIndicator) {
      hasAnimated.current = true;

      const animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      animation.start();
    } else if (!showTypingIndicator) {
      // Keep visible if already animated
      opacity.setValue(1);
      translateY.setValue(0);
    }
  }, [showTypingIndicator]);

  const animatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        isError ? styles.errorBubble : null,
        animatedStyle,
      ]}
    >
      {showTypingIndicator ? (
        <TypingIndicator />
      ) : (
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>{text}</Text>
      )}
    </Animated.View>
  );
});

export default function ChatHistoryView() {
  // State and refs
  const { id } = useLocalSearchParams();
  const { loading: apiLoading, sendMessage } = useDoctor();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);
  const typingMessageIdRef = useRef<string | null>(null);
  const messageIdCounterRef = useRef(0);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Effect for initial load
  useEffect(() => {
    fetchChatHistory();
    return () => {
      stopAutoScroll();
    };
  }, [id]);

  const generateUniqueId = useCallback((role: Message['role']) => {
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

  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    scrollIntervalRef.current = setInterval(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  // OPTIMIZE: Removed LayoutAnimation to prevent stutter
  const appendMessage = useCallback(
    (msg: Message) => {
      setMessages((m) => {
        if (m.some((existingMsg) => existingMsg.id === msg.id)) {
          msg.id = generateUniqueId(msg.role);
        }
        return [...m, msg];
      });

      if (msg.role === 'doctor') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      scrollToBottom(true);
    },
    [generateUniqueId, scrollToBottom]
  );

  const fetchChatHistory = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', id)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((messagesData as Message[]) || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || apiLoading || isTyping || isSending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSending(true);

    try {
      // Add user message
      const userMsg: Message = {
        id: generateUniqueId('user'),
        chat_id: (id as string) ?? '',
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      appendMessage(userMsg);
      setInput('');

      // Get chat history for context
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'doctor')
        .map((m) => ({ role: m.role, content: m.content }));

      startAutoScroll();

      // Send message and get response
      const res = await sendMessage(content, history);

      setIsSending(false);

      if (!res?.success) {
        setIsTyping(false);
        stopAutoScroll();
        throw new Error(res?.error || 'Failed to get response');
      }

      setIsTyping(true);

      const aiText = (res.data && (res.data as any).reply) || res.data || 'No response.';
      const doctorMsgId = await typeOutResponse(aiText);

      // Save messages to database
      await supabase.from('chat_messages').insert([
        userMsg,
        {
          id: doctorMsgId,
          chat_id: (id as string) ?? '',
          role: 'doctor',
          content: aiText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Send message error:', error);
      setIsTyping(false);
      setIsSending(false);
      stopAutoScroll();

      appendMessage({
        id: generateUniqueId('error'),
        chat_id: (id as string) ?? '',
        role: 'error',
        content: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const typeOutResponse = useCallback(
    async (text: string): Promise<string> => {
      return new Promise<string>((resolve) => {
        const msgId = generateUniqueId('doctor');
        typingMessageIdRef.current = msgId;
        let idx = 0;
        const chunkInterval = 12;
        let current = '';
        let timeoutId: NodeJS.Timeout;

        const step = () => {
          if (typingMessageIdRef.current !== msgId) {
            stopAutoScroll();
            resolve(msgId);
            return;
          }

          if (idx >= text.length) {
            setMessages((m) => {
              if (typingMessageIdRef.current !== msgId) return m;
              return [
                ...m,
                {
                  id: msgId,
                  chat_id: (id as string) ?? '',
                  role: 'doctor',
                  content: text,
                  timestamp: new Date().toISOString(),
                },
              ];
            });
            typingMessageIdRef.current = null;
            setIsTyping(false);
            stopAutoScroll();
            scrollToBottom(true);
            resolve(msgId);
            return;
          }

          current += text[idx++];

          // OPTIMIZE: Use functional update for smooth performance
          setMessages((m) => {
            if (typingMessageIdRef.current !== msgId) return m;
            const without = m.filter((x) => x.id !== msgId);
            return [
              ...without,
              {
                id: msgId,
                chat_id: (id as string) ?? '',
                role: 'doctor',
                content: current,
                timestamp: new Date().toISOString(),
              },
            ];
          });

          timeoutId = setTimeout(step, chunkInterval);
        };

        step();
      });
    },
    [generateUniqueId, stopAutoScroll, scrollToBottom, id]
  );

  // OPTIMIZE: Memoize renderMessage
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isUser = item.role === 'user';
      const isError = item.role === 'error';
      const isCurrentlyTyping = item.id === typingMessageIdRef.current && isTyping && !item.content;

      return (
        <View style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}>
          <AnimatedMessageBubble
            text={item.content}
            isUser={isUser}
            isError={isError}
            showTypingIndicator={isCurrentlyTyping}
          />
        </View>
      );
    },
    [isTyping]
  );

  const renderContent = () => {
    // Show loading state
    if (isLoading && messages.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
        </View>
      );
    }

    // Main content
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.navigationCard}>
                  <TouchableOpacity
                    style={styles.backButtonContainer}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require('../../../assets/navigation/left.png')}
                      style={styles.backIcon}
                      contentFit="contain"
                    />
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.historyButtonInline}
                    onPress={() => router.push('/(features)/ai-doctor')}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require('../../../assets/home-icons/chat.png')}
                      style={styles.historyIcon}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                extraData={typingMessageIdRef.current} // OPTIMIZED: Simplified extraData
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() => scrollToBottom(true)}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                // OPTIMIZE: Performance props
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
              />

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
                    placeholder="Continue chat..."
                    placeholderTextColor={COLORS.gray}
                    style={styles.input}
                    multiline
                    maxLength={500}
                    returnKeyType="default"
                    blurOnSubmit={false}
                    editable={!isSending}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollToBottom(true);
                      }, 100);
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      (!input.trim() || isSending || isTyping) && styles.sendBtnDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={isSending || isTyping || !input.trim()}
                    activeOpacity={0.7}
                  >
                    {isSending || isTyping ? (
                      <LoadingDots />
                    ) : (
                      <Image
                        source={require('../../../assets/navigation/send.png')}
                        style={[styles.sendIcon, { opacity: input.trim() ? 1 : 0.5 }]}
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
  };

  return renderContent();
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  navigationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'flex-start',
    width: 116,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  historyButtonInline: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  historyIcon: {
    width: 24,
    height: 24,
  },
  chatContainer: {
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
    maxWidth: '82%',
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
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 15.5,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  botText: {
    color: COLORS.charcoal,
    fontFamily: 'Inter-Regular',
  },
  userText: {
    color: COLORS.white,
    fontFamily: 'Inter-Regular',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  inputContainer: {
    backgroundColor: 'transparent',
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    color: COLORS.charcoal,
    fontSize: 15.5,
    lineHeight: 20,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    fontFamily: 'Inter-Regular',
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
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 3,
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
});
