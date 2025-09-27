import { supabase } from '@/lib/supabaseClient';
import { getMyProfile, updateMyProfile, type Profile } from '@/lib/profiles';
import { colors } from '@/theme/colors';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(''); // YYYY-MM-DD
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await getMyProfile();
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? '');
        setEmail(data.email ?? '');
        setPhone(data.phone ?? '');
        setDob(data.date_of_birth ?? '');
        setGender(data.gender ?? '');
        setLocation(data.location ?? '');
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await updateMyProfile({
        full_name: fullName,
        email,
        phone,
        date_of_birth: dob || null,
        gender,
        location,
      });
      if (error) throw error;
      const { data } = await getMyProfile();
      if (data) setProfile(data);
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Update failed', e.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await AsyncStorage.removeItem('userToken');
      router.replace('/auth/login');
    } catch (error) {
      await AsyncStorage.removeItem('userToken');
      router.replace('/auth/login');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {editing ? (
            <TouchableOpacity style={[styles.primaryBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditing(true)}>
              <Text style={styles.secondaryBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dangerBtn} onPress={handleSignOut}>
            <Text style={styles.dangerBtnText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Field label="Full name" value={fullName} onChange={setFullName} editable={editing} placeholder="Your full name" />
        <Field label="Email" value={email} onChange={setEmail} editable={editing} placeholder="you@example.com" keyboardType="email-address" />
        <Field label="Phone" value={phone} onChange={setPhone} editable={editing} placeholder="+91 98765 43210" keyboardType="phone-pad" />
        <Field label="Date of birth" value={dob} onChange={setDob} editable={editing} placeholder="YYYY-MM-DD" />
        <Field label="Gender" value={gender} onChange={setGender} editable={editing} placeholder="Male/Female/Other" />
        <Field label="Location" value={location} onChange={setLocation} editable={editing} placeholder="City, Country" />
      </View>
    </ScrollView>
  );
}

function Field({ label, value, onChange, editable, placeholder, keyboardType }: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  editable: boolean;
  placeholder?: string;
  keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={'rgba(0,0,0,0.35)'}
          style={styles.input}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.value}>{value || '-'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.textPrimary },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3,
  },
  label: { fontFamily: 'Inter-Medium', fontSize: 12, color: 'rgba(0,0,0,0.6)', marginBottom: 6 },
  value: { fontFamily: 'Inter-Medium', fontSize: 14, color: colors.textPrimary },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textPrimary,
    backgroundColor: '#FFF'
  },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  primaryBtnText: { color: '#FFF', fontFamily: 'Inter-Bold' },
  secondaryBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  secondaryBtnText: { color: colors.primary, fontFamily: 'Inter-Bold' },
  dangerBtn: { backgroundColor: '#FFECEC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  dangerBtnText: { color: '#FF3B30', fontFamily: 'Inter-Bold' },
});