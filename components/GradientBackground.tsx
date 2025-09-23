import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children,
  variant = 'primary',
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}) => {
  return (
    <LinearGradient
      colors={colors.gradients[variant] as any}
      style={[styles.gradient, style]}
      start={start}
      end={end}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
  },
});

export default GradientBackground;