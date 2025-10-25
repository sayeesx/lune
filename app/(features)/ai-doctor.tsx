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
import RoundBackButton from '../../components/navigation/RoundBackButton';
import useDoctor, { Message } from '../../src/hooks/useDoctor';


// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


const { width: screenWidth } = Dimensions.get('window');


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


// Animated Loading Dots Component
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<any>(null);


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

    animationRef.current = { anim1, anim2, anim3 };

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


function ChatHistoryModal({ visible, onClose, onSelectChat }: {
  visible: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (visible) {
      loadChatHistory();
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
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat History</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
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
                  style={styles.chatHistoryItem}
                  onPress={() => {
                    onSelectChat(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.chatHistoryStack}>
                    <LinearGradient
                      colors={[COLORS.blue + '20', COLORS.blue + '05']}
                      style={[styles.stackBg, { top: Math.min(index * 2, 6) }]}
                    />
                    <View style={styles.chatHistoryContent}>
                      <Text style={styles.chatHistoryTitle} numberOfLines={1}>
                        {item.title || `Chat ${chatHistory.length - index}`}
                      </Text>
                      <Text style={styles.chatHistoryPreview} numberOfLines={2}>
                        {item.last_message}
                      </Text>
                      <Text style={styles.chatHistoryDate}>
                        {new Date(item.updated_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.chatHistoryList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
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
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingMessageIdRef = useRef<string | null>(null);
  const messageIdCounterRef = useRef(0);


  const generateUniqueId = useCallback((role: string) => {
    const timestamp = Date.now();
    const counter = messageIdCounterRef.current++;
    const randomId = Math.random().toString(36).slice(2, 9);
    return `${role}-${timestamp}-${counter}-${randomId}`;
  }, []);


  const appendMessage = useCallback((msg: Message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((m) => {
      // Ensure unique ID
      if (m.some(existingMsg => existingMsg.id === msg.id)) {
        msg.id = generateUniqueId(msg.role);
      }
      return [...m, msg];
    });
    
    if (msg.role === 'doctor') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [generateUniqueId]);


  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    
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


    const placeholderId = generateUniqueId('bot-placeholder');
    const typingMsg: Message = { 
      id: placeholderId, 
      role: 'doctor', 
      content: '…', 
      timestamp: new Date().toISOString() 
    };
    appendMessage(typingMsg);
    setIsTyping(true);
    typingMessageIdRef.current = placeholderId;


    try {
      const res = await sendMessage(content, history);

      setMessages((m) => m.filter((x) => x.id !== placeholderId));
      setIsTyping(false);
      typingMessageIdRef.current = null;

      if (!res || !res.success) {
        appendMessage({ 
          id: generateUniqueId('error'), 
          role: 'error', 
          content: res?.error || 'Failed to get response', 
          timestamp: new Date().toISOString() 
        });
        return;
      }

      const aiRaw = (res.data && (res.data as any).reply) || res.data || 'No response.';
      const aiText = typeof aiRaw === 'string' ? aiRaw : JSON.stringify(aiRaw);

      await typeOutAI(aiText);
    } catch (error) {
      console.error('Send message error:', error);
      setMessages((m) => m.filter((x) => x.id !== placeholderId));
      setIsTyping(false);
      typingMessageIdRef.current = null;
      
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
        // Check if this typing session was cancelled
        if (typingMessageIdRef.current !== id) {
          resolve();
          return;
        }


        if (idx >= text.length) {
          // Final update with complete text
          setMessages((m) => {
            if (typingMessageIdRef.current !== id) return m;
            
            const without = m.filter((x) => x.id !== id);
            return [...without, { 
              id, 
              role: 'doctor', 
              content: text, 
              timestamp: new Date().toISOString() 
            }];
          });
          typingMessageIdRef.current = null;
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

      // Cleanup function
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    });
  };


  useEffect(() => {
    loadMessages();
  }, []);


  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(err => 
        console.error('Error saving messages:', err)
      );
    }
  }, [messages]);


  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length]);


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


  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages(page + 1);
    setRefreshing(false);
  };


  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'error';
    
    return (
      <View 
        style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}
      >
        <AnimatedMessageBubble 
          key={`${item.id}-${index}-bubble`}
          text={item.content} 
          isUser={isUser} 
          isError={isError}
        />
      </View>
    );
  };


  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <LinearGradient
            colors={[COLORS.blue + '15', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.navigationStack}>
                <RoundBackButton />
                <TouchableOpacity
                  style={styles.historyButton}
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


          <ChatHistoryModal
            visible={showHistory}
            onClose={() => setShowHistory(false)}
            onSelectChat={async (chatId) => {
              // TODO: Load messages from selected chat
              console.log('Loading chat:', chatId);
            }}
          />


          <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.chatContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={renderItem}
                extraData={messages.length}
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
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
              
              {/* Smooth top fade gradient */}
              <LinearGradient
                colors={[COLORS.background, 'transparent']}
                style={styles.topFadeGradient}
                pointerEvents="none"
              />
            </View>


            <View style={styles.inputContainer}>
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
                  editable={!loading}
                  onFocus={() => {
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
                <TouchableOpacity 
                  style={[
                    styles.sendBtn, 
                    (!input.trim() || loading) && styles.sendBtnDisabled
                  ]} 
                  onPress={() => handleSend()} 
                  disabled={loading || !input.trim()}
                  activeOpacity={0.7}
                >
                  {loading ? (
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
}


function AnimatedMessageBubble({ text, isUser, isError }: AnimatedMessageBubbleProps) {
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
      <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
        {text}
      </Text>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
  },
  modalCloseBtn: {
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
  chatHistoryList: {
    padding: 16,
  },
  chatHistoryItem: {
    marginBottom: 12,
  },
  chatHistoryStack: {
    position: 'relative',
    marginHorizontal: 4,
  },
  stackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: 16,
    opacity: 0.5,
  },
  chatHistoryContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chatHistoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  chatHistoryPreview: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  chatHistoryDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.blue,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  navigationStack: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIcon: {
    width: 22,
    height: 22,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
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
    height: 60,
    zIndex: 5,
  },
  msgRow: { 
    marginVertical: 6,
    flexDirection: 'row',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  botBubble: { 
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
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
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
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
});
