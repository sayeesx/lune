// components/cards/PromoCard.tsx
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, radii } from '../../theme/colors';

export type Promo = {
  id: string;
  title: string;
  desc: string;
  imageUrl?: string;
  navPath?: string;
  navParams?: Record<string, any>;
};

export function PromoCard({ item, loading, onPress }: { item: Promo; loading: boolean; onPress?: () => void }) {
  if (loading) {
    return (
      <View style={[styles.card, styles.skeletonCard]}> 
        <View style={[styles.skeleton, { width: 140, height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeleton, { width: 180, height: 12 }]} />
      </View>
    );
  }

  const Content = (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} accessibilityRole="button">
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  imageWrap: { width: '100%', height: 200, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: '#F2F3F5' },
  image: { width: '100%', height: '100%' },
  skeletonCard: { backgroundColor: '#FAFAFB', borderColor: 'rgba(0,0,0,0.06)' },
  skeleton: { backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 6 },
});
