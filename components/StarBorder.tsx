import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef } from "react"
import { Animated, StyleSheet, View } from "react-native"

interface StarBorderProps {
  children: React.ReactNode
  color?: string
  speed?: number
  thickness?: number
  borderRadius?: number
}

export const StarBorder: React.FC<StarBorderProps> = ({
  children,
  color = "#2652F9",
  speed = 3000,
  thickness = 2,
  borderRadius = 24,
}) => {
  const animation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startAnimation = () => {
      // Reset animation value
      animation.setValue(0)
      // Create sequence for full border trace
      Animated.sequence([
        // Top to right
        Animated.timing(animation, {
          toValue: 1,
          duration: speed / 4,
          useNativeDriver: true,
        }),
        // Right to bottom
        Animated.timing(animation, {
          toValue: 2,
          duration: speed / 4,
          useNativeDriver: true,
        }),
        // Bottom to left
        Animated.timing(animation, {
          toValue: 3,
          duration: speed / 4,
          useNativeDriver: true,
        }),
        // Left to top
        Animated.timing(animation, {
          toValue: 4,
          duration: speed / 4,
          useNativeDriver: true,
        }),
      ]).start(() => {
        startAnimation()
      })
    }

    startAnimation()
    return () => {
      animation.stopAnimation()
    }
  }, [speed])

  const translateX = animation.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, 100, 100, 0, 0]
  })

  const translateY = animation.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, 0, 100, 100, 0]
  })

  return (
    <View style={[styles.container, { borderRadius }]}>
      {/* Top animation */}
      <Animated.View
        style={[
          styles.gradientDot,
          {
            transform: [
              { translateX },
              { translateY }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[color, 'transparent']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Content container with shadow */}
      <View
        style={[
          styles.innerContainer,
          {
            borderRadius: borderRadius - thickness,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          },
        ]}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: 'transparent',
  },
  gradientDot: {
    position: "absolute",
    width: 15,
    height: 15,
    opacity: 0.8,
    zIndex: 2,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  innerContainer: {
    backgroundColor: "transparent",
    zIndex: 1,
    padding: 4,
  },
})

export default StarBorder
