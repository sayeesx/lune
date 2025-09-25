
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import { showToast } from '@/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthButton } from './components/AuthButton';
import { AuthInput } from './components/AuthInput';
import { AuthToggle } from './components/AuthToggle';
import { OTPInput } from './components/OTPInput';


export default function SignupScreen() {
  const [isPhoneSignup, setIsPhoneSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);

      if (!fullName) {
        showToast.error('Error', 'Please enter your full name');
        setLoading(false);
        return;
      }

      if (isPhoneSignup) {
        if (!phone) {
          showToast.error('Error', 'Please enter your phone number');
          setLoading(false);
          return;
        }

        if (!showOtp) {
          // Send OTP logic here
          // Simulate OTP send for demo
                    showToast.success('Success', 'OTP sent successfully');
          setShowOtp(true);
          setLoading(false);
          return;
        }

        if (!otp) {
                    showToast.error('Error', 'Please enter the OTP');
          setLoading(false);
          return;
        }

        // Verify OTP logic here
        // Mock OTP verification
                showToast.success('Success', 'OTP verified successfully');
      } else {
        if (!email || !password || !confirmPassword) {
                    showToast.error('Error', 'Please fill in all fields');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
                    showToast.error('Error', 'Passwords do not match');
          setLoading(false);
          return;
        }
      }

      if (!acceptTerms) {
                  showToast.error('Error', 'Please accept the terms and privacy policy');
        setLoading(false);
        return;
      }

      // Mock successful signup
      await AsyncStorage.setItem('userToken', 'dummy-token');
      if (isPhoneSignup) {
        await AsyncStorage.setItem('userPhone', phone);
      } else {
        await AsyncStorage.setItem('userEmail', email);
      }

            showToast.success('Success', 'Account created successfully');
      router.replace('/auth/login');
    } catch (error) {
            showToast.error('Error', 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // Resend OTP logic here
        showToast.success('Success', 'Code resent successfully');
  };

  const handleLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start your healthcare journey
          </Text>
        </View>

        <AuthToggle
          value={isPhoneSignup}
          onValueChange={setIsPhoneSignup}
          leftLabel="Email"
          rightLabel="Phone"
        />

        <View style={styles.form}>
          <AuthInput
            icon="person"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          {isPhoneSignup ? (
            <>
              {!showOtp ? (
                <AuthInput
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  isPhoneInput
                  autoCapitalize="none"
                />
              ) : (
                <>
                  <OTPInput
                    onComplete={setOtp}
                  />
                  <View style={styles.otpActions}>
                    <Pressable onPress={handleResendCode}>
                      <Text style={styles.actionText}>Resend Code</Text>
                    </Pressable>
                    <Text style={styles.actionSeparator}>|</Text>
                    <Pressable onPress={() => setShowOtp(false)}>
                      <Text style={styles.actionText}>Edit Number</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <AuthInput
                icon="mail"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <AuthInput
                icon="lock-closed"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <AuthInput
                icon="lock-closed"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          <View style={styles.termsContainer}>
            <Checkbox
              value={acceptTerms}
              onValueChange={setAcceptTerms}
              color={acceptTerms ? colors.primary : undefined}
            />
            <Text style={styles.termsText}>
              I accept the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <AuthButton
            title={isPhoneSignup ? (showOtp ? 'Verify & Create Account' : 'Send OTP') : 'Create Account'}
            onPress={handleSignup}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  termsLink: {
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  actionText: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
  actionSeparator: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  loginText: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
  // removed duplicate otpContainer
});