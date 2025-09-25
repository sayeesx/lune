import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface AuthToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  leftLabel: string;
  rightLabel: string;
}

const PADDING = 4;

export const AuthToggle: React.FC<AuthToggleProps> = ({
  value,
  onValueChange,
  leftLabel,
  rightLabel,
}) => {
  // 0 = left, 1 = right
  const offset = useSharedValue(value ? 1 : 0);
  // Track container width for precise geometry
  const containerWidth = useSharedValue(280); // default matches style; updated by onLayout

  useEffect(() => {
    // Use a tighter spring that avoids overshoot for a precise snap
    offset.value = withSpring(value ? 1 : 0, {
      damping: 18,
      stiffness: 260,
      mass: 1.2,
      overshootClamping: true,
      // Respect reduced motion when available
      reduceMotion: 'system',
    });
  }, [value]);

  const sliderStyle = useAnimatedStyle(() => {
    // Inner width excludes left/right padding
    const inner = Math.max(containerWidth.value - PADDING * 2, 0);
    // Slider is exactly half of inner width
    const sliderW = inner / 2;
    // Travel distance from left to right
    const maxX = inner - sliderW; // equals inner/2
    return {
      width: sliderW,
      transform: [{ translateX: offset.value * maxX }],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryMedium]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toggleContainer}
        onLayout={(e) => {
          containerWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[styles.slider, sliderStyle]} />
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={() => onValueChange(false)}
          style={[styles.option, !value && styles.activeOption]}
          accessibilityRole="switch"
          accessibilityState={{ checked: !value }}
        >
          <Text style={[styles.label, !value && styles.activeLabel]}>
            {leftLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={() => onValueChange(true)}
          style={[styles.option, value && styles.activeOption]}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
        >
          <Text style={[styles.label, value && styles.activeLabel]}>
            {rightLabel}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  toggleContainer: {
    width: 280,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    padding: PADDING,
    position: 'relative',
    // IMPORTANT: remove overflow clipping so the slider's shadow is visible
    // (both iOS shadow props and Android elevation can be clipped by overflow)
    // overflow: 'hidden',
    // Optional outer subtle shadow for the whole control (uncomment if desired)
    // shadowColor: '#000',
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 2,
  },
  slider: {
    position: 'absolute',
    height: 50 - PADDING * 2, // 42
    borderRadius: (50 - PADDING * 2) / 2, // 21
    backgroundColor: '#fff',
    top: PADDING,
    left: PADDING,
    // Platform-appropriate shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeOption: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeLabel: {
    color: colors.primary,
  },
});
