import { colors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    const email = await AsyncStorage.getItem('userEmail');
    setUserEmail(email);
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userEmail']);
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {userEmail && <Text style={styles.email}>{userEmail}</Text>}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signOutButton: {
    backgroundColor: colors.error,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});