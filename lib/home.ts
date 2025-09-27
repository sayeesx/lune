// lib/home.ts
import { supabase } from './supabaseClient';

export type HomeCard = {
  id: string;
  section: 'featured' | 'today' | 'featured_services' | 'care_programs';
  card_no: number; // 1..N within a section
  title: string | null;
  description: string | null; // renamed from 'desc'
  image_url: string | null;
  nav_path: string | null; // expo-router path
  nav_params: Record<string, any> | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type UIPromo = { id: string; title: string; desc: string; imageUrl?: string; navPath?: string; navParams?: Record<string, any> };

function toUI(c: HomeCard): UIPromo {
  return {
    id: c.id,
    title: c.title ?? '',
    desc: c.description ?? '', // map DB 'description' to UI 'desc'
    imageUrl: c.image_url ?? undefined,
    navPath: c.nav_path ?? undefined,
    navParams: c.nav_params ?? undefined,
  };
}

export async function getCards(section: HomeCard['section'], limit = 10) {
  const { data, error } = await supabase
    .from('home_cards')
    .select('*')
    .eq('active', true)
    .eq('section', section)
    .order('card_no', { ascending: true })
    .limit(limit);
  return { data: data?.map(toUI) ?? [], error } as const;
}

export async function getFeaturedCards(limit = 10) {
  return getCards('featured', limit);
}

export async function getTodayHighlightCards(limit = 10) {
  return getCards('today', limit);
}

export async function getFeaturedServicesCards(limit = 10) {
  return getCards('featured_services', limit);
}

export async function getCareProgramsCards(limit = 10) {
  return getCards('care_programs', limit);
}