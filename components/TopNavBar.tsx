import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Theme colors (kept intentionally the same as in profile.tsx)
const COLORS = {
  white: '#FFFFFF',
  blue: '#2652F9',
  deepBlue: '#032EA6',
  charcoal: '#100F15',
  gray: '#9199B1',
  background: '#F8F9FC',
};

export const TOP_NAV_HEIGHT = (Platform.OS === 'ios' ? 44 : 20) + 56;

export default function TopNavBar() {
  const router = useRouter();
  const segments = useSegments();

  const canGoBack = segments.length > 0 && segments[0] !== 'auth';

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <LinearGradient
        colors={[COLORS.white, COLORS.background, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={styles.inner}>
          <View style={styles.left}>
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Image
                  source={require('@/assets/navigation/left.png')}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.spacer} />
            )}
          </View>

          <View style={styles.center} pointerEvents="none">
            <Text numberOfLines={1} style={styles.title}>Lune</Text>
          </View>

          <View style={styles.right} />
        </View>
      </LinearGradient>

      {/* subtle bottom fade to help blend with content */}
      <LinearGradient
        colors={['rgba(248,249,252,0.95)', 'rgba(248,249,252,0.6)', 'transparent']}
        style={styles.bottomFade}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 50,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 + 8 : 20 + 8, // extra top gap
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    width: 60,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 60,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
    backIcon: {
    width: 20,
    height: 20,
  },
  spacer: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: TOP_NAV_HEIGHT - 8,
    height: 44,
    zIndex: 40,
  },
});
