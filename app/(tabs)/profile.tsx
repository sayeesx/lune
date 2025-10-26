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
  Animated,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
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
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMedicalDataModal, setShowMedicalDataModal] = useState(false);
  
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

  // Privacy & Notifications Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shareHealthData, setShareHealthData] = useState(true);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true);
  const [dataAnalytics, setDataAnalytics] = useState(false);
  const [medicalDataAccess, setMedicalDataAccess] = useState(true);
  const [thirdPartyAccess, setThirdPartyAccess] = useState(false);
  const [researchDataSharing, setResearchDataSharing] = useState(false);

  // Modal animations
  const [modalOpacity] = useState(new Animated.Value(0));
  const [modalScale] = useState(new Animated.Value(0.9));
  const [slideModalTranslateY] = useState(new Animated.Value(300));

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (showSignOutModal || showNotificationsModal) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSignOutModal, showNotificationsModal]);

  useEffect(() => {
    if (showPrivacyModal || showTermsModal || showMedicalDataModal) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideModalTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideModalTranslateY, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPrivacyModal, showTermsModal, showMedicalDataModal]);

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#FFC107' };
    if (bmiValue >= 18.5 && bmiValue < 25) return { category: 'Normal', color: COLORS.blue };
    if (bmiValue >= 25 && bmiValue < 30) return { category: 'Overweight', color: '#FFC107' };
    return { category: 'Obese', color: '#F44336' };
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

        if (data.privacy_settings) {
          const privacy = data.privacy_settings as any;
          setNotificationsEnabled(privacy.notifications_enabled ?? true);
          setShareHealthData(privacy.share_health_data ?? true);
          setPersonalizedRecommendations(privacy.personalized_recommendations ?? true);
          setDataAnalytics(privacy.data_analytics ?? false);
          setMedicalDataAccess(privacy.medical_data_access ?? true);
          setThirdPartyAccess(privacy.third_party_access ?? false);
          setResearchDataSharing(privacy.research_data_sharing ?? false);
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

  const handleTurnOffNotifications = async () => {
    try {
      const privacySettings = {
        notifications_enabled: false,
        share_health_data: shareHealthData,
        personalized_recommendations: personalizedRecommendations,
        data_analytics: dataAnalytics,
        medical_data_access: medicalDataAccess,
        third_party_access: thirdPartyAccess,
        research_data_sharing: researchDataSharing,
      };

      const { error } = await updateMyProfile({
        privacy_settings: privacySettings,
      });

      if (error) throw error;

      setNotificationsEnabled(false);
      setShowNotificationsModal(false);

      Toast.show({
        type: 'success',
        text1: 'Notifications Disabled',
        text2: 'You will no longer receive notifications from the app',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update notification settings. Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      const privacySettings = {
        notifications_enabled: notificationsEnabled,
        share_health_data: shareHealthData,
        personalized_recommendations: personalizedRecommendations,
        data_analytics: dataAnalytics,
        medical_data_access: medicalDataAccess,
        third_party_access: thirdPartyAccess,
        research_data_sharing: researchDataSharing,
      };

      const { error } = await updateMyProfile({
        privacy_settings: privacySettings,
      });

      if (error) throw error;

      setShowPrivacyModal(false);

      Toast.show({
        type: 'success',
        text1: 'Privacy Settings Updated',
        text2: 'Your privacy preferences have been saved successfully',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to save privacy settings. Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleSaveMedicalDataAccess = async () => {
    try {
      const privacySettings = {
        notifications_enabled: notificationsEnabled,
        share_health_data: shareHealthData,
        personalized_recommendations: personalizedRecommendations,
        data_analytics: dataAnalytics,
        medical_data_access: medicalDataAccess,
        third_party_access: thirdPartyAccess,
        research_data_sharing: researchDataSharing,
      };

      const { error } = await updateMyProfile({
        privacy_settings: privacySettings,
      });

      if (error) throw error;

      setShowMedicalDataModal(false);

      Toast.show({
        type: 'success',
        text1: 'Medical Data Access Updated',
        text2: 'Your medical data access preferences have been saved',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update medical data access. Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
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

  const getGenderIcon = () => {
    if (gender === 'Male') return 'male';
    if (gender === 'Female') return 'female';
    return 'male-female';
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

          {/* Gender Display - Show only selected with icon */}
          {!editingPersonal ? (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderDisplayContainer}>
                <View style={styles.genderIconCircle}>
                  <Ionicons name={getGenderIcon()} size={20} color={COLORS.blue} />
                </View>
                <Text style={styles.genderDisplayText}>{gender}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderSelector}>
                {(['Male', 'Female', 'Other'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      gender === option && styles.genderOptionActive,
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Ionicons 
                      name={
                        option === 'Male' ? 'male' : 
                        option === 'Female' ? 'female' : 
                        'male-female'
                      } 
                      size={18} 
                      color={gender === option ? COLORS.blue : COLORS.gray} 
                    />
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
          )}

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
            onPress={() => setShowNotificationsModal(true)}
          />
          <SettingsItem
            icon="lock-closed"
            label="Privacy & Permissions"
            onPress={() => setShowPrivacyModal(true)}
          />
          <SettingsItem
            icon="medkit"
            label="Medical Data Access"
            onPress={() => setShowMedicalDataModal(true)}
          />
          <SettingsItem
            icon="document-text"
            label="Terms & Conditions"
            onPress={() => setShowTermsModal(true)}
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
        animationType="none"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowSignOutModal(false)}
          />
          <Animated.View 
            style={[
              styles.modernModalContainer,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <View style={styles.modernModalIconContainer}>
              <LinearGradient
                colors={['#FF3B30', '#C62828']}
                style={styles.modernModalIconGradient}
              >
                <Ionicons name="log-out-outline" size={32} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.modernModalTitle}>Sign Out</Text>
            <Text style={styles.modernModalMessage}>
              Are you sure you want to sign out of your account?
            </Text>

            <View style={styles.modernModalButtons}>
              <TouchableOpacity
                style={[styles.modernModalButton, styles.modernModalButtonSecondary]}
                onPress={() => setShowSignOutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modernModalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modernModalButton, styles.modernModalButtonPrimary]}
                onPress={handleSignOutConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF3B30', '#C62828']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernModalButtonGradient}
                >
                  <Text style={styles.modernModalButtonTextPrimary}>Sign Out</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowNotificationsModal(false)}
          />
          <Animated.View 
            style={[
              styles.modernModalContainer,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <View style={styles.modernModalIconContainer}>
              <LinearGradient
                colors={[COLORS.blue, COLORS.deepBlue]}
                style={styles.modernModalIconGradient}
              >
                <Ionicons name="notifications-off" size={32} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.modernModalTitle}>Turn Off Notifications?</Text>
            <Text style={styles.modernModalMessage}>
              You won't receive health reminders, appointment alerts, or important updates
            </Text>

            <View style={styles.modernModalButtons}>
              <TouchableOpacity
                style={[styles.modernModalButton, styles.modernModalButtonSecondary]}
                onPress={() => setShowNotificationsModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modernModalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modernModalButton, styles.modernModalButtonPrimary]}
                onPress={handleTurnOffNotifications}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernModalButtonGradient}
                >
                  <Text style={styles.modernModalButtonTextPrimary}>Turn Off</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Privacy & Permissions Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowPrivacyModal(false)}
          />
          <Animated.View 
            style={[
              styles.modernSlideModal,
              {
                opacity: modalOpacity,
                transform: [{ translateY: slideModalTranslateY }],
              },
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modernModalHeader}>
              <View style={styles.modernModalHeaderIcon}>
                <Ionicons name="lock-closed" size={24} color={COLORS.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modernSlideModalTitle}>Privacy & Permissions</Text>
                <Text style={styles.modernSlideModalSubtitle}>Manage your data preferences</Text>
              </View>
            </View>

            <ScrollView style={styles.modernToggleContainer} showsVerticalScrollIndicator={false}>
              <ModernToggleItem
                icon="fitness"
                label="Share Health Data with AI"
                description="Allow AI to analyze your health data for personalized insights"
                value={shareHealthData}
                onValueChange={setShareHealthData}
              />
              <ModernToggleItem
                icon="bulb"
                label="Personalized Recommendations"
                description="Receive tailored health suggestions based on your profile"
                value={personalizedRecommendations}
                onValueChange={setPersonalizedRecommendations}
              />
              <ModernToggleItem
                icon="bar-chart"
                label="Data Analytics"
                description="Help improve features through anonymous usage data"
                value={dataAnalytics}
                onValueChange={setDataAnalytics}
              />
            </ScrollView>

            <View style={styles.modernModalFooter}>
              <TouchableOpacity
                style={styles.modernFullWidthButton}
                onPress={handleSavePrivacySettings}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernFullWidthButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.modernFullWidthButtonText}>Save Preferences</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Medical Data Access Modal */}
      <Modal
        visible={showMedicalDataModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowMedicalDataModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowMedicalDataModal(false)}
          />
          <Animated.View 
            style={[
              styles.modernSlideModal,
              {
                opacity: modalOpacity,
                transform: [{ translateY: slideModalTranslateY }],
              },
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modernModalHeader}>
              <View style={styles.modernModalHeaderIcon}>
                <Ionicons name="medkit" size={24} color={COLORS.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modernSlideModalTitle}>Medical Data Access</Text>
                <Text style={styles.modernSlideModalSubtitle}>Control who can access your medical records</Text>
              </View>
            </View>

            <ScrollView style={styles.modernToggleContainer} showsVerticalScrollIndicator={false}>
              <ModernToggleItem
                icon="pulse"
                label="AI Health Assistant"
                description="Enable AI to access medical records for diagnosis support"
                value={medicalDataAccess}
                onValueChange={setMedicalDataAccess}
              />
              <ModernToggleItem
                icon="people"
                label="Healthcare Providers"
                description="Share data with verified medical professionals"
                value={thirdPartyAccess}
                onValueChange={setThirdPartyAccess}
              />
              <ModernToggleItem
                icon="flask"
                label="Research Data Sharing"
                description="Contribute anonymously to medical research studies"
                value={researchDataSharing}
                onValueChange={setResearchDataSharing}
              />
            </ScrollView>

            <View style={styles.modernModalFooter}>
              <TouchableOpacity
                style={styles.modernFullWidthButton}
                onPress={handleSaveMedicalDataAccess}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernFullWidthButtonGradient}
                >
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.modernFullWidthButtonText}>Update Access</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowTermsModal(false)}
          />
          <Animated.View 
            style={[
              styles.modernSlideModal,
              {
                opacity: modalOpacity,
                transform: [{ translateY: slideModalTranslateY }],
              },
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modernModalHeader}>
              <View style={styles.modernModalHeaderIcon}>
                <Ionicons name="document-text" size={24} color={COLORS.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modernSlideModalTitle}>Terms & Conditions</Text>
                <Text style={styles.modernSlideModalSubtitle}>Last updated: October 2025</Text>
              </View>
            </View>

            <ScrollView style={styles.termsScrollContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>1</Text>
                  </View>
                  <Text style={styles.termsHeading}>Acceptance of Terms</Text>
                </View>
                <Text style={styles.termsText}>
                  By accessing and using Lune AI Health App, you accept and agree to be bound by the terms and provision of this agreement.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>2</Text>
                  </View>
                  <Text style={styles.termsHeading}>Use of Service</Text>
                </View>
                <Text style={styles.termsText}>
                  Lune provides AI-powered health insights and is not a substitute for professional medical advice. Always consult with qualified healthcare providers for medical decisions.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>3</Text>
                  </View>
                  <Text style={styles.termsHeading}>Privacy and Data Protection</Text>
                </View>
                <Text style={styles.termsText}>
                  We take your privacy seriously. Your health data is encrypted and stored securely. We will never sell your personal information to third parties.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>4</Text>
                  </View>
                  <Text style={styles.termsHeading}>User Responsibilities</Text>
                </View>
                <Text style={styles.termsText}>
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>5</Text>
                  </View>
                  <Text style={styles.termsHeading}>Medical Disclaimer</Text>
                </View>
                <Text style={styles.termsText}>
                  The information provided by Lune is for informational purposes only. It should not be considered as medical advice, diagnosis, or treatment.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>6</Text>
                  </View>
                  <Text style={styles.termsHeading}>Limitation of Liability</Text>
                </View>
                <Text style={styles.termsText}>
                  Lune shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use or inability to use the service.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>7</Text>
                  </View>
                  <Text style={styles.termsHeading}>Changes to Terms</Text>
                </View>
                <Text style={styles.termsText}>
                  We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                </Text>
              </View>

              <View style={[styles.termsSection, { marginBottom: 0 }]}>
                <View style={styles.termsSectionHeader}>
                  <View style={styles.termsSectionNumber}>
                    <Text style={styles.termsSectionNumberText}>8</Text>
                  </View>
                  <Text style={styles.termsHeading}>Contact Information</Text>
                </View>
                <Text style={styles.termsText}>
                  For questions about these Terms & Conditions, please contact our support team at support@lune-health.com
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modernModalFooter}>
              <TouchableOpacity
                style={styles.modernFullWidthButton}
                onPress={() => setShowTermsModal(false)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernFullWidthButtonGradient}
                >
                  <Ionicons name="checkmark-done" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.modernFullWidthButtonText}>I Understand</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
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
          style={styles.input}
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

// Modern Toggle Item Component
function ModernToggleItem({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: any;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.modernToggleItem}>
      <View style={styles.modernToggleIconContainer}>
        <Ionicons name={icon} size={20} color={COLORS.blue} />
      </View>
      <View style={styles.modernToggleTextContainer}>
        <Text style={styles.modernToggleLabel}>{label}</Text>
        <Text style={styles.modernToggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.gray + '30', true: COLORS.blue + '50' }}
        thumbColor={value ? COLORS.blue : COLORS.white}
        ios_backgroundColor={COLORS.gray + '30'}
        style={{ transform: [{ scale: 0.9 }] }}
      />
    </View>
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
    opacity: 1,
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
  genderDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue + '10',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.blue + '30',
  },
  genderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  genderDisplayText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.blue,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderOptionActive: {
    backgroundColor: COLORS.blue + '15',
    borderColor: COLORS.blue,
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
  // Modern Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modernModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  modernModalIconContainer: {
    marginBottom: 20,
  },
  modernModalIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modernModalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 8,
    textAlign: 'center',
  },
  modernModalMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  modernModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modernModalButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modernModalButtonSecondary: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray + '30',
  },
  modernModalButtonPrimary: {
    overflow: 'hidden',
  },
  modernModalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernModalButtonTextSecondary: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
  },
  modernModalButtonTextPrimary: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  // Slide Modal Styles
  modernSlideModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.gray + '40',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modernModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '20',
  },
  modernModalHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modernSlideModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  modernSlideModalSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
  },
  modernToggleContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: 380,
  },
  modernToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray + '20',
  },
  modernToggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modernToggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  modernToggleLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  modernToggleDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.gray,
    lineHeight: 18,
  },
  modernModalFooter: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '20',
  },
  modernFullWidthButton: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modernFullWidthButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernFullWidthButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  // Terms Styles
  termsScrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: 400,
  },
  termsSection: {
    marginBottom: 24,
  },
  termsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termsSectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  termsSectionNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.blue,
  },
  termsHeading: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.charcoal,
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.darkGray,
    lineHeight: 22,
    paddingLeft: 44,
  },
});
