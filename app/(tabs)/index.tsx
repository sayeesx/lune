// app/(tabs)/index.tsx
import { getFeaturedCards, getTodayHighlightCards, type UIPromo } from '@/lib/home';
import { supabase } from '@/lib/supabaseClient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PromoCarousel } from '../../components/lists/PromoCarousel';
import { CarePrograms } from '../../components/services/CarePrograms';
import type { Tool } from '../../components/tools/ToolGrid';
import { ToolGrid } from '../../components/tools/ToolGrid';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Section } from '../../components/ui/Section';
import { colors, radii } from '../../theme/colors';

// Display name from auth session (fallback to 'there')
const DEFAULT_NAME = 'there';

const tools: Tool[] = [
  { key: 'ai-doctor', icon: 'stethoscope', label: 'AI Doctor', onPress: () => router.push('/(features)/ai-doctor') },
  { key: 'rx-scan', icon: 'file-search-outline', label: 'Rx Scan', onPress: () => router.push('/(features)/rx-scan') },
  { key: 'med-guide', icon: 'pill', label: 'MedGuide', onPress: () => router.push('/(features)/med-guide') },
  { key: 'lab-sense', icon: 'flask-outline', label: 'LabSense', onPress: () => router.push('/(features)/lab-sense') },
  { key: 'scan-vision', icon: 'image-search-outline', label: 'ScanVision', onPress: () => router.push('/(features)/scan-vision') },
  { key: 'symptom-ai', icon: 'heart-pulse', label: 'SymptomAI', onPress: () => router.push('/(features)/symptom-ai') },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loadingPromos, setLoadingPromos] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [featuredPromos, setFeaturedPromos] = useState<UIPromo[]>([]);
  const [todayPromos, setTodayPromos] = useState<UIPromo[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>(DEFAULT_NAME);
  const [notifications, setNotifications] = useState<Array<{ id: string; title?: string; body?: string; created_at?: string; read?: boolean }>>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifLoading, setNotifLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const fullName = (session?.user?.user_metadata?.full_name as string | undefined)?.trim();
      if (fullName && fullName.length > 0) {
        setDisplayName(fullName.split(' ')[0]);
      } else {
        const email = session?.user?.email ?? '';
        if (email) setDisplayName(email.split('@')[0]);
      }

      // Profiles table fallback
      const userId = session?.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle();
        const pName = (profile?.full_name as string | undefined)?.trim();
        if (pName && pName.length > 0) setDisplayName(pName.split(' ')[0]);
      }

      // Initial data
      await Promise.all([
        fetchNotifications(),
        fetchHomeCards(),
      ]);
    })();
  }, []);

  const fetchNotifications = async () => {
    setNotifLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) { setNotifications([]); setUnreadCount(0); setNotifLoading(false); return; }
    const { data, error } = await supabase
      .from('notifications')
      .select('id,title,body,created_at,read')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data as any);
      setUnreadCount((data as any).filter((n: any) => !n.read).length);
    }
    setNotifLoading(false);
  };

  const fetchHomeCards = async () => {
    setLoadingPromos(true);
    const [featured, today] = await Promise.all([
      getFeaturedCards(10),
      getTodayHighlightCards(10),
    ]);
    if (!featured.error && featured.data) setFeaturedPromos(featured.data);
    if (!today.error && today.data) setTodayPromos(today.data);
    setLoadingPromos(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchHomeCards()]);
    setRefreshing(false);
  }, []);

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    await fetchNotifications();
  };

  return (
    <SafeAreaView style={[styles.screen]} edges={['bottom']}> 
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
      >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryAlt]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 56 }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hey, {displayName}</Text>
          <Text style={styles.subGreeting}>Your AI-powered healthcare assistant</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={async () => { await fetchNotifications(); setNotificationsOpen(true); }}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Featured */}
      <Section title="Featured" subtitle="Don’t miss these">
        <PromoCarousel data={featuredPromos} loading={loadingPromos} />
      </Section>

      {/* AI Tools grid */}
      <Section title="AI Tools" subtitle="Quick access to features">
        <ToolGrid tools={tools} />
      </Section>

      {/* Today’s Highlights */}
      <Section title="Today’s Highlights" subtitle="Handpicked for you">
        <PromoCarousel data={todayPromos} loading={loadingPromos} />
      </Section>

      {/* Renamed old Featured Services → Care Programs (gradient) */}
      <CarePrograms />

      </ScrollView>

      {/* Notifications Bottom Sheet (render outside ScrollView to avoid being clipped/scroll-attached) */}
      <BottomSheet visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} snapPercent={0.6}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: colors.textPrimary }}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead} disabled={notifLoading}>
            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.primary }}>{notifLoading ? '...' : 'Mark all as read'}</Text>
          </TouchableOpacity>
        </View>
        {notifications.length === 0 ? (
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textSecondary }}>No notifications.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(n) => n.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 10, paddingHorizontal: 6, borderRadius: 12, backgroundColor: item.read ? '#FAFAFB' : '#EEF2FF' }}>
                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: colors.textPrimary }} numberOfLines={2}>{item.title || 'Notification'}</Text>
                {item.body ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary, marginTop: 4 }} numberOfLines={3}>{item.body}</Text> : null}
                {item.created_at ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: 'rgba(0,0,0,0.45)', marginTop: 6 }}>{new Date(item.created_at).toLocaleString()}</Text> : null}
              </View>
            )}
          />
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1 },
  header: {
    paddingTop: 84, paddingBottom: 36, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: radii.xl, borderBottomRightRadius: radii.xl,
  },
  greeting: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter-Bold', letterSpacing: 0.2 },
  subGreeting: { color: 'rgba(255,255,255,0.88)', fontSize: 13, marginTop: 6, fontFamily: 'Inter-Regular' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFF', fontSize: 10, fontFamily: 'Inter-Bold' },
  avatarWrap: { },
  avatar: { },
});
