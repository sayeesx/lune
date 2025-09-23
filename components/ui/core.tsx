import { colors } from '@/theme/colors';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface CardProps {
  style?: ViewStyle;
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
};

interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
}

export const StyledText: React.FC<TextProps> = ({ 
  variant = 'body', 
  color = colors.text,
  style,
  children 
}) => {
  return (
    <Text style={[styles[variant], { color }, style]}>
      {children}
    </Text>
  );
};

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  children,
  style
}) => {
  return (
    <View style={[styles.button, styles[variant], styles[size], style]}>
      <Text style={[
        styles.buttonText,
        variant === 'outline' && { color: colors.primary }
      ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Card styles
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.background,
  },
  default: {},
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Text styles
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  // Button styles
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});