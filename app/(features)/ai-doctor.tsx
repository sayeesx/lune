// app/(features)/aidoctor.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as Crypto from "expo-crypto";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { supabase } from "../../lib/supabaseClient";
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
  type DimensionValue,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Local message type
type Message = {
  id: string;
  role: "user" | "doctor" | "error";
  content: string;
  timestamp: string;
};

const { width: screenWidth } = Dimensions.get("window");

// Unified sizing across controls (unchanged)
const CONTROL_HEIGHT = 48;
const CONTROL_RADIUS = CONTROL_HEIGHT / 2;

// Header placement (unchanged)
const HEADER_TOP_OFFSET = Platform.OS === "ios" ? 36 : 40;
const LIST_TOP_INSET = HEADER_TOP_OFFSET + CONTROL_HEIGHT + 16;

// Gradients (unchanged)
const PAGE_GRADIENT = ["#e3eaff", "#ffffff"] as const;
const USER_GRADIENT = ["#032EA6", "#2652F9"] as const;
const BOT_GRADIENT = ["rgba(3,46,166,0.06)", "rgba(38,82,249,0.10)"] as const;

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

// SplitTextAnimated, ShimmerBlock, LoadingDots, ShimmerRow, SaveChatModal, ChatHistoryModal,
// WelcomeScreen, AnimatedMessageBubble components remain the same as your current file
// to preserve layout/theme and are included below unchanged.

// SplitTextAnimated (unchanged)
interface SplitTextAnimatedProps {
  text: string;
  delay?: number;
  duration?: number;
  style?: any;
}
const SplitTextAnimated: React.FC<SplitTextAnimatedProps> = ({ text, delay = 50, duration = 600, style }) => {
  const [animations] = useState(() => text.split("").map(() => new Animated.Value(0)));
  useEffect(() => {
    const seq = animations.map((anim, idx) =>
      Animated.timing(anim, { toValue: 1, duration, delay: idx * delay, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    );
    Animated.stagger(0, seq).start();
  }, [text]);
  return (
    <View style={styles.splitTextContainer}>
      {text.split("").map((char, index) => {
        const opacity = animations[index];
        const translateY = animations[index].interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
        return (
          <Animated.Text key={`${char}-${index}`} style={[style, { opacity, transform: [{ translateY }] }]}>
            {char === " " ? "\u00A0" : char}
          </Animated.Text>
        );
      })}
    </View>
  );
};

// ShimmerBlock (unchanged)
const ShimmerBlock = ({ width, height, borderRadius = 8 }: { width: number | string; height: number; borderRadius?: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, []);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-150, 150] });
  const viewStyle: ViewStyle = {
    width: width as DimensionValue,
    height,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: "#ECEFF3"
  };
  
  return (
    <View style={viewStyle}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 120,
          transform: [{ translateX }],
          backgroundColor: "rgba(255,255,255,0.75)",
        }}
      />
    </View>
  );
};

// LoadingDots (unchanged)
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

const STORAGE_KEY = "@lune_ai_doctor_messages";
const PAGE_SIZE = 20;

interface ChatHistory {
  id: string;
  title: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
}

// ShimmerRow (unchanged)
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

// SaveChatModal (unchanged visual)
function SaveChatModal({
  visible,
  onClose,
  onSave,
  onDiscard,
  savingAction,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  savingAction: "save" | "discard" | null;
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const disabled = savingAction !== null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.saveChatModalOverlay}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%", maxWidth: 420 }}>
          <LinearGradient colors={PAGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.saveChatModalContent}>
            <Animated.View style={{ opacity: opacityAnim }}>
              <Text style={styles.saveChatModalTitle}>Save this conversation?</Text>
              <Text style={styles.saveChatModalMessage}>
                Would you like to save this chat for later so you can access it from your chat history?
              </Text>
              <View style={styles.saveChatModalButtons}>
                <TouchableOpacity style={styles.saveChatModalBtnSecondary} onPress={onDiscard} activeOpacity={0.8} disabled={disabled}>
                  {savingAction === "discard" ? <ActivityIndicator color={COLORS.blue} /> : <Text style={styles.saveChatModalBtnSecondaryText}>Don’t Save</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveChatModalBtnPrimary} onPress={onSave} activeOpacity={0.8} disabled={disabled}>
                  {savingAction === "save" ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveChatModalBtnPrimaryText}>Save Chat</Text>}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ChatHistoryModal (unchanged visual)
