import premiumIcon from "@/assets/home-icons/premium.png"
import profileIcon from "@/assets/home-icons/profile.png"
import RotatingText from "@/components/RotatingText"
import { supabase } from "@/lib/supabaseClient"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const DEFAULT_NAME = "There"

// Healthcare features
const healthcareFeatures = [
  {
    key: "ai-doctor",
    iconSource: require("@/assets/feature-icons/aidoctor.png"),
    title: "AI Doctor",
    description: "Smart medical consultations",
    route: "/(features)/ai-doctor",
  },
  {
    key: "lab-sense",
    iconSource: require("@/assets/feature-icons/labsense.png"),
    title: "LabSense",
    description: "Lab result analysis",
    route: "/(features)/lab-sense",
  },
  {
    key: "med-guide",
    iconSource: require("@/assets/feature-icons/medguide.png"),
    title: "MedGuide",
    description: "Medication guidance",
    route: "/(features)/med-guide",
  },
  {
    key: "medical-translation",
    iconSource: require("@/assets/feature-icons/medtranslation.png"),
    title: "Medical Translation",
    description: "Translate medical terms",
    route: "/(features)/medical-translation",
  },
  {
    key: "rx-scan",
    iconSource: require("@/assets/feature-icons/rxscan.png"),
    title: "Rx Scan",
    description: "Scan prescriptions",
    route: "/(features)/rx-scan",
  },
  {
    key: "scan-vision",
    iconSource: require("@/assets/feature-icons/scanvision.png"),
    title: "ScanVision",
    description: "Medical image analysis",
    route: "/(features)/scan-vision",
  },
]

const recentChats = [
  "Analyze my symptoms",
  "Check medication dosage",
  "Scan prescription label",
  "Explain lab results",
]

// Memoized feature card component
const FeatureCard = memo(
  ({ feature, onPress }: { feature: typeof healthcareFeatures[0]; onPress: () => void }) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Image source={feature.iconSource} style={styles.featureIcon} resizeMode="contain" />
        </View>
        <View style={styles.arrowButton}>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#9199B1" />
        </View>
      </View>
      <Text style={styles.cardTitle}>{feature.title}</Text>
      <Text style={styles.cardDescription}>{feature.description}</Text>
    </TouchableOpacity>
  )
)

