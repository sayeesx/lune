import { supabase } from './supabaseClient';

export type Profile = {
  id: string; // auth.users.id
  full_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null; // ISO date (YYYY-MM-DD)
  gender: string | null;
  profile_picture_url: string | null;
  location: string | null;
  emergency_contact: any | null; // jsonb
  reminders: any | null; // jsonb
  medical_history: any | null; // jsonb
  current_medications: any | null; // jsonb
  health_goals: any | null; // jsonb
  last_checkup_date: string | null; // ISO date (YYYY-MM-DD)
  settings: any | null; // jsonb
  role: 'user' | 'admin' | string;
  status: 'active' | 'inactive' | string;
  created_at: string;
  updated_at: string;
};

export async function getMyProfile() {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return { data: null, error: null } as const;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  return { data, error } as const;
}

export async function updateMyProfile(update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'role' | 'status'>>) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select('*')
    .single<Profile>();

  return { data, error } as const;
}

// Optional: ensure a profile row exists for the current user (in case the DB trigger failed)
export async function ensureMyProfile() {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return { created: false } as const;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return { created: false } as const;

  const payload = {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
    phone: user.phone ?? null,
    profile_picture_url: user.user_metadata?.avatar_url ?? null,
  };

  const { error: insertErr } = await supabase.from('profiles').insert(payload);
  if (insertErr) throw insertErr;
  return { created: true } as const;
}