function ChatHistoryModal({
  visible,
  onClose,
  onSelectChat,
}: {
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
                  <Image source={require("../../assets/navigation/close.png")} style={styles.closeIcon} contentFit="contain" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={{ padding: 12 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ShimmerRow key={`s-${i}`} />
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

// WelcomeScreen (unchanged)
function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [username, setUsername] = useState<string>("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const emailUsername = user.email?.split("@")[0];
          const displayName = emailUsername
            ? emailUsername
                .split(/[._]/)
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(" ")
            : "User";
          setUsername(displayName);
        } else {
          setUsername("User");
        }
      } catch {
        setUsername("User");
      } finally {
        setLoading(false);
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.welcomeContainer}>
        <View style={{ width: "70%", alignItems: "center", gap: 12 }}>
          <ShimmerBlock width="80%" height={24} borderRadius={12} />
          <ShimmerBlock width="95%" height={14} borderRadius={7} />
          <ShimmerBlock width="85%" height={14} borderRadius={7} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <SplitTextAnimated text={`Hello ${username}`} delay={50} duration={600} style={styles.welcomeTitle} />
      <Text style={styles.welcomeDisclaimer}>
        This is AI‑assisted medical guidance for informational purposes only and is not a substitute for professional medical advice.
      </Text>
    </Animated.View>
  );
}

// Message bubble (unchanged)
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

// API base (unchanged)
const API_BASE = (process.env.EXPO_PUBLIC_RENDER_API_URL ?? "").replace(/\/$/, "");
const DOCTOR_URL = API_BASE ? `${API_BASE}/api/doctor` : null;

export default function AIDoctorScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingAction, setSavingAction] = useState<"save" | "discard" | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingMessageIdRef = useRef<string | null>(null);
  const typingRafRef = useRef<number | null>(null);
  const messageIdCounterRef = useRef(0);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // chat/session state
  const [chatId, setChatId] = useState<string | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const pendingBotIdRef = useRef<string | null>(null);

  const generateLocalId = useCallback((role: string) => {
    const ts = Date.now();
    const counter = messageIdCounterRef.current++;
    const rand = Math.random().toString(36).slice(2, 9);
    return `${role}-${ts}-${counter}-${rand}`;
  }, []);

  // NEW: always create a fresh UUID v4 chat_id when opening new chat
  useEffect(() => {
    const newId = Crypto.randomUUID();
    setChatId(newId);
    AsyncStorage.setItem("lune:aidoctor:chat_id", newId).catch(() => {});
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

  const meaningfulCount = useMemo(() => messages.filter((m) => m.role === "user" || m.role === "doctor").length, [messages]);
  const shouldPromptToSave = useMemo(() => meaningfulCount >= 3, [meaningfulCount]);

  const appendMessage = useCallback(
    (msg: Message) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((m) => {
        if (m.some((existing) => existing.id === msg.id)) msg.id = generateLocalId(msg.role);
        return [...m, msg];
      });
      if (msg.role === "doctor") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scrollToBottom(true);
    },
    [generateLocalId, scrollToBottom]
  );

  const removeMessageById = useCallback((id: string) => {
    setMessages((m) => m.filter((x) => x.id !== id));
  }, []);

  // Save chat metadata only; messages are already saved by backend per send
  const saveChatToDatabase = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Toast.show({ type: "error", text1: "Error", text2: "You must be logged in to save chats", position: "top", topOffset: 60 });
      return;
    }
    if (!chatId) {
      Toast.show({ type: "error", text1: "Error", text2: "Chat not ready, try again", position: "top", topOffset: 60 });
      return;
    }
    const firstUserMessage = messages.find((m) => m.role === "user")?.content || "New Chat";
    const lastMessage = messages[messages.length - 1]?.content || "";
    const { error } = await supabase.from("chat_history").insert({
      id: chatId, // critical: persist the same chat_id here
      user_id: user.id,
      title: firstUserMessage.substring(0, 50),
      last_message: lastMessage.substring(0, 200),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    Toast.show({ type: "success", text1: "Chat Saved", text2: "Conversation saved to history", position: "top", topOffset: 60 });
    await AsyncStorage.removeItem(STORAGE_KEY);
    router.replace("/(tabs)");
  };

  const handleBackPress = useCallback(async () => {
    if (shouldPromptToSave) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowSaveModal(true);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      router.replace("/(tabs)");
    }
  }, [shouldPromptToSave]);

  const confirmDiscard = useCallback(async () => {
    if (savingAction) return;
    setSavingAction("discard");
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem("lune:aidoctor:chat_id");
      router.replace("/(tabs)");
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e?.message || "Failed to discard chat", position: "top", topOffset: 60 });
    } finally {
      setSavingAction(null);
      setShowSaveModal(false);
    }
  }, [savingAction]);

  const confirmSave = useCallback(async () => {
    if (savingAction) return;
    setSavingAction("save");
    try {
      await saveChatToDatabase();
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e?.message || "Failed to save chat", position: "top", topOffset: 60 });
    } finally {
      setSavingAction(null);
      setShowSaveModal(false);
    }
  }, [savingAction, messages, chatId]);

  const stopStreaming = () => {
    if (typingRafRef.current) {
      cancelAnimationFrame(typingRafRef.current);
      typingRafRef.current = null;
    }
    typingMessageIdRef.current = null;
    setIsTyping(false);
    stopAutoScroll();

    if (fetchAbortRef.current) {
      try {
        fetchAbortRef.current.abort();
      } catch {}
      fetchAbortRef.current = null;
    }
    if (pendingBotIdRef.current) {
      removeMessageById(pendingBotIdRef.current);
      pendingBotIdRef.current = null;
    }
  };

  // Smooth streaming (unchanged UI)
  const smoothStreamAI = (text: string) =>
    new Promise<void>((resolve) => {
      const id = generateLocalId("bot");
      typingMessageIdRef.current = id;
      setIsTyping(true);
      let idx = 0;
      let lastTs = 0;
      let carry = 0;
      const cps = 90;

      const frame = (ts: number) => {
        if (typingMessageIdRef.current !== id) {
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
          const without = m.filter((x) => x.id !== id);
          return [...without, { id, role: "doctor", content: current, timestamp: new Date().toISOString() } as Message];
        });

        if (idx >= text.length) {
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

  // Backend call
  const callDoctorAPI = useCallback(async (message: string, cid: string, signal?: AbortSignal) => {
    if (!DOCTOR_URL) {
      throw new Error("Missing EXPO_PUBLIC_RENDER_API_URL; set it to your Render base URL");
    }
    const res = await fetch(DOCTOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chat_id: cid }),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json() as Promise<{ success: boolean; reply?: string; error?: string }>;
  }, []);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending || isTyping) return;
    if (!chatId) {
      Toast.show({ type: "error", text1: "Error", text2: "Chat not ready, please try again.", position: "top", topOffset: 60 });
      return;
    }

    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = { id: generateLocalId("user"), role: "user", content, timestamp: new Date().toISOString() };
    appendMessage(userMsg);
    setInput("");

    const thinkingId = generateLocalId("doctor");
    pendingBotIdRef.current = thinkingId;
    appendMessage({ id: thinkingId, role: "doctor", content: "Dr. Lune is thinking…", timestamp: new Date().toISOString() });

    try {
      const controller = new AbortController();
      fetchAbortRef.current = controller;
      const data = await callDoctorAPI(content, chatId, controller.signal);
      fetchAbortRef.current = null;
      setIsSending(false);

      if (pendingBotIdRef.current) {
        removeMessageById(pendingBotIdRef.current);
        pendingBotIdRef.current = null;
      }

      if (!data || !data.success || !data.reply) {
        stopAutoScroll();
        appendMessage({
          id: generateLocalId("error"),
          role: "error",
          content: data?.error || "Failed to get response",
          timestamp: new Date().toISOString(),
        });
        Toast.show({ type: "error", text1: "Error", text2: data?.error || "Failed to get response", position: "top", topOffset: 60 });
        return;
      }
      await smoothStreamAI(String(data.reply));
    } catch (e: any) {
      setIsTyping(false);
      setIsSending(false);
      stopAutoScroll();
      if (pendingBotIdRef.current) {
        removeMessageById(pendingBotIdRef.current);
        pendingBotIdRef.current = null;
      }
      appendMessage({
        id: generateLocalId("error"),
        role: "error",
        content: e?.name === "AbortError" ? "Generation stopped" : e?.message || "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      });
      if (e?.name !== "AbortError") {
        Toast.show({ type: "error", text1: "Error", text2: e?.message || "An unexpected error occurred", position: "top", topOffset: 60 });
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    };
    initialize();
    return () => {
      stopAutoScroll();
      if (typingRafRef.current) cancelAnimationFrame(typingRafRef.current);
      if (fetchAbortRef.current) {
        try {
          fetchAbortRef.current.abort();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
    }
  }, [messages]);

  const loadMessages = async (pageNum = 1) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored) as Message[];
        const start = Math.max(0, all.length - pageNum * PAGE_SIZE);
        const end = all.length;
        const paged = all.slice(start, end);
        setMessages(paged);
        setPage(pageNum);
      }
    } catch {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages(page + 1);
    setRefreshing(false);
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.navigationCard}>
                  <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress} activeOpacity={0.7}>
                    <Image source={require("../../assets/navigation/left.png")} style={styles.backIcon} contentFit="contain" />
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
                    <Image source={require("../../assets/home-icons/previouschat.png")} style={styles.historyIcon} contentFit="contain" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <SaveChatModal
              visible={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              onSave={confirmSave}
              onDiscard={confirmDiscard}
              savingAction={savingAction}
            />

            <ChatHistoryModal
              visible={showHistory}
              onClose={() => setShowHistory(false)}
              onSelectChat={async (chatId) => {
                setShowHistory(false);
                router.push(`/(features)/chat-history/${chatId}`);
              }}
            />

            {/* Chat */}
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}>
              <View style={styles.chatContainer}>
                {messages.length === 0 ? (
                  <WelcomeScreen />
                ) : (
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    extraData={[messages.length, isTyping]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.blue} colors={[COLORS.blue]} progressBackgroundColor={COLORS.white} />}
                    contentContainerStyle={[styles.listContent, { paddingTop: LIST_TOP_INSET }]}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => scrollToBottom(true)}
                  />
                )}
              </View>

              {/* Input */}
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

                  {/* Send / Loading / Stop */}
                  {isTyping ? (
                    <TouchableOpacity style={styles.sendBtnBase} onPress={stopStreaming} activeOpacity={0.85} accessibilityLabel="Stop generating">
                      <LinearGradient colors={USER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtnFill}>
                        <MaterialCommunityIcons name="stop" size={20} color={COLORS.white} />
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.sendBtnBase} onPress={() => handleSend()} disabled={isSending || !hasInput} activeOpacity={0.85}>
                      {isSending || hasInput ? (
                        <LinearGradient colors={USER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtnFill}>
                          {isSending ? (
                            <LoadingDots />
                          ) : (
                            <Image source={require("../../assets/navigation/send.png")} style={[styles.sendIcon, { tintColor: COLORS.white }]} contentFit="contain" />
                          )}
                        </LinearGradient>
                      ) : (
                        <View style={[styles.sendBtnFill, styles.sendBtnWhiteFill]}>
                          <Image source={require("../../assets/navigation/send.png")} style={[styles.sendIcon, { tintColor: COLORS.blue }]} contentFit="contain" />
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
  splitTextContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
  saveChatModalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  saveChatModalContent: { borderRadius: 20, padding: 24, width: "100%", shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: COLORS.border },
  saveChatModalTitle: { fontSize: 20, color: COLORS.charcoal, textAlign: "center", marginBottom: 10, fontFamily: "Inter-Bold" },
  saveChatModalMessage: { fontSize: 14, color: COLORS.gray, textAlign: "center", lineHeight: 20, marginBottom: 20, fontFamily: "Inter-Regular" },
  saveChatModalButtons: { flexDirection: "row", gap: 12 },
  saveChatModalBtnSecondary: { flex: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", minHeight: 44 },
  saveChatModalBtnSecondaryText: { fontSize: 15, color: COLORS.charcoal, fontFamily: "Inter-SemiBold" },
  saveChatModalBtnPrimary: { flex: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.blue, alignItems: "center", justifyContent: "center", minHeight: 44 },
  saveChatModalBtnPrimaryText: { fontSize: 15, color: COLORS.white, fontFamily: "Inter-SemiBold" },
  skeletonRow: { height: 44, justifyContent: "center", paddingHorizontal: 16, marginBottom: 8 },
  skeletonBlock: { height: 16, borderRadius: 8, backgroundColor: "#ECEFF3", overflow: "hidden" },
  skeletonShimmer: { position: "absolute", top: 0, bottom: 0, width: 120, backgroundColor: "rgba(255,255,255,0.75)" },
  sidebarModalOverlay: { flex: 1, flexDirection: "row" },
  sidebarOverlayTouchable: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  sidebarContent: { width: screenWidth * 0.85, maxWidth: 320, height: "100%", position: "absolute", left: 0, top: 0, backgroundColor: "transparent", borderRightWidth: 1, borderRightColor: COLORS.border },
  sidebarGradientFull: { flex: 1 },
  sidebarHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  sidebarTitle: { fontSize: 18, color: COLORS.charcoal, fontFamily: "Inter-SemiBold" },
  sidebarCloseBtn: { width: CONTROL_HEIGHT, height: CONTROL_HEIGHT, borderRadius: CONTROL_RADIUS, alignItems: "center", justifyContent: "center" },
  closeIcon: { width: 22, height: 22 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 16, color: COLORS.gray, fontFamily: "Inter-Regular" },
  sidebarChatList: { paddingTop: 8, paddingBottom: 12 },
  sidebarChatItem: { backgroundColor: "transparent", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(16,15,21,0.08)" },
  sidebarChatItemContent: { flex: 1 },
  sidebarChatTitle: { fontSize: 15, color: COLORS.charcoal, fontFamily: "Inter-Medium" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, backgroundColor: "transparent", position: "relative" },
  header: { position: "absolute", top: HEADER_TOP_OFFSET, left: 12, right: 12, backgroundColor: "transparent", zIndex: 20 },
  headerContent: { paddingHorizontal: 0 },
  navigationCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderRadius: CONTROL_RADIUS, paddingVertical: 4, paddingHorizontal: 4, alignSelf: "flex-start", width: undefined, borderWidth: 1, borderColor: COLORS.border, height: CONTROL_HEIGHT },
  backButtonContainer: { width: CONTROL_HEIGHT - 8, height: CONTROL_HEIGHT - 8, borderRadius: (CONTROL_HEIGHT - 8) / 2, alignItems: "center", justifyContent: "center" },
  backIcon: { width: 20, height: 20 },
  divider: { width: 1, height: CONTROL_HEIGHT - 16, backgroundColor: COLORS.border, marginHorizontal: 8 },
  historyButtonInline: { width: CONTROL_HEIGHT - 8, height: CONTROL_HEIGHT - 8, borderRadius: (CONTROL_HEIGHT - 8) / 2, alignItems: "center", justifyContent: "center" },
  historyIcon: { width: 20, height: 20 },
  keyboardView: { flex: 1, backgroundColor: "transparent" },
  chatContainer: { flex: 1, position: "relative", backgroundColor: "transparent" },
  welcomeContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  welcomeTitle: { fontSize: 28, color: COLORS.charcoal, letterSpacing: -0.5, fontFamily: "Inter-Bold" },
  welcomeDisclaimer: { fontSize: 14, color: COLORS.gray, textAlign: "center", lineHeight: 22, paddingHorizontal: 8, marginTop: 20, fontFamily: "Inter-Regular" },
  listContent: { paddingHorizontal: 12, paddingBottom: 16, flexGrow: 1 },
  msgRow: { marginVertical: 6, flexDirection: "row", alignItems: "flex-end" },
  msgLeft: { justifyContent: "flex-start", maxWidth: "82%" },
  msgRight: { justifyContent: "flex-end", alignSelf: "flex-end", maxWidth: "82%" },
  bubbleOuter: { borderRadius: CONTROL_RADIUS },
  bubbleGradient: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: CONTROL_RADIUS, justifyContent: "center" },
  botBubble: { alignSelf: "flex-start" },
  userBubble: { alignSelf: "flex-end", minHeight: CONTROL_HEIGHT },
  errorBubble: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", borderWidth: 1, borderRadius: CONTROL_RADIUS },
  bubbleText: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1, fontFamily: "Inter-Regular" },
  botText: { color: COLORS.charcoal },
  userText: { color: COLORS.white },
  inputContainer: { backgroundColor: "transparent", position: "relative", paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 12 : 14, zIndex: 1 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "transparent" },
  input: { flex: 1, color: COLORS.charcoal, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: CONTROL_RADIUS, paddingHorizontal: 14, paddingVertical: 0, height: CONTROL_HEIGHT, fontSize: 16, lineHeight: 22, fontFamily: "Inter-Regular" },
  sendBtnBase: { marginLeft: 8, width: CONTROL_HEIGHT, height: CONTROL_HEIGHT, borderRadius: CONTROL_RADIUS, overflow: "hidden", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" },
  sendBtnFill: { width: "100%", height: "100%", borderRadius: CONTROL_RADIUS, justifyContent: "center", alignItems: "center" },
  sendBtnWhiteFill: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  sendIcon: { width: 18, height: 18 },
  loadingDotsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white, marginHorizontal: 3 },
});
