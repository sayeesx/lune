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
  Dimensions,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ProfileScreenSkeleton from '@/components/ProfileScreenSkeleton';
import AgePicker from '@/components/AgePicker';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

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
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMedicalDataModal, setShowMedicalDataModal] = useState(false);
  const [showAgePickerModal, setShowAgePickerModal] = useState(false);
  const [turningOffNotifications, setTurningOffNotifications] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingMedicalData, setSavingMedicalData] = useState(false);
  
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
  const [age, setAge] = useState<number>(18);
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
  const [slideModalTranslateY] = useState(new Animated.Value(screenHeight));

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
    if (showPrivacyModal || showTermsModal || showMedicalDataModal || showAgePickerModal) {
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
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPrivacyModal, showTermsModal, showMedicalDataModal, showAgePickerModal]);

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
        setAge(data.age ?? 18);
        
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
        age,
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
      setTurningOffNotifications(true);
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
    } finally {
      setTurningOffNotifications(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      setSavingPrivacy(true);
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
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleSaveMedicalDataAccess = async () => {
    try {
      setSavingMedicalData(true);
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
    } finally {
      setSavingMedicalData(false);
    }
  };

  const handleSignOutConfirm = async () => {
    try {
      setSigningOut(true);
      await AsyncStorage.clear();
      await supabase.auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
      setShowSignOutModal(false);
    }
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
    return <ProfileScreenSkeleton />;
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
              <View style={styles.avatarWrapper}>
                {profile?.profile_picture_url ? (
                  <Image
                    source={{ uri: profile.profile_picture_url }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('@/assets/home-icons/profile.png')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                )}

                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.white} />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
              </View>

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
                { ...(typeof bmi === 'number' ? { color: getBMICategory(bmi).color } : {}) }
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
              <Text style={styles.statValue}>{age}</Text>
              <Text style={styles.statLabel}>Age</Text>
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

          {/* Age Picker */}
          {!editingPersonal ? (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Age</Text>
              <View style={styles.ageDisplayContainer}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.charcoal} style={styles.inputIcon} />
                <Text style={styles.ageDisplayText}>{age} years old</Text>
              </View>
            </View>
          ) : (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Age</Text>
              <TouchableOpacity 
                style={styles.agePickerButton}
                onPress={() => setShowAgePickerModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.charcoal} style={styles.inputIcon} />
                <Text style={styles.agePickerButtonText}>{age} years old</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          )}

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

      {/* Age Picker Modal */}
      <Modal
        visible={showAgePickerModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowAgePickerModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAgePickerModal(false)}
          />
          <Animated.View 
            style={[
              styles.slideUpModal,
              { transform: [{ translateY: slideModalTranslateY }] },
            ]}
          >
            <View style={styles.slideUpModalHandle} />
            
            <View style={styles.slideUpModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.slideUpModalIconContainer}>
                  <Ionicons name="calendar" size={24} color={COLORS.blue} />
                </View>
                <Text style={styles.slideUpModalTitle}>Select Your Age</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAgePickerModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.agePickerContainer}>
              <AgePicker value={age} onChange={setAge} />
            </View>

            <View style={[styles.slideUpModalFooter, { paddingBottom: insets.bottom || 20 }]}>
              <TouchableOpacity
                style={styles.slideUpModalSaveButton}
                onPress={() => setShowAgePickerModal(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.slideUpModalSaveGradient}
                >
                  <Text style={styles.slideUpModalSaveText}>Confirm Age</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="none"
        onRequestClose={() => !signingOut && setShowSignOutModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => !signingOut && setShowSignOutModal(false)}
            disabled={signingOut}
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
                disabled={signingOut}
              >
                <Text style={styles.modernModalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modernModalButton, styles.modernModalButtonPrimary]}
                onPress={handleSignOutConfirm}
                activeOpacity={0.8}
                disabled={signingOut}
              >
                <LinearGradient
                  colors={['#FF3B30', '#C62828']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernModalButtonGradient}
                >
                  {signingOut ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.modernModalButtonTextPrimary}>Sign Out</Text>
                  )}
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
                <Ionicons name="notifications" size={32} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.modernModalTitle}>
              {notificationsEnabled ? 'Turn Off Notifications?' : 'Enable Notifications?'}
            </Text>
            <Text style={styles.modernModalMessage}>
              {notificationsEnabled 
                ? 'You will no longer receive notifications about your health updates, reminders, and important alerts.'
                : 'Stay informed about your health updates, medication reminders, and important alerts.'}
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
                disabled={turningOffNotifications}
              >
                <LinearGradient
                  colors={notificationsEnabled ? ['#FF3B30', '#C62828'] : [COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modernModalButtonGradient}
                >
                  {turningOffNotifications ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.modernModalButtonTextPrimary}>
                      {notificationsEnabled ? 'Turn Off' : 'Enable'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Privacy Settings Modal */}
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
              styles.slideUpModal,
              { transform: [{ translateY: slideModalTranslateY }] },
            ]}
          >
            <View style={styles.slideUpModalHandle} />
            
            <View style={styles.slideUpModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.slideUpModalIconContainer}>
                  <Ionicons name="lock-closed" size={24} color={COLORS.blue} />
                </View>
                <Text style={styles.slideUpModalTitle}>Privacy & Permissions</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.slideUpModalContent}
              showsVerticalScrollIndicator={false}
            >
              <ModernToggleItem
                icon="share-social"
                label="Share Health Data"
                description="Allow Lune to analyze and provide insights on your health data"
                value={shareHealthData}
                onValueChange={setShareHealthData}
              />
              
              <ModernToggleItem
                icon="bulb"
                label="Personalized Recommendations"
                description="Get AI-powered health recommendations tailored to your needs"
                value={personalizedRecommendations}
                onValueChange={setPersonalizedRecommendations}
              />
              
              <ModernToggleItem
                icon="stats-chart"
                label="Data Analytics"
                description="Allow anonymous usage data to improve the app experience"
                value={dataAnalytics}
                onValueChange={setDataAnalytics}
              />
            </ScrollView>

            <View style={[styles.slideUpModalFooter, { paddingBottom: insets.bottom || 20 }]}>
              <TouchableOpacity
                style={styles.slideUpModalSaveButton}
                onPress={handleSavePrivacySettings}
                activeOpacity={0.8}
                disabled={savingPrivacy}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.slideUpModalSaveGradient}
                >
                  {savingPrivacy ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.slideUpModalSaveText}>Save Settings</Text>
                  )}
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
              styles.slideUpModal,
              { transform: [{ translateY: slideModalTranslateY }] },
            ]}
          >
            <View style={styles.slideUpModalHandle} />
            
            <View style={styles.slideUpModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.slideUpModalIconContainer}>
                  <Ionicons name="medkit" size={24} color={COLORS.blue} />
                </View>
                <Text style={styles.slideUpModalTitle}>Medical Data Access</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMedicalDataModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.slideUpModalContent}
              showsVerticalScrollIndicator={false}
            >
              <ModernToggleItem
                icon="shield-checkmark"
                label="Medical Data Access"
                description="Allow access to your medical records and health history"
                value={medicalDataAccess}
                onValueChange={setMedicalDataAccess}
              />
              
              <ModernToggleItem
                icon="people"
                label="Third-Party Access"
                description="Share data with trusted healthcare providers and partners"
                value={thirdPartyAccess}
                onValueChange={setThirdPartyAccess}
              />
              
              <ModernToggleItem
                icon="flask"
                label="Research Data Sharing"
                description="Contribute anonymized data for medical research purposes"
                value={researchDataSharing}
                onValueChange={setResearchDataSharing}
              />

              <View style={styles.dataInfoBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.blue} />
                <Text style={styles.dataInfoText}>
                  Your medical data is encrypted and securely stored. You have full control over who can access your information.
                </Text>
              </View>
            </ScrollView>

            <View style={[styles.slideUpModalFooter, { paddingBottom: insets.bottom || 20 }]}>
              <TouchableOpacity
                style={styles.slideUpModalSaveButton}
                  onPress={handleSaveMedicalDataAccess}
                activeOpacity={0.8}
                  disabled={savingMedicalData}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.slideUpModalSaveGradient}
                >
                    {savingMedicalData ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.slideUpModalSaveText}>Save Settings</Text>
                    )}
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
              styles.slideUpModal,
              { transform: [{ translateY: slideModalTranslateY }] },
            ]}
          >
            <View style={styles.slideUpModalHandle} />
            
            <View style={styles.slideUpModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.slideUpModalIconContainer}>
                  <Ionicons name="document-text" size={24} color={COLORS.blue} />
                </View>
                <Text style={styles.slideUpModalTitle}>Terms & Conditions</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.slideUpModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.termsText}>
                  By accessing and using Lune, you accept and agree to be bound by the terms and provision of this agreement.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>2. Use of Service</Text>
                <Text style={styles.termsText}>
                  Lune provides AI-powered health consultation and medical information services. This service is not a substitute for professional medical advice, diagnosis, or treatment.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>3. Privacy Policy</Text>
                <Text style={styles.termsText}>
                  Your privacy is important to us. All personal health information is encrypted and stored securely in compliance with HIPAA regulations.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>4. Medical Disclaimer</Text>
                <Text style={styles.termsText}>
                  The information provided by Lune is for informational purposes only. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>5. Data Security</Text>
                <Text style={styles.termsText}>
                  We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>6. User Responsibilities</Text>
                <Text style={styles.termsText}>
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </Text>
              </View>

              <View style={styles.termsFooter}>
                <Text style={styles.termsFooterText}>
                  Last updated: October 2025
                </Text>
                <Text style={styles.termsFooterText}>
                  © 2025 Lune. All rights reserved.
                </Text>
              </View>
            </ScrollView>

            <View style={[styles.slideUpModalFooter, { paddingBottom: insets.bottom || 20 }]}>
              <TouchableOpacity
                style={styles.slideUpModalSaveButton}
                onPress={() => setShowTermsModal(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.deepBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.slideUpModalSaveGradient}
                >
                  <Text style={styles.slideUpModalSaveText}>I Understand</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

// Component Definitions
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
      <View style={styles.modernToggleLeft}>
        <View style={styles.modernToggleIconContainer}>
          <Ionicons name={icon} size={20} color={value ? COLORS.blue : COLORS.gray} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.modernToggleLabel}>{label}</Text>
          <Text style={styles.modernToggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.gray + '40', true: COLORS.blue + '40' }}
        thumbColor={value ? COLORS.blue : COLORS.white}
        ios_backgroundColor={COLORS.gray + '40'}
      />
    </View>
  );
}

// Styles
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
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  borderWidth: 2,
  borderColor: COLORS.blue + '20',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.blue,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
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
    borderColor: COLORS.blue + '15',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.blue + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  bmiCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray + '30',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowDisabled: {
    backgroundColor: COLORS.gray + '10',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  fieldRow: {
    flexDirection: 'row',
  },
  ageDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ageDisplayText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  agePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.blue + '30',
  },
  agePickerButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  agePickerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  genderDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  genderDisplayText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderOptionActive: {
    backgroundColor: COLORS.blue + '15',
    borderColor: COLORS.blue,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  genderOptionTextActive: {
    color: COLORS.blue,
    fontWeight: '600',
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
    flex: 1,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.blue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.charcoal,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  signOutGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  signOutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalContainer: {
    width: screenWidth - 64,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modernModalIconContainer: {
    marginBottom: 16,
  },
  modernModalIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },
  modernModalMessage: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modernModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modernModalButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modernModalButtonSecondary: {
    backgroundColor: COLORS.gray + '20',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modernModalButtonPrimary: {
    overflow: 'hidden',
  },
  modernModalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modernModalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  modernModalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  slideUpModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  slideUpModalHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.gray + '40',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  slideUpModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '20',
  },
  slideUpModalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.blue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  slideUpModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  slideUpModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  slideUpModalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '20',
  },
  slideUpModalSaveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  slideUpModalSaveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  slideUpModalSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modernToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '15',
  },
  modernToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  modernToggleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  modernToggleDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  dataInfoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dataInfoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginLeft: 12,
  },
  termsSection: {
    marginBottom: 24,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  termsFooter: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '30',
  },
  termsFooterText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 4,
  },
});
