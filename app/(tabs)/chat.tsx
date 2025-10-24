import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const { width: screenWidth } = Dimensions.get("window")

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const COLORS = {
  white: "#FFFFFF",
  primary: "#2652F9",
  darkText: "#100F15",
  secondaryText: "#9199B1",
  mediumGray: "#4A4A4D",
  darkBlue: "#032EA6",
}

// Animated Loading Dots Component
const LoadingDots = () => {
  const dot1 = useRef(new RNAnimated.Value(0)).current
  const dot2 = useRef(new RNAnimated.Value(0)).current
  const dot3 = useRef(new RNAnimated.Value(0)).current

  useEffect(() => {
    const animate = (dot: RNAnimated.Value, delay: number) => {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          RNAnimated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    animate(dot1, 0)
    animate(dot2, 200)
    animate(dot3, 400)
  }, [])

  const translateY1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })
  const translateY2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })
  const translateY3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  })

  return (
    <View style={styles.loadingDotsContainer}>
      <RNAnimated.View style={[styles.dot, { transform: [{ translateY: translateY1 }] }]} />
      <RNAnimated.View style={[styles.dot, { transform: [{ translateY: translateY2 }] }]} />
      <RNAnimated.View style={[styles.dot, { transform: [{ translateY: translateY3 }] }]} />
    </View>
  )
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new RNAnimated.Value(0)).current
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height)
      }
    )
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0)
      }
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  useEffect(() => {
    if (params.initialMessage && typeof params.initialMessage === "string") {
      handleInitialMessage(params.initialMessage)
    }
  }, [params.initialMessage])

  const handleInitialMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    }
    setMessages([userMessage])
    setIsLoading(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${text}". This is a healthcare-related question. How can I assist you further?`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
      animateNewMessage()
    }, 1500)
  }

  const animateNewMessage = () => {
    fadeAnim.setValue(0)
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const handleSendMessage = useCallback(() => {
    const trimmedText = inputText.trim()
    if (!trimmedText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Thank you for sharing that. Based on what you've mentioned about "${trimmedText}", I'd recommend consulting with a healthcare professional for personalized advice. Is there anything specific you'd like to know?`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
      animateNewMessage()
    }, 1500)
  }, [inputText, isLoading])

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const formatTime = (date: Date) => {
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? "PM" : "AM"
        const formattedHours = hours % 12 || 12
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
        return `${formattedHours}:${formattedMinutes} ${ampm}`
      }

      const isLastMessage = index === messages.length - 1

      return (
        <RNAnimated.View
          style={[
            styles.messageContainer,
            item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
            isLastMessage && !item.isUser && { opacity: fadeAnim },
          ]}
        >
          <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
            <Text style={[styles.timestamp, item.isUser ? styles.userTimestamp : styles.aiTimestamp]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </RNAnimated.View>
      )
    },
    [messages.length, fadeAnim]
  )

  const keyExtractor = useCallback((item: Message) => item.id, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>Always here to help</Text>
          </View>
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="message-text-outline" size={64} color={COLORS.secondaryText} />
            </View>
            <Text style={styles.emptyTitle}>Start a Conversation</Text>
            <Text style={styles.emptySubtitle}>
              Ask me anything about your health,{"\n"}symptoms, medications, or wellness tips.
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              {["What are symptoms of flu?", "How to reduce stress?", "Explain my lab results"].map(
                (suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionPill}
                    onPress={() => {
                      setInputText(suggestion)
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="lightbulb-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: Platform.OS === "android" ? 80 : 20 },
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingMessageContainer}>
                  <View style={styles.loadingBubble}>
                    <LoadingDots />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Container - Always at Bottom */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="paperclip" size={22} color={COLORS.secondaryText} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.secondaryText}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              multiline
              maxLength={1000}
              editable={!isLoading}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading ? COLORS.white : COLORS.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EAEE",
    shadowColor: COLORS.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6FA",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: COLORS.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.secondaryText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: "100%",
    alignItems: "stretch",
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.mediumGray,
    marginBottom: 12,
    textAlign: "center",
  },
  suggestionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8EAEE",
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.darkText,
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.darkText,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  aiTimestamp: {
    color: COLORS.secondaryText,
  },
  loadingMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingDotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#E8EAEE",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F6FA",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8EAEE",
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkText,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E8EAEE",
  },
})
