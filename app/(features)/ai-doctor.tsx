import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabaseClient';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import useDoctor, { Message } from '../../src/hooks/useDoctor';


// LayoutAnimation: removed call to UIManager.setLayoutAnimationEnabledExperimental
// because in the New Architecture this is a no-op and emits a warning. If you
// need animation, use LayoutAnimation APIs directly or enable it conditionally
// for older architectures.


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


// Animated Split Text Component (React Native version)
interface SplitTextAnimatedProps {
  text: string;
  delay?: number;
  duration?: number;
  style?: any;
}

const SplitTextAnimated: React.FC<SplitTextAnimatedProps> = ({
  text,
  delay = 50,
  duration = 600,
  style
}) => {
  const [animations] = useState(() =>
    text.split('').map(() => new Animated.Value(0))
  );

  useEffect(() => {
    const animationSequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay: index * delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.stagger(0, animationSequence).start();
  }, [text]);

  return (
    <View style={styles.splitTextContainer}>
      {text.split('').map((char, index) => {
        const opacity = animations[index];
        const translateY = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        return (
          <Animated.Text
            key={`${char}-${index}`}
            style={[
              style,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            {char === ' ' ? '\u00A0' : char}
          </Animated.Text>
        );
      })}
    </View>
  );
};


// ChatGPT-style Typing Indicator (3 bouncing dots)
const TypingIndicator = () => {
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
      <Animated.View
        style={[
          styles.typingDot,
          { transform: [{ translateY: dot1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.typingDot,
          { transform: [{ translateY: dot2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.typingDot,
          { transform: [{ translateY: dot3 }] },
        ]}
      />
    </View>
  );
};


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


const STORAGE_KEY = '@lune_ai_doctor_messages';
const PAGE_SIZE = 20;


interface ChatHistory {
  id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
}


// Save Chat Confirmation Modal
function SaveChatModal({ visible, onClose, onSave, onDiscard, isSaving }: {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.saveChatModalOverlay}>
        <Animated.View
          style={[
            styles.saveChatModalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.saveChatModalTitle}>Save this conversation?</Text>
          <Text style={styles.saveChatModalMessage}>
            Would you like to save this chat for later? You can access it from your chat history.
          </Text>

          <View style={styles.saveChatModalButtons}>
            <TouchableOpacity
              style={styles.saveChatModalBtnSecondary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDiscard();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.saveChatModalBtnSecondaryText}>{'Don\u2019t Save'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveChatModalBtnPrimary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSave();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.saveChatModalBtnPrimaryText}>Save Chat</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}


// Chat History Sidebar (Slides from Left)
function ChatHistoryModal({ visible, onClose, onSelectChat }: {
  visible: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.85)).current;


  useEffect(() => {
    if (visible) {
      loadChatHistory();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth * 0.85,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);


  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('updated_at', { ascending: false });


      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load chat history',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.sidebarModalOverlay}>
        <TouchableOpacity 
          style={styles.sidebarOverlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.sidebarContent,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.background, COLORS.white]}
            style={styles.sidebarGradient}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Chat History</Text>
              <TouchableOpacity onPress={onClose} style={styles.sidebarCloseBtn}>
                <Image
                  source={require('../../assets/navigation/close.png')}
                  style={styles.closeIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>


            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.blue} />
              </View>
            ) : chatHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chat history yet</Text>
              </View>
            ) : (
              <FlatList
                data={chatHistory}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.sidebarChatItem}
                    onPress={() => {
                      onSelectChat(item.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sidebarChatItemContent}>
                      <Text style={styles.sidebarChatTitle} numberOfLines={1}>
                        {item.title || `Chat ${chatHistory.length - index}`}
                      </Text>
                      <Text style={styles.sidebarChatPreview} numberOfLines={2}>
                        {item.last_message}
                      </Text>
                      <Text style={styles.sidebarChatDate}>
                        {new Date(item.updated_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.sidebarChatList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Welcome Screen Component with Animated Username
function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get the first part of email before @ as username
        const emailUsername = user.email?.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        const displayName = emailUsername ? 
          emailUsername
            .split(/[._]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ') : 
          'User';
        setUsername(displayName);
      } else {
        setUsername('User');
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setUsername('User');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.welcomeContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.welcomeContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <SplitTextAnimated
        text={`Hello ${username}`}
        delay={50}
        duration={600}
        style={styles.welcomeTitle}
      />
      <Text style={styles.welcomeDisclaimer}>
        This is AI-assisted medical guidance provided for informational purposes only. 
        It is not a substitute for professional medical advice. For an official diagnosis 
        or treatment, please consult a licensed healthcare provider in person.
      </Text>
    </Animated.View>
  );
}


export default function AIDoctorScreen() {
  const { loading, sendMessage } = useDoctor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingMessageIdRef = useRef<string | null>(null);
  const messageIdCounterRef = useRef(0);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);


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


  const appendMessage = useCallback((msg: Message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((m) => {
      if (m.some(existingMsg => existingMsg.id === msg.id)) {
        msg.id = generateUniqueId(msg.role);
      }
      return [...m, msg];
    });
    
    if (msg.role === 'doctor') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    scrollToBottom(true);
  }, [generateUniqueId, scrollToBottom]);


  const handleBackPress = useCallback(() => {
    if (messages.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowSaveModal(true);
    } else {
      router.back();
    }
  }, [messages.length]);


  const saveChatToDatabase = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'You must be logged in to save chats',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New Chat';
      const lastMessage = messages[messages.length - 1]?.content || '';

      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          title: firstUserMessage.substring(0, 50),
          last_message: lastMessage.substring(0, 200),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (chatError) {
        console.error('Error creating chat history:', chatError);
        throw chatError;
      }

      const messageInserts = messages.map(msg => ({
        chat_id: chatData.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString()
      }));

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(messageInserts);

      if (messagesError) {
        console.error('Error saving messages:', messagesError);
        throw messagesError;
      }

      Toast.show({
        type: 'success',
        text1: 'Chat Saved',
        text2: 'Your conversation has been saved successfully',
        position: 'top',
        topOffset: 60,
      });

      await AsyncStorage.removeItem(STORAGE_KEY);
      setShowSaveModal(false);
      router.back();
    } catch (error: any) {
      console.error('Error saving chat:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save chat',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const discardChat = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    router.back();
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending || isTyping) return;
    
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMsg: Message = {
      id: generateUniqueId('user'),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    appendMessage(userMsg);
    setInput('');

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'doctor')
      .map((m) => ({ role: m.role, content: m.content }));

    startAutoScroll();

    try {
      const res = await sendMessage(content, history);

      setIsSending(false);

      if (!res || !res.success) {
        setIsTyping(false);
        stopAutoScroll();
        appendMessage({ 
          id: generateUniqueId('error'), 
          role: 'error', 
          content: res?.error || 'Failed to get response', 
          timestamp: new Date().toISOString() 
        });
        return;
      }

      setIsTyping(true);

      const aiRaw = (res.data && (res.data as any).reply) || res.data || 'No response.';
      const aiText = typeof aiRaw === 'string' ? aiRaw : JSON.stringify(aiRaw);

      await typeOutAI(aiText);
    } catch (error) {
      console.error('Send message error:', error);
      setIsTyping(false);
      setIsSending(false);
      stopAutoScroll();
      
      appendMessage({ 
        id: generateUniqueId('error'), 
        role: 'error', 
        content: 'An unexpected error occurred', 
        timestamp: new Date().toISOString() 
      });
    }
  };


  const typeOutAI = (text: string) => {
    return new Promise<void>((resolve) => {
      const id = generateUniqueId('bot');
      typingMessageIdRef.current = id;
      
      let idx = 0;
      const chunkInterval = 12;
      let current = '';
      let timeoutId: NodeJS.Timeout;


      const step = () => {
        if (typingMessageIdRef.current !== id) {
          stopAutoScroll();
          resolve();
          return;
        }


        if (idx >= text.length) {
          setMessages((m) => {
            if (typingMessageIdRef.current !== id) return m;
            
            return [...m, { 
              id, 
              role: 'doctor', 
              content: text, 
              timestamp: new Date().toISOString() 
            }];
          });
          typingMessageIdRef.current = null;
          
          setIsTyping(false);
          stopAutoScroll();
          scrollToBottom(true);
          resolve();
          return;
        }
        
        current += text[idx++];
        
        setMessages((m) => {
          if (typingMessageIdRef.current !== id) return m;
          
          const without = m.filter((x) => x.id !== id);
          return [...without, { 
            id, 
            role: 'doctor', 
            content: current, 
            timestamp: new Date().toISOString() 
          }];
        });
        
        timeoutId = setTimeout(step, chunkInterval);
      };


      step();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        stopAutoScroll();
      };
    });
  };


  useEffect(() => {
    const initializeFreshChat = async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    };
    
    initializeFreshChat();
    
    return () => {
      stopAutoScroll();
    };
  }, []);


  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(err => 
        console.error('Error saving messages:', err)
      );
    }
  }, [messages]);


  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages(page + 1);
    setRefreshing(false);
  };


  const loadMessages = async (pageNum = 1) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allMessages = JSON.parse(stored) as Message[];
        const start = Math.max(0, allMessages.length - (pageNum * PAGE_SIZE));
        const end = allMessages.length;
        const pagedMessages = allMessages.slice(start, end);
        setMessages(pagedMessages);
        setPage(pageNum);
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'error';
    // FIXED: Check if this specific message is currently being typed
    const isCurrentlyTyping = item.id === typingMessageIdRef.current && isTyping && !item.content;
    
    return (
      <View 
        style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}
      >
        <AnimatedMessageBubble 
          key={`${item.id}-${index}-bubble`}
          text={item.content} 
          isUser={isUser} 
          isError={isError}
          showTypingIndicator={isCurrentlyTyping} // FIXED: Pass typing indicator flag
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
                <TouchableOpacity 
                  style={styles.backButtonContainer} 
                  onPress={handleBackPress}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../assets/navigation/left.png')}
                    style={styles.backIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                
                <View style={styles.divider} />
                
                <TouchableOpacity
                  style={styles.historyButtonInline}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowHistory(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../assets/home-icons/previouschat.png')}
                    style={styles.historyIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>


          <SaveChatModal
            visible={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={saveChatToDatabase}
            onDiscard={() => {
              setShowSaveModal(false);
              router.back();
            }}
            isSaving={isSaving}
          />


          <ChatHistoryModal
            visible={showHistory}
            onClose={() => setShowHistory(false)}
            onSelectChat={async (chatId) => {
              setShowHistory(false);
              router.push(`/(features)/chat-history/${chatId}`);
            }}
          />


          <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.chatContainer}>
              {messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={renderItem}
                  extraData={[messages.length, isTyping, typingMessageIdRef.current]}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      tintColor={COLORS.blue}
                      colors={[COLORS.blue]}
                      progressBackgroundColor={COLORS.white}
                    />
                  }
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardDismissMode="interactive"
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() => scrollToBottom(true)}
                />
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
                  placeholder="Message AI Doctor..."
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
                    (!input.trim() || isSending || isTyping) && styles.sendBtnDisabled
                  ]} 
                  onPress={() => handleSend()} 
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


interface AnimatedMessageBubbleProps {
  text: string;
  isUser?: boolean;
  isError?: boolean;
  showTypingIndicator?: boolean; // FIXED: New prop
}


function AnimatedMessageBubble({ text, isUser, isError, showTypingIndicator }: AnimatedMessageBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;


  useEffect(() => {
    const animation = Animated.parallel([
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
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);


  const animatedStyle = {
    opacity,
    transform: [{ translateY }]
  };


  return (
    <Animated.View 
      style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.botBubble, 
        isError ? styles.errorBubble : null, 
        animatedStyle
      ]}
    >
      {/* FIXED: Show typing indicator INSIDE bubble when waiting for first character */}
      {showTypingIndicator ? (
        <TypingIndicator />
      ) : (
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
          {text}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splitTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveChatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  saveChatModalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  saveChatModalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },
  saveChatModalMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  saveChatModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveChatModalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveChatModalBtnSecondaryText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.charcoal,
  },
  saveChatModalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveChatModalBtnPrimaryText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  saveChatModalBtnDisabled: {
    opacity: 0.7,
  },
  loaderInChat: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ChatGPT-style typing indicator styles
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // FIXED: Align left inside bubble
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 3,
  },
  sidebarModalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarOverlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContent: {
    width: screenWidth * 0.85,
    maxWidth: 320,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: COLORS.white,
  },
  sidebarGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sidebarTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
  },
  sidebarCloseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
  },
  sidebarChatList: {
    paddingTop: 8,
  },
  sidebarChatItem: {
    marginBottom: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sidebarChatItemContent: {
    flex: 1,
  },
  sidebarChatTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  sidebarChatPreview: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    marginBottom: 4,
    lineHeight: 18,
    opacity: 0.8,
  },
  sidebarChatDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    opacity: 0.7,
  },
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
    opacity: 0.8,
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    letterSpacing: -0.5,
  },
  welcomeDisclaimer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginTop: 20,
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  topFadeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 5,
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
    maxHeight: 100,
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
});
