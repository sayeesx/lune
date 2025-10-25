import { router } from 'expo-router';
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

export default function ChatHistoryScreen() {
  const { loading: apiLoading, sendMessage } = useDoctor();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<Array<{ id: string; title: string }>>([]);
  const [showChatList, setShowChatList] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingMessageIdRef = useRef<string | null>(null);
  const messageIdCounterRef = useRef(0);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChatList();
  }, []);

  const loadChatList = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('id, title')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChatList(data || []);
    } catch (error) {
      console.error('Error loading chat list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (chatId: string) => {
    setLoading(true);
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('title')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;
      setChatTitle(chatData.title);

      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData);
      setActiveChatId(chatId);
      setShowChatList(false);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSend = async () => {
    const content = input.trim();
    if (!content || apiLoading) return;
    
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMsg: Message = {
      id: generateUniqueId('user'),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      chat_id: activeChatId || '',
    };
    appendMessage(userMsg);
    setInput('');

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'doctor')
      .map((m) => ({ role: m.role, content: m.content }));

    setIsTyping(true);
    startAutoScroll();

    try {
      const res = await sendMessage(content, history);
      setIsTyping(false);
      setLoading(false);

      if (!res || !res.success) {
        stopAutoScroll();
        appendMessage({ 
          id: generateUniqueId('error'),
          role: 'error',
          content: res?.error || 'Failed to get response',
          timestamp: new Date().toISOString(),
          chat_id: activeChatId || '',
        });
        return;
      }

      const aiText = (res.data && (res.data as any).reply) || res.data || 'No response.';
      await typeOutResponse(aiText);
    } catch (error) {
      console.error('Send message error:', error);
      setIsTyping(false);
      stopAutoScroll();
      setLoading(false);
      
      appendMessage({ 
        id: generateUniqueId('error'),
        role: 'error',
        content: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        chat_id: activeChatId || '',
      });
    }
  };

  const typeOutResponse = async (text: string) => {
    return new Promise<void>((resolve) => {
      const id = generateUniqueId('doctor');
      typingMessageIdRef.current = id;
      let idx = 0;
      const chunkInterval = 12;
      let current = '';

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
              timestamp: new Date().toISOString(),
              chat_id: activeChatId || '',
            }];
          });
          typingMessageIdRef.current = null;
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
            timestamp: new Date().toISOString(),
            chat_id: activeChatId || '',
          }];
        });
        
        setTimeout(step, chunkInterval);
      };

      step();
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'error';
    const isCurrentlyTyping = item.id === typingMessageIdRef.current && isTyping;

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}>
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          isError && styles.errorBubble
        ]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
            {item.content}
          </Text>
        </View>
        {isCurrentlyTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={COLORS.blue} />
          </View>
        )}
      </View>
    );
  };

  const renderChatListItem = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
      style={styles.chatListItem}
      onPress={() => loadChatHistory(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={require('../../../assets/home-icons/chat.png')}
        style={styles.chatIcon}
        contentFit="contain"
      />
      <Text style={styles.chatTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !activeChatId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

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
                  onPress={() => {
                    if (showChatList) {
                      router.replace('/(features)/ai-doctor');
                    } else {
                      setShowChatList(true);
                      setActiveChatId(null);
                      setMessages([]);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../../assets/navigation/left.png')}
                    style={styles.backIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {showChatList ? 'Chat History' : chatTitle}
                </Text>
              </View>
            </View>
          </View>

          {showChatList ? (
            <FlatList
              data={chatList}
              renderItem={renderChatListItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatListContainer}
            />
          ) : (
            <KeyboardAvoidingView 
              style={styles.keyboardView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() => scrollToBottom(true)}
                showsVerticalScrollIndicator={false}
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
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.sendButton,
                      (!input.trim() || loading) && styles.sendButtonDisabled
                    ]} 
                    onPress={handleSend}
                    disabled={loading || !input.trim()}
                    activeOpacity={0.7}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Image
                        source={require('../../../assets/navigation/send.png')}
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

              <TouchableOpacity
                style={styles.newChatButton}
                onPress={() => router.replace('/(features)/ai-doctor')}
                activeOpacity={0.7}
              >
                <View style={styles.newChatButtonContent}>
                  <Image
                    source={require('../../../assets/home-icons/chat.png')}
                    style={styles.newChatIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.newChatText}>Start New Chat</Text>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          )}
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
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.charcoal,
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  chatListContainer: {
    padding: 16,
  },
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 100,
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
  inputContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputGradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: COLORS.charcoal,
    fontFamily: 'Inter-Regular',
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
  },
  newChatButton: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: COLORS.blue,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  newChatButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
    marginRight: 8,
  },
  newChatText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  typingIndicator: {
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
});