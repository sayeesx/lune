// components/lists/PromoCarousel.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Promo, PromoCard } from '../cards/PromoCard';

export function PromoCarousel({ data, loading }: { data: Promo[]; loading: boolean }) {
  const placeholders: Promo[] = Array.from({ length: 4 }).map((_, i) => ({
    id: `ph-${i}`,
    title: 'Loading title',
    desc: 'Loading...',
    imageUrl: undefined,
    navPath: undefined,
    navParams: undefined,
  }));
  const items = loading ? placeholders : data;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((it) => {
        const onPress = it.navPath
          ? () => {
              try {
                if (it.navParams) {
                  router.push({ pathname: it.navPath as any, params: it.navParams as any });
                } else {
                  router.push(it.navPath as any);
                }
              } catch (e) {
                // noop
              }
            }
          : undefined;
        return (
          <View key={it.id} style={{ marginRight: 12 }}>
            <PromoCard item={it} loading={loading} onPress={onPress} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ row: { paddingHorizontal: 2 } });
