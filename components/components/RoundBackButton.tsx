import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoundBackButton({ to = '/(tabs)' }: { to?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: (insets.top || (Platform.OS === 'ios' ? 44 : 20)) + 8 }]}>
      <TouchableOpacity
  onPress={() => router.replace(to as any)}
        activeOpacity={0.8}
        style={styles.button}
      >
        <Image source={require('@/assets/navigation/left.png')} style={styles.icon} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    zIndex: 100,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#100F15',
  },
});