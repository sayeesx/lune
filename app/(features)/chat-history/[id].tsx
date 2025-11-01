// app/(features)/chat-history/[id].tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
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
  View,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../lib/supabaseClient";
import useDoctor, { Message } from "../../../src/hooks/useDoctor";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

// Unified sizing across controls (match AIDoctor)
const CONTROL_HEIGHT = 48; // input, send/stop button, back/history pill, sent bubble
const CONTROL_RADIUS = CONTROL_HEIGHT / 2;

// Header placement (match AIDoctor)
const HEADER_TOP_OFFSET = Platform.OS === "ios" ? 36 : 40;
const LIST_TOP_INSET = HEADER_TOP_OFFSET + CONTROL_HEIGHT + 16;

// Page and bubble gradients (match AIDoctor)
const PAGE_GRADIENT = ["#e3eaff", "#ffffff"]; // top -> bottom
const USER_GRADIENT = ["#032EA6", "#2652F9"]; // darker for sent/user
const BOT_GRADIENT = ["rgba(3,46,166,0.06)", "rgba(38,82,249,0.10)"]; // lighter for response

const COLORS = {
  white: "#FFFFFF",
  blue: "#2652F9",
  deepBlue: "#032EA6",
  charcoal: "#100F15",
  gray: "#9199B1",
  lightGray: "#F7F7F8",
  darkGray: "#4A4A4D",
  background: "#F8F9FC",
  border: "#E5E7EB",
};

// Send button loader (same as AIDoctor)
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    const a1 = loop(dot1, 0);
    const a2 = loop(dot2, 200);
    const a3 = loop(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);
  const o1 = dot1.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const o2 = dot2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const o3 = dot3.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  return (
    <View style={styles.loadingDotsContainer}>
      <Animated.View style={[styles.dot, { opacity: o1 }]} />
      <Animated.View style={[styles.dot, { opacity: o2 }]} />
      <Animated.View style={[styles.dot, { opacity: o3 }]} />
    </View>
  );
};

// Minimal shimmer row for history drawer (match AIDoctor)
const ShimmerRow = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(anim, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-120, 120] });
  return (
    <View style={styles.skeletonRow}>
      <View style={styles.skeletonBlock}>
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
    </View>
  );
};

type ChatHistoryRow = { id: string; title: string | null; last_message: string | null; created_at: string; updated_at: string };

