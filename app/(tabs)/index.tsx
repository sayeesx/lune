import NotificationModal from "@/components/NotificationModal"
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
import Svg, { Polyline } from "react-native-svg"
import premiumIcon from "../../assets/home-icons/premium.png"
import profileIcon from "../../assets/home-icons/profile.png"
import HomeScreenSkeleton from "@/components/HomeScreenSkeleton"


const DEFAULT_NAME = "There"

const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline)


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
]


const recentChats = [
  "Analyze my symptoms",
  "Check medication dosage",
]


// Animated Lightning Icon Component
const AnimatedLightningIcon = ({ size = 20, color = "#FFFFFF", shouldAnimate }: { size?: number; color?: string; shouldAnimate: boolean }) => {
  const dashAnim = useRef(new Animated.Value(0)).current
  const fillAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (shouldAnimate) {
      // Start dash animation automatically
      Animated.sequence([
        Animated.timing(dashAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [shouldAnimate])

  const strokeDashoffset = dashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [68, 0],
  })

  const fillOpacity = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <AnimatedSvg width={size} height={size} viewBox="0 0 24 24">
      <AnimatedPolyline
        points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="68 68"
        strokeDashoffset={strokeDashoffset}
      />
    </AnimatedSvg>
  )
}


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


// Animated greeting component
const AnimatedGreeting = ({ displayName, shouldStartAnimation }: { displayName: string; shouldStartAnimation: boolean }) => {
  const slideAnim = useRef(new Animated.Value(0)).current
  const [hasAnimated, setHasAnimated] = useState(false)


  useEffect(() => {
    if (shouldStartAnimation && displayName !== DEFAULT_NAME && !hasAnimated) {
      // Animate from "There" to the user's name
      Animated.sequence([
        Animated.delay(500), // Wait 500ms after page loads
        Animated.timing(slideAnim, {
          toValue: -1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setHasAnimated(true))
    }
  }, [shouldStartAnimation, displayName, hasAnimated])


  const translateY = slideAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: [-40, 0],
  })


  return (
    <View style={styles.greetingRow}>
      <Text style={styles.greeting}>Hello </Text>
      <View style={styles.nameContainer}>
        <Animated.View style={[styles.nameSlider, { transform: [{ translateY }] }]}>
          <Text style={styles.greeting}>{DEFAULT_NAME}</Text>
          <Text style={[styles.greeting, styles.userName]}>{displayName}</Text>
        </Animated.View>
      </View>
    </View>
  )
}


// Modern Animated Button Component
const ModernChatButton = ({ onPress }: { onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const [shouldAnimateSvg, setShouldAnimateSvg] = useState(false)

  useEffect(() => {
    // Trigger SVG animation after a delay when component mounts
    const timer = setTimeout(() => {
      setShouldAnimateSvg(true)
    }, 800) // Delay to allow scroll to finish

    // Continuous glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    return () => clearTimeout(timer)
  }, [])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <View style={styles.modernButtonContainer}>
      {/* Outer glow layers */}
      <Animated.View style={[styles.glowLayer1, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowLayer2, { opacity: glowOpacity }]} />
      
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <LinearGradient 
            colors={["#2652F9", "#032EA6"]} 
            style={styles.modernButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.modernButtonContent}>
              <View style={styles.iconCircle}>
                <AnimatedLightningIcon size={20} color="#FFFFFF" shouldAnimate={shouldAnimateSvg} />
              </View>
              <Text style={styles.modernButtonText}>Chat with Lune AI</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}


export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [displayName, setDisplayName] = useState<string>(DEFAULT_NAME)
  const [isPro, setIsPro] = useState<boolean>(false)
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [shouldStartAnimation, setShouldStartAnimation] = useState<boolean>(false)
  
  // Track if initial load has completed to prevent multiple loading animations
  const hasInitiallyLoaded = useRef(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const keyboardHeight = useRef(new Animated.Value(0)).current


  const handleNotificationsPress = () => {
    setIsNotificationsVisible(true)
  }


  // Keyboard handling
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
  }, [keyboardHeight])


  // Initial authentication and data loading
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      try {
        // Check authentication first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !sessionData.session) {
          if (isMounted) {
            setIsAuthenticated(false)
            setIsLoading(false)
            hasInitiallyLoaded.current = true
          }
          return
        }


        // User is authenticated
        setIsAuthenticated(true)


        // Preload all images
        const imagesToPreload = [
          premiumIcon,
          profileIcon,
          require("../../assets/home-icons/notification.png"),
          ...healthcareFeatures.map(f => f.iconSource),
        ]


        const imagePromises = imagesToPreload.map((imageSource) =>
          Image.prefetch(Image.resolveAssetSource(imageSource).uri).catch(() => {})
        )


        // Fetch profile data
        const profilePromise = supabase
          .from("profiles")
          .select("full_name, is_pro")
          .eq("id", sessionData.session.user.id)
          .single()


        // Wait for both images and profile
        const [profileResult] = await Promise.all([
          profilePromise,
          ...imagePromises,
        ])


        const { data: profile, error: profileError } = profileResult
        
        if (profileError && profileError.code !== 'PGRST116') {
          if (process.env.NODE_ENV !== "production") {
            console.error("Profile fetch error:", profileError)
          }
        }
        
        if (isMounted) {
          setIsPro(profile?.is_pro || false)
          
          if (profile?.full_name?.trim()) {
            setDisplayName(profile.full_name.trim().split(" ")[0])
          } else {
            // Fallback to user metadata if no profile name
            const fullName = sessionData.session.user.user_metadata?.full_name?.trim()
            if (fullName) {
              setDisplayName(fullName.split(" ")[0])
            } else {
              // Last resort: use email prefix
              const email = sessionData.session.user.email
              if (email) {
                setDisplayName(email.split("@")[0])
              } else {
                setDisplayName(DEFAULT_NAME)
              }
            }
          }


          // Show content after everything is loaded
          setIsLoading(false)
          hasInitiallyLoaded.current = true
          
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // Start the greeting animation after fade-in completes
            setShouldStartAnimation(true)
          })
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Error fetching user data:", error)
        }
        if (isMounted) {
          setIsAuthenticated(false)
          setIsLoading(false)
          hasInitiallyLoaded.current = true
        }
      }
    }


    // Only load if this is the first time
    if (!hasInitiallyLoaded.current) {
      loadData()
    }
    
    return () => {
      isMounted = false
    }
  }, [])


  // Handle smooth animations when returning to this screen
  useFocusEffect(
    useCallback(() => {
      // Only run smooth transition if already loaded
      if (hasInitiallyLoaded.current) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      }


      // Reset fade for next unfocus
      return () => {
        if (hasInitiallyLoaded.current) {
          fadeAnim.setValue(0)
        }
      }
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


  const handleFeaturePress = useCallback((route: string) => {
    router.push(route as any)
  }, [])


  // Redirect to auth if not authenticated.
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      router.replace('/auth/login')
    }
  }, [isLoading, isAuthenticated])


  if (!isLoading && isAuthenticated === false) {
    return null
  }


  // Loading screen with shimmer skeleton
  if (isLoading && !hasInitiallyLoaded.current) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
        <HomeScreenSkeleton />
      </>
    )
  }


  return (
    <Animated.View style={[styles.outerContainer, { opacity: fadeAnim }]}>
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
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleNotificationsPress}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Image source={require("../../assets/home-icons/notification.png")} style={styles.notificationIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>


          <NotificationModal
            isVisible={isNotificationsVisible}
            onClose={() => setIsNotificationsVisible(false)}
          />


          <View style={styles.greetingSection}>
            <AnimatedGreeting displayName={displayName} shouldStartAnimation={shouldStartAnimation} />
            <Text style={styles.tagline}>Lune, An AI That Understands Your Health..</Text>
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
          
          {/* Two suggestions in a single row */}
          <View style={styles.chatPillsRow}>
            {recentChats.map((chat, index) => (
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
          
          {/* Modern Chat Button - ONLY ONE */}
          <ModernChatButton onPress={() => router.push("/(tabs)/chat")} />
        </View>
      </ScrollView>
    </Animated.View>
  )
}


const { width: screenWidth, height: screenHeight } = Dimensions.get("window")


const styles = StyleSheet.create({
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
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
    paddingBottom: 40,
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
    height: 40,
    overflow: "hidden",
  },
  nameContainer: {
    overflow: "hidden",
    height: 40,
  },
  nameSlider: {
    flexDirection: "column",
  },
  userName: {
    color: "#2652F9",
  },
  greeting: {
    fontSize: screenWidth * 0.07,
    fontFamily: "Inter-Bold",
    color: "#100F15",
    height: 40,
    lineHeight: 40,
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
  chatPillsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  chatPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EAEE",
    alignItems: "center",
    justifyContent: "center",
  },
  chatPillText: {
    fontSize: screenWidth * 0.033,
    fontFamily: "Inter-Medium",
    color: "#4A4A4D",
    textAlign: "center",
    lineHeight: 18,
  },
  // Modern button styles
  modernButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
  glowLayer1: {
    position: "absolute",
    width: "100%",
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2652F9",
    zIndex: -2,
    ...Platform.select({
      ios: {
        shadowColor: "#2652F9",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  glowLayer2: {
    position: "absolute",
    width: "92%",
    height: 52,
    borderRadius: 16,
    backgroundColor: "#032EA6",
    zIndex: -1,
    ...Platform.select({
      ios: {
        shadowColor: "#032EA6",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modernButtonGradient: {
    width: screenWidth * 0.88,
    paddingVertical: 14,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modernButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modernButtonText: {
    flex: 1,
    fontSize: screenWidth * 0.04,
    fontFamily: "Inter-Bold",
    color: "#FFFFFF",
    marginLeft: 10,
    letterSpacing: 0.2,
  },
})
