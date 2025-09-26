import GradientBackground from '@/components/GradientBackground';
import { fontFamily } from '@/theme/fonts';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface AuthButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  loading?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  onPress, 
  title, 
  style,
  loading 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={loading}
      style={[styles.container, style]}
    >
      <GradientBackground variant="primary" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </GradientBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
});