// History drawer (match AIDoctor gradient header and blending)
function ChatHistoryModal({
  visible,
  onClose,
  onSelectChat,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.85)).current;

  useEffect(() => {
    if (visible) {
      loadChatHistory();
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 10 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -screenWidth * 0.85, duration: 220, easing: Easing.in(Easing.ease), useNativeDriver: true }).start();
    }
  }, [visible]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("chat_history").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      setChatHistory(data || []);
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load chat history", position: "top", topOffset: 60 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.sidebarModalOverlay}>
        <TouchableOpacity style={styles.sidebarOverlayTouchable} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sidebarContent, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient colors={PAGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.sidebarGradientFull}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={[styles.sidebarHeader, { marginTop: HEADER_TOP_OFFSET - 8 }]}>
                <Text style={styles.sidebarTitle}>Chat History</Text>
                <TouchableOpacity onPress={onClose} style={styles.sidebarCloseBtn}>
                  <Image source={require("../../../assets/navigation/close.png")} style={styles.closeIcon} contentFit="contain" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={{ padding: 12 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ShimmerRow key={`skeleton-${i}`} />
                  ))}
                </View>
              ) : chatHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No chat history yet</Text>
                </View>
              ) : (
                <FlatList
                  data={chatHistory}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.sidebarChatItem}
                      onPress={() => {
                        onSelectChat(item.id);
                        onClose();
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.sidebarChatItemContent}>
                        <Text style={styles.sidebarChatTitle} numberOfLines={1}>
                          {item.title?.trim() || item.last_message?.trim() || "Untitled chat"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  style={{ backgroundColor: "transparent" }}
                  contentContainerStyle={styles.sidebarChatList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </SafeAreaView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Gradient message bubble (match AIDoctor)
function AnimatedMessageBubble({ text, isUser, isError }: { text: string; isUser?: boolean; isError?: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);
  if (isError) {
    return (
      <Animated.View style={[styles.bubbleOuter, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.bubbleGradient, styles.errorBubble]}>
          <Text style={[styles.bubbleText, styles.botText]}>{text}</Text>
        </View>
      </Animated.View>
    );
  }
  return (
    <Animated.View style={[styles.bubbleOuter, { opacity, transform: [{ translateY }] }]}>
      <LinearGradient
        colors={isUser ? USER_GRADIENT : BOT_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bubbleGradient, isUser ? styles.userBubble : styles.botBubble, isUser ? { minHeight: CONTROL_HEIGHT } : null]}
      >
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>{text}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function ChatHistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sendMessage } = useDoctor();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingMessageIdRef = useRef<string | null>(null);
  const typingRafRef = useRef<number | null>(null);
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
    }, 50);
  }, []);

  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
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

  const appendMessage = useCallback(
    (msg: Message) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((m) => {
        if (m.some((existing) => existing.id === msg.id)) msg.id = generateUniqueId(msg.role);
        return [...m, msg];
      });
      scrollToBottom(true);
    },
    [generateUniqueId, scrollToBottom]
  );

  const loadConversation = useCallback(async () => {
    try {
      const { data: rows, error } = await supabase
        .from("chat_messages")
        .select("role, content, timestamp")
        .eq("chat_id", id)
        .order("timestamp", { ascending: true });
      if (error) throw error;
      const mapped: Message[] = (rows || []).map((r, idx) => ({
        id: `loaded-${idx}-${Date.now()}`,
        role: r.role,
        content: r.content,
        timestamp: r.timestamp,
      })) as Message[];
      setMessages(mapped);
      scrollToBottom(false);
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load conversation", position: "top", topOffset: 60 });
    }
  }, [id, scrollToBottom]);

  useEffect(() => {
    loadConversation();
    return () => {
      stopAutoScroll();
      if (typingRafRef.current) cancelAnimationFrame(typingRafRef.current);
    };
  }, [loadConversation]);

  const persistAssistant = async (finalText: string) => {
    try {
      await supabase.from("chat_messages").insert({
        chat_id: id,
        role: "doctor",
        content: finalText,
        timestamp: new Date().toISOString(),
      });
      await supabase.from("chat_history").update({ last_message: finalText, updated_at: new Date().toISOString() }).eq("id", id);
    } catch {}
  };

  // Smooth, high‑FPS streaming like AIDoctor
  const smoothStreamAI = (text: string) =>
    new Promise<void>((resolve) => {
      const idLocal = generateUniqueId("bot");
      typingMessageIdRef.current = idLocal;
      setIsTyping(true);
      let idx = 0;
      let lastTs = 0;
      let carry = 0;
      const cps = 90;

      const frame = async (ts: number) => {
        if (typingMessageIdRef.current !== idLocal) {
          resolve();
          return;
        }
        if (!lastTs) lastTs = ts;
        const dt = ts - lastTs;
        lastTs = ts;

        carry += (cps / 1000) * dt;
        let n = Math.max(1, Math.floor(carry));
        if (n > 0) carry -= n;

        const nextIdx = Math.min(text.length, idx + n);
        idx = nextIdx;
        const current = text.slice(0, idx);

        setMessages((m) => {
          const without = m.filter((x) => x.id !== idLocal);
          return [...without, { id: idLocal, role: "doctor", content: current, timestamp: new Date().toISOString() } as Message];
        });

        if (idx >= text.length) {
          await persistAssistant(text);
          typingMessageIdRef.current = null;
          setIsTyping(false);
          stopAutoScroll();
          scrollToBottom(true);
          resolve();
          return;
        }
        typingRafRef.current = requestAnimationFrame(frame);
      };

      startAutoScroll();
      typingRafRef.current = requestAnimationFrame(frame);
    });

  const stopStreaming = async () => {
    if (typingRafRef.current) {
      cancelAnimationFrame(typingRafRef.current);
      typingRafRef.current = null;
    }
    const last = [...messages].reverse().find((m) => m.role === "doctor");
    if (last) await persistAssistant(last.content);
    typingMessageIdRef.current = null;
    setIsTyping(false);
    stopAutoScroll();
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isSending || isTyping) return;

    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = { id: generateUniqueId("user"), role: "user", content, timestamp: new Date().toISOString() };
    appendMessage(userMsg);
    setInput("");

    try {
      await supabase.from("chat_messages").insert({ chat_id: id, role: "user", content, timestamp: new Date().toISOString() });
    } catch {}

    const history = messages.filter((m) => m.role === "user" || m.role === "doctor").map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await sendMessage(content, history);
      setIsSending(false);
      if (!res || !res.success) {
        appendMessage({ id: generateUniqueId("error"), role: "error", content: res?.error || "Failed to get response", timestamp: new Date().toISOString() } as Message);
        return;
      }
      const aiRaw = (res.data && (res.data as any).reply) || res.data || "No response.";
      const aiText = typeof aiRaw === "string" ? aiRaw : JSON.stringify(aiRaw);
      await smoothStreamAI(aiText);
    } catch (e) {
      setIsTyping(false);
      setIsSending(false);
      appendMessage({ id: generateUniqueId("error"), role: "error", content: "An unexpected error occurred", timestamp: new Date().toISOString() } as Message);
    }
  };

  const goBackToAIDoctor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(features)/ai-doctor");
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    const isError = item.role === "error";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRight : styles.msgLeft]}>
        <AnimatedMessageBubble text={item.content} isUser={isUser} isError={isError} />
      </View>
    );
  };

  const hasInput = input.trim().length > 0;

  return (
    <>
      <StatusBar style="dark" />
      <LinearGradient colors={PAGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Header (absolute overlay, unified height, exact like AIDoctor) */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.navigationCard}>
                  <TouchableOpacity style={styles.backButtonContainer} onPress={goBackToAIDoctor} activeOpacity={0.7}>
                    <Image source={require("../../../assets/navigation/left.png")} style={styles.backIcon} contentFit="contain" />
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
                    <Image source={require("../../../assets/home-icons/previouschat.png")} style={styles.historyIcon} contentFit="contain" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* History drawer (gradient header, shimmer) */}
            <ChatHistoryModal
              visible={showHistory}
              onClose={() => setShowHistory(false)}
              onSelectChat={(chatId) => {
                setShowHistory(false);
                router.replace(`/(features)/chat-history/${chatId}`);
              }}
            />

            {/* Messages + input (match AIDoctor) */}
            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
            >
              <View style={styles.chatContainer}>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={[styles.listContent, { paddingTop: LIST_TOP_INSET }]}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => scrollToBottom(true)}
                  keyboardDismissMode="interactive"
                  keyboardShouldPersistTaps="handled"
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={async () => {
                        setRefreshing(true);
                        await loadConversation();
                        setRefreshing(false);
                      }}
                      tintColor={COLORS.blue}
                      colors={[COLORS.blue]}
                      progressBackgroundColor={COLORS.white}
                    />
                  }
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
                    multiline={false}
                    maxLength={500}
                    returnKeyType="default"
                    blurOnSubmit={false}
                    editable
                    onFocus={() => setTimeout(() => scrollToBottom(true), 100)}
                  />

                  {isTyping ? (
                    <TouchableOpacity style={styles.sendBtnBase} onPress={stopStreaming} activeOpacity={0.85} accessibilityLabel="Stop generating">
                      <LinearGradient colors={USER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtnFill}>
                        <MaterialCommunityIcons name="stop" size={20} color={COLORS.white} />
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.sendBtnBase}
                      onPress={handleSend}
                      disabled={isSending || !hasInput}
                      activeOpacity={0.85}
                    >
                      {isSending || hasInput ? (
                        <LinearGradient colors={USER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtnFill}>
                          {isSending ? (
                            <LoadingDots />
                          ) : (
                            <Image source={require("../../../assets/navigation/send.png")} style={[styles.sendIcon, { tintColor: COLORS.white }]} contentFit="contain" />
                          )}
                        </LinearGradient>
                      ) : (
                        <View style={[styles.sendBtnFill, styles.sendBtnWhiteFill]}>
                          <Image source={require("../../../assets/navigation/send.png")} style={[styles.sendIcon, { tintColor: COLORS.blue }]} contentFit="contain" />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  // Theme containers (transparent to show page gradient)
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, backgroundColor: "transparent", position: "relative" },

  // Header: absolute overlay like AIDoctor
  header: {
    position: "absolute",
    top: HEADER_TOP_OFFSET,
    left: 12,
    right: 12,
    backgroundColor: "transparent",
    zIndex: 20,
  },
  headerContent: { paddingHorizontal: 0 },
  navigationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: CONTROL_RADIUS,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
    width: undefined,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: CONTROL_HEIGHT,
  },
  backButtonContainer: { width: CONTROL_HEIGHT - 8, height: CONTROL_HEIGHT - 8, borderRadius: (CONTROL_HEIGHT - 8) / 2, alignItems: "center", justifyContent: "center" },
  backIcon: { width: 20, height: 20 },
  divider: { width: 1, height: CONTROL_HEIGHT - 16, backgroundColor: COLORS.border, marginHorizontal: 8 },
  historyButtonInline: { width: CONTROL_HEIGHT - 8, height: CONTROL_HEIGHT - 8, borderRadius: (CONTROL_HEIGHT - 8) / 2, alignItems: "center", justifyContent: "center" },
  historyIcon: { width: 20, height: 20 },

  // Sidebar (full gradient; transparent rows; shifted header like AIDoctor)
  sidebarModalOverlay: { flex: 1, flexDirection: "row" },
  sidebarOverlayTouchable: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  sidebarContent: {
    width: screenWidth * 0.85,
    maxWidth: 320,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "transparent",
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  sidebarGradientFull: { flex: 1 },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sidebarTitle: { fontSize: 18, color: COLORS.charcoal, fontFamily: "Inter-SemiBold" },
  sidebarCloseBtn: { width: CONTROL_HEIGHT, height: CONTROL_HEIGHT, borderRadius: CONTROL_RADIUS, alignItems: "center", justifyContent: "center" },
  closeIcon: { width: 22, height: 22 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 16, color: COLORS.gray, fontFamily: "Inter-Regular" },
  sidebarChatList: { paddingTop: 8, paddingBottom: 12 },
  sidebarChatItem: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(16,15,21,0.08)",
  },
  sidebarChatItemContent: { flex: 1 },
  sidebarChatTitle: { fontSize: 15, color: COLORS.charcoal, fontFamily: "Inter-Medium" },

  // Chat area
  keyboardView: { flex: 1, backgroundColor: "transparent" },
  chatContainer: { flex: 1, position: "relative", backgroundColor: "transparent" },

  // List spacing (first row starts below header pill)
  listContent: { paddingHorizontal: 12, paddingBottom: 16, flexGrow: 1 },

  // Message rows
  msgRow: { marginVertical: 6, flexDirection: "row", alignItems: "flex-end" },
  msgLeft: { justifyContent: "flex-start", maxWidth: "82%" },
  msgRight: { justifyContent: "flex-end", alignSelf: "flex-end", maxWidth: "82%" },

  // Gradient bubbles (match AIDoctor)
  bubbleOuter: { borderRadius: CONTROL_RADIUS },
  bubbleGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CONTROL_RADIUS,
    justifyContent: "center",
  },
  botBubble: { alignSelf: "flex-start" },
  userBubble: { alignSelf: "flex-end", minHeight: CONTROL_HEIGHT },
  errorBubble: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", borderWidth: 1, borderRadius: CONTROL_RADIUS },
  bubbleText: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontFamily: "Inter-Regular" },
  botText: { color: COLORS.charcoal },
  userText: { color: COLORS.white },

  // Input bar (bordered-only, white fill inside field; send/stop button unified height)
  inputContainer: {
    backgroundColor: "transparent",
    position: "relative",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 14,
    zIndex: 1,
  },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "transparent" },
  input: {
    flex: 1,
    color: COLORS.charcoal,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: CONTROL_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 0,
    height: CONTROL_HEIGHT,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Inter-Regular",
  },
  sendBtnBase: {
    marginLeft: 8,
    width: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: CONTROL_RADIUS,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  sendBtnFill: {
    width: "100%",
    height: "100%",
    borderRadius: CONTROL_RADIUS,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnWhiteFill: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  sendIcon: { width: 18, height: 18 },

  // Send loader dots
  loadingDotsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white, marginHorizontal: 3 },

  // Shimmer blocks (shared)
  skeletonRow: { height: 44, justifyContent: "center", paddingHorizontal: 16, marginBottom: 8 },
  skeletonBlock: { height: 16, borderRadius: 8, backgroundColor: "#ECEFF3", overflow: "hidden" },
  skeletonShimmer: { position: "absolute", top: 0, bottom: 0, width: 120, backgroundColor: "rgba(255,255,255,0.75)" },
});