FeatureCard.displayName = "FeatureCard"

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [displayName, setDisplayName] = useState<string>(DEFAULT_NAME)
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true)
  const [isPro, setIsPro] = useState<boolean>(false)
  const keyboardHeight = useRef(new Animated.Value(0)).current
  const rotatingTextRef = useRef<any>(null)

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

    const keyboardWillShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration : 250,
        useNativeDriver: false,
      }).start()
    })

    const keyboardWillHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration : 250,
        useNativeDriver: false,
      }).start()
    })

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          setDisplayName(DEFAULT_NAME)
          return
        }

        // Try to get profile from database first
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, is_pro")
          .eq("id", session.data.session.user.id)
          .single()
        
        setIsPro(profile?.is_pro || false)
        if (profile?.full_name?.trim()) {
          setDisplayName(profile.full_name.trim().split(" ")[0])
          return
        }

        // Fallback to user metadata if no profile name
        const fullName = session.user.user_metadata?.full_name?.trim()
        if (fullName) {
          setDisplayName(fullName.split(" ")[0])
          return
        }

        // Last resort: use email prefix
        const email = session.user.email
        if (email) {
          setDisplayName(email.split("@")[0])
          return
        }

        setDisplayName(DEFAULT_NAME)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setDisplayName(DEFAULT_NAME)
      }
    })()
  }, [])

  // Reset animation when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setShouldAnimate(true)
      if (rotatingTextRef.current) {
        rotatingTextRef.current.reset()
      }
      
      // Stop animation after one cycle
      const timer = setTimeout(() => {
        setShouldAnimate(false)
      }, 4000) // Adjust timing based on your animation duration
      
      return () => clearTimeout(timer)
    }, [])
  )

  const handleSendMessage = useCallback((text: string) => {
    if (text.trim()) {
      router.push({
        pathname: "/(tabs)/chat",
        params: { initialMessage: text.trim() },
      })
    }
  }, [])

  const handleChatHistoryPress = useCallback((chatText: string) => {
    router.push({
      pathname: "/(tabs)/chat",
      params: { initialMessage: chatText },
    })
  }, [])

  const handlePremiumPress = useCallback(() => {
    router.push("/(features)/premium")
  }, [])

  const handleProfilePress = useCallback(() => {
    router.push("/(tabs)/profile")
  }, [])

  const handleSeeAllPress = useCallback(() => {
    router.push("/(tabs)/chat")
  }, [])

  const handleFeaturePress = useCallback((route: string) => {
    router.push(route as any)
  }, [])

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={handleProfilePress}
                accessibilityRole="button"
                accessibilityLabel="Profile"
              >
                <View style={styles.avatar}>
                  <Image source={profileIcon} style={styles.profileIcon} resizeMode="contain" />
                </View>
              </TouchableOpacity>
            </View>
            {!isPro && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={handlePremiumPress}
              accessibilityRole="button"
              accessibilityLabel="Try premium"
            >
              <LinearGradient colors={["#2652F9", "#032EA6"]} style={styles.premiumGradient}>
                <Image source={premiumIcon} style={styles.premiumIcon} resizeMode="contain" />
                <Text style={styles.premiumText}>Try Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
            )}
          </View>

          <View style={styles.greetingSection}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>Hello </Text>
              {shouldAnimate ? (
                <RotatingText
                  ref={rotatingTextRef}
                  texts={["there", displayName]}
                  style={styles.greeting}
                  rotationInterval={2000}
                  loop={false}
                  auto={true}
                />
              ) : (
                <Text style={styles.greeting}>{displayName}</Text>
              )}
            </View>
            <Text style={styles.tagline}>Make anything you want, whenever you want.</Text>
          </View>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {healthcareFeatures.map((feature) => (
              <FeatureCard
                key={feature.key}
                feature={feature}
                onPress={() => handleFeaturePress(feature.route)}
              />
            ))}
          </View>
        </View>

        {/* Ask Lune AI Section */}
        <View style={styles.chatHistorySection}>
          <View style={styles.chatHistoryHeader}>
            <Text style={styles.chatHistoryTitle}>Ask Lune AI</Text>
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
          
          {/* Chat with Lune AI Premium Button */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/chat")}
            activeOpacity={0.8}
            style={styles.chatPremiumButton}
          >
            <LinearGradient 
              colors={["#2652F9", "#032EA6"]} 
              style={styles.chatPremiumGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.chatPremiumContent}>
                <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
                <Text style={styles.chatPremiumText}>Chat with Lune AI</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const styles = StyleSheet.create({
  profileIcon: {
    width: 24,
    height: 24,
  },
  premiumIcon: {
    width: 18,
    height: 18,
  },
  featureIcon: {
    width: 32,
    height: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: screenWidth * 0.06,
    paddingBottom: screenHeight * 0.03,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: screenHeight * 0.03,
  },
  avatarContainer: {
    flex: 1,
  },
  avatar: {
    width: Math.max(48, screenWidth * 0.12),
    height: Math.max(48, screenWidth * 0.12),
    borderRadius: Math.max(24, screenWidth * 0.06),
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8EAEE",
  },
  premiumButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: screenHeight * 0.01,
    gap: 6,
  },
  premiumText: {
    color: "#FFFFFF",
    fontSize: screenWidth * 0.035,
    fontFamily: "Inter-SemiBold",
  },
  greetingSection: {
    marginBottom: screenHeight * 0.01,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: {
    fontSize: screenWidth * 0.07,
    fontFamily: "Inter-Bold",
    color: "#100F15",
  },
  tagline: {
    fontSize: screenWidth * 0.04,
    fontFamily: "Inter-Regular",
    color: "#9199B1",
  },
  featuresSection: {
    marginBottom: screenHeight * 0.04,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  featureCard: {
    width: (screenWidth - 32 - 16 - 8) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Math.max(16, screenWidth * 0.04),
    borderWidth: 1,
    borderColor: "#E8EAEE",
    shadowColor: "#100F15",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: Math.max(16, screenHeight * 0.02),
    marginHorizontal: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: screenWidth * 0.04,
    fontFamily: "Inter-SemiBold",
    color: "#100F15",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: screenWidth * 0.032,
    fontFamily: "Inter-Regular",
    color: "#9199B1",
    lineHeight: 18,
  },
  chatHistorySection: {
    paddingHorizontal: screenWidth * 0.06,
    marginBottom: screenHeight * 0.02,
  },
  chatHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chatHistoryTitle: {
    fontSize: screenWidth * 0.045,
    fontFamily: "Inter-SemiBold",
    color: "#100F15",
  },
  seeAllText: {
    fontSize: screenWidth * 0.035,
    fontFamily: "Inter-Medium",
    color: "#2652F9",
  },
  chatPills: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  chatPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8EAEE",
    shadowColor: "#100F15",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chatPillText: {
    fontSize: screenWidth * 0.035,
    fontFamily: "Inter-Medium",
    color: "#4A4A4D",
  },
  chatPremiumButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#2652F9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  chatPremiumGradient: {
    width: "100%",
    paddingVertical: 16,
  },
  chatPremiumContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  chatPremiumText: {
    flex: 1,
    fontSize: screenWidth * 0.045,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
    marginLeft: 12,
  },
})