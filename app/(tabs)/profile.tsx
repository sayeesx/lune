import { getMyProfile, updateMyProfile, type Profile } from '@/lib/profiles';
import { supabase } from '@/lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const COLORS = {
  white: '#FFFFFF',
  blue: '#2652F9',
  deepBlue: '#032EA6',
  charcoal: '#100F15',
  gray: '#9199B1',
  darkGray: '#4A4A4D',
  background: '#F8F9FC',
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  // Edit mode for cards
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [location, setLocation] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#FFC107' }; // Yellow
    if (bmiValue >= 18.5 && bmiValue < 25) return { category: 'Normal', color: COLORS.blue }; // Blue
    if (bmiValue >= 25 && bmiValue < 30) return { category: 'Overweight', color: '#FFC107' }; // Yellow
    return { category: 'Obese', color: '#F44336' }; // Red
  };

  const validateAndCalculateBMI = (weightStr: string, heightStr: string): { valid: boolean; bmi: number | null; error?: string } => {
    const weightKg = parseFloat(weightStr);
    const heightCm = parseFloat(heightStr);

    if (!weightStr || !heightStr) {
      return { valid: true, bmi: null };
    }

    if (isNaN(weightKg) || isNaN(heightCm) || weightKg <= 0 || heightCm <= 0) {
      return { valid: false, bmi: null, error: 'Please enter valid weight and height values' };
    }

    if (weightKg < 20 || weightKg > 300) {
      return { valid: false, bmi: null, error: 'Please enter a realistic weight between 20-300 kg' };
    }

    if (heightCm < 50 || heightCm > 300) {
      return { valid: false, bmi: null, error: 'Please enter a realistic height between 50-300 cm' };
    }

    const heightM = heightCm / 100;
    const calculatedBMI = weightKg / (heightM * heightM);
    return { valid: true, bmi: parseFloat(calculatedBMI.toFixed(1)) };
  };

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        await supabase.auth.signOut();
        router.replace('/auth/login');
        return;
      }

      const { data, error } = await getMyProfile();
      if (error) {
        console.error('Error fetching profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Error Loading Profile',
          text2: error.message || 'Unable to load your profile data. Please try again.',
          position: 'top',
          topOffset: 60,
          visibilityTime: 4000,
        });
        return;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? '');
        setEmail(data.email ?? '');
        setPhone(data.phone ?? '');
        setGender((data.gender as any) ?? 'Male');
        setLocation(data.location ?? '');
        
        if (data.health_goals) {
          const goals = data.health_goals as any;
          setWeight(goals.weight?.toString() ?? '');
          setHeight(goals.height?.toString() ?? '');
          setBmi(goals.bmi ?? null);
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load profile. Please check your connection and try again.',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
    Toast.show({
      type: 'success',
      text1: 'Profile Refreshed',
      text2: 'Your profile data has been updated successfully',
      position: 'top',
      topOffset: 60,
      visibilityTime: 2000,
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'info',
          text1: 'Permission Required',
          text2: 'Please grant camera roll permissions to update your profile picture',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3500,
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        
        const imageUri = result.assets[0].uri;
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await updateMyProfile({
          profile_picture_url: imageUri,
        });
        
        await loadProfile();
        setUploadingImage(false);
        
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your profile picture has been updated successfully',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Failed to update profile picture. Please try again or contact support.',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3500,
      });
      setUploadingImage(false);
    }
  };

  const handleSavePersonalDetails = async () => {
    try {
      setSavingPersonal(true);

      if (!fullName.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter your full name before saving',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        });
        setSavingPersonal(false);
        return;
      }

      // Validate and calculate BMI
      const bmiResult = validateAndCalculateBMI(weight, height);
      
      if (!bmiResult.valid) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: bmiResult.error || 'Please check your weight and height values',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3500,
        });
        setSavingPersonal(false);
        return;
      }

      // Prepare health goals with BMI
      const healthGoals = {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        bmi: bmiResult.bmi,
      };

      const { error } = await updateMyProfile({
        full_name: fullName,
        gender,
        health_goals: healthGoals,
      });
      
      if (error) throw error;
      
      // Update local BMI state only after successful save
      setBmi(bmiResult.bmi);
      
      setEditingPersonal(false);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Your personal details have been updated successfully',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
      });
      await loadProfile();
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: e.message || 'Unable to update personal details. Please try again.',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3500,
      });
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleSaveLocation = async () => {
    try {
      setSavingLocation(true);
      
      const { error } = await updateMyProfile({
        location,
      });
      
      if (error) throw error;
      
      setEditingLocation(false);
      Toast.show({
        type: 'success',
        text1: 'Location Updated',
        text2: 'Your location has been saved successfully',
        position: 'top',
        topOffset: 60,
        visibilityTime: 2500,
      });
      await loadProfile();
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: e.message || 'Unable to update location. Please try again.',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSavingLocation(false);
    }
  };

  const handleContactFieldPress = (field: string) => {
    Toast.show({
      type: 'info',
      text1: 'Contact Customer Support',
      text2: `To update your ${field}, please contact our customer support team for assistance.`,
      position: 'top',
      topOffset: 60,
      visibilityTime: 4000,
    });
  };

  const handleSignOutConfirm = async () => {
    setShowSignOutModal(false);
    await AsyncStorage.clear();
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  const getInitials = () => {
    return (fullName || email || 'U')
      .split(' ')
      .map(s => s[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.blue}
            colors={[COLORS.blue]}
          />
        }
      >
        <LinearGradient
          colors={[COLORS.blue + '15', 'transparent']}
          style={styles.headerGradient}
        />

        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8} disabled={uploadingImage}>
            <View style={styles.avatarContainer}>
              {profile?.profile_picture_url ? (
                <Image
                  source={{ uri: profile.profile_picture_url }}
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </LinearGradient>
              )}
              
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.white} />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              
              {!uploadingImage && (
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={18} color={COLORS.white} />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{fullName || 'Welcome'}</Text>
          <Text style={styles.userSubtitle}>Lune : AI That Understands Your Health.</Text>
        </View>

        {/* Health Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart" size={20} color="#FF3B30" />
            <Text style={styles.cardTitle}>Health Summary</Text>
          </View>
          <View style={styles.healthStats}>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                bmi && { color: getBMICategory(bmi).color }
              ]}>
                {bmi ? bmi.toFixed(1) : '--'}
              </Text>
              <Text style={styles.statLabel}>BMI</Text>
              {bmi && (
                <Text style={[styles.bmiCategory, { color: getBMICategory(bmi).color }]}>
                  {getBMICategory(bmi).category}
                </Text>
              )}
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.last_checkup_date ? 
                  new Date(profile.last_checkup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                  : '--'
                }
              </Text>
              <Text style={styles.statLabel}>Last Checkup</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
          </View>
        </View>

        {/* Personal Details with Edit Mode */}
        <View style={[styles.card, styles.personalDetailsCard]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="person" size={20} color={COLORS.blue} />
              </View>
              <Text style={styles.cardTitle}>Personal Details</Text>
            </View>
            
            {editingPersonal ? (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePersonalDetails}
                disabled={savingPersonal}
              >
                {savingPersonal ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => setEditingPersonal(true)}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={22} color={COLORS.blue} />
              </TouchableOpacity>
            )}
          </View>

          <EditableField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            icon="person-outline"
            editable={editingPersonal}
          />

          {/* Gender Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderSelector}>
              {(['Male', 'Female', 'Other'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    gender === option && styles.genderOptionActive,
                    !editingPersonal && styles.genderOptionDisabled,
                  ]}
                  onPress={() => editingPersonal && setGender(option)}
                  disabled={!editingPersonal}
                >
                  <Text style={[
                    styles.genderOptionText,
                    gender === option && styles.genderOptionTextActive,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <EditableField
                label="Weight (kg)"
                value={weight}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setWeight(cleaned);
                }}
                icon="scale-outline"
                keyboardType="decimal-pad"
                editable={editingPersonal}
                placeholder="70"
              />
            </View>
            <View style={{ width: 16 }} />
            <View style={{ flex: 1 }}>
              <EditableField
                label="Height (cm)"
                value={height}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setHeight(cleaned);
                }}
                icon="resize-outline"
                keyboardType="decimal-pad"
                editable={editingPersonal}
                placeholder="170"
              />
            </View>
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="call" size={20} color={COLORS.blue} />
              </View>
              <Text style={styles.cardTitle}>Contact Details</Text>
            </View>
            {editingLocation ? (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveLocation}
                disabled={savingLocation}
              >
                {savingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => setEditingLocation(true)}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={22} color={COLORS.blue} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity onPress={() => handleContactFieldPress('email')} activeOpacity={0.7}>
            <EditableField
              label="Email"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              editable={false}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleContactFieldPress('phone number')} activeOpacity={0.7}>
            <EditableField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              icon="call-outline"
              keyboardType="phone-pad"
              editable={false}
            />
          </TouchableOpacity>

          <EditableField
            label="Location"
            value={location}
            onChangeText={setLocation}
            icon="location-outline"
            placeholder="City, Country"
            editable={editingLocation}
          />
        </View>

        {/* Settings Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="settings" size={20} color={COLORS.blue} />
            </View>
            <Text style={styles.cardTitle}>Settings</Text>
          </View>
          <SettingsItem
            icon="notifications"
            label="Notifications"
            onPress={() => {}}
          />
          <SettingsItem
            icon="lock-closed"
            label="Privacy & Permissions"
            onPress={() => {}}
          />
          <SettingsItem
            icon="medkit"
            label="Medical Data Access"
            onPress={() => {}}
          />
          <SettingsItem
            icon="document-text"
            label="Terms & Conditions"
            onPress={() => {}}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={() => setShowSignOutModal(true)}
          style={styles.signOutButton}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#FF3B30', '#C62828']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signOutGradient}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out-outline" size={48} color={COLORS.blue} />
            </View>
            
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowSignOutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonTextCancel}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSignOutConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF3B30', '#C62828']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonTextConfirm}>Yes, Sign Out</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSignOutModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Editable Field Component
function EditableField({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  placeholder,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: any;
  keyboardType?: any;
  placeholder?: string;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, !editable && styles.inputRowDisabled]}>
        <Ionicons name={icon} size={18} color={editable ? COLORS.charcoal : COLORS.gray} style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.gray + '80'}
          style={[styles.input, !editable && styles.inputDisabled]}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
    </View>
  );
}

// Settings Item Component
function SettingsItem({
  icon,
  label,
  onPress,
  showChevron = true,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsLeft}>
        <View style={styles.settingsIconContainer}>
          <Ionicons name={icon} size={18} color={COLORS.blue} />
        </View>
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.white,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.blue,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  personalDetailsCard: {
    borderWidth: 2,
    borderColor: COLORS.blue + '20',
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.blue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.charcoal,
  },
  bmiCategory: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray + '30',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: COLORS.charcoal,
  },
  inputDisabled: {
    opacity: 0.8,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderOptionActive: {
    backgroundColor: COLORS.blue + '15',
    borderColor: COLORS.blue,
  },
  genderOptionDisabled: {
    opacity: 0.6,
  },
  genderOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
  },
  genderOptionTextActive: {
    color: COLORS.blue,
    fontFamily: 'Inter-Bold',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '20',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonConfirm: {
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
