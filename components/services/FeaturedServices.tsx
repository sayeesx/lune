// components/services/FeaturedServices.tsx
import React from 'react';
import { Promo } from '../cards/PromoCard';
import { PromoCarousel } from '../lists/PromoCarousel';
import { Section } from '../ui/Section';

export function FeaturedServices({ data, loading }: { data: Promo[]; loading: boolean }) {
  return (
    <Section title="Featured Services">
      <PromoCarousel data={data} loading={loading} />
    </Section>
  );
}
