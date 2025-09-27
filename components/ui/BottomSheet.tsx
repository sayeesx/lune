// components/ui/BottomSheet.tsx
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, View } from 'react-native';

export function BottomSheet({ visible, onClose, children, snapPercent = 0.75 }: { visible: boolean; onClose: () => void; children: ReactNode; snapPercent?: number }) {
  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const clampedPercent = Math.max(0.25, Math.min(0.95, snapPercent));
  const sheetHeight = Math.round(screenHeight * clampedPercent);

  useEffect(() => {
    if (visible) {
      // Mount and animate in
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      // Animate out then unmount to fully remove the grey backdrop
      Animated.parallel([
        Animated.timing(translateY, { toValue: screenHeight, duration: 240, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
      });
    }
  }, [visible, mounted, translateY, backdropOpacity, screenHeight]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingBottom: 24, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.08, shadowRadius: 16,
    elevation: 10,
  },
  handle: { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.15)', marginBottom: 8 },
});
