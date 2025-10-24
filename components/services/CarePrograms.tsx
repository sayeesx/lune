// components/services/CarePrograms.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Section } from '../ui/Section';
import { Promo, PromoCard } from '../cards/PromoCard';
import { router } from 'expo-router';

export function CarePrograms({ data, loading }: { data: Promo[]; loading: boolean }) {
  const placeholders: Promo[] = Array.from({ length: 4 }).map((_, i) => ({
    id: `cp-ph-${i}`,
    title: 'Loading',
    desc: 'Loading...',
    imageUrl: undefined,
    navPath: undefined,
    navParams: undefined,
  }));
  const items = loading ? placeholders : data;

  return (
    <Section title="Care Programs">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((it) => {
          const onPress = it.navPath
            ? () => {
                if (it.navParams) router.push({ pathname: it.navPath as any, params: it.navParams as any });
                else router.push(it.navPath as any);
              }
            : undefined;
          return (
            <View key={it.id} style={{ marginRight: 12 }}>
              <PromoCard item={it} loading={loading} onPress={onPress} />
            </View>
          );
        })}
      </ScrollView>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingHorizontal: 2 },
});
