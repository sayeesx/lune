import { supabase } from './supabaseClient';

export type Promotion = {
  id: string;
  title: string;
  desc: string;
  image_url: string | null;
  is_featured: boolean;
  highlight_date: string | null; // YYYY-MM-DD
  start_at: string | null; // ISO timestamp
  end_at: string | null; // ISO timestamp
  priority: number | null;
  status: 'draft' | 'active' | 'archived' | string;
  created_at: string;
  updated_at: string;
};

export type UIPromo = { id: string; title: string; desc: string; imageUrl?: string };

function mapToUI(p: Promotion): UIPromo {
  return { id: p.id, title: p.title, desc: p.desc, imageUrl: p.image_url ?? undefined };
}

export async function listAllPromotions(limit = 20) {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'active')
    .order('priority', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data?.map(mapToUI) ?? [], error } as const;
}

export async function listFeaturedPromotions(limit = 10) {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('priority', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data?.map(mapToUI) ?? [], error } as const;
}

export async function listTodayHighlights(limit = 10) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'active')
    .eq('highlight_date', today)
    .order('priority', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data?.map(mapToUI) ?? [], error } as const;
}
