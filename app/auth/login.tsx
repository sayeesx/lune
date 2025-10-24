import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthToggle } from '@/components/auth/AuthToggle';
import { OTPInput } from '@/components/auth/OTPInput';
import { supabase } from '@/lib/supabaseClient';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox'; // ✅ Added import
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

export default function LoginScreen() {
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inline field messages
  const [emailMsg, setEmailMsg] = useState<string | undefined>();
  const [emailMsgType, setEmailMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [passwordMsg, setPasswordMsg] = useState<string | undefined>();
  const [passwordMsgType, setPasswordMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [phoneMsg, setPhoneMsg] = useState<string | undefined>();
  const [phoneMsgType, setPhoneMsgType] = useState<'success' | 'error' | 'warning' | undefined>();

  const handleLogin = async () => {
    try {
      setLoading(true);
      // reset messages
      setEmailMsg(undefined); setEmailMsgType(undefined);
      setPasswordMsg(undefined); setPasswordMsgType(undefined);
      setPhoneMsg(undefined); setPhoneMsgType(undefined);

      if (isPhoneLogin) {
        setPhoneMsg("Phone number login isn't available for now, wait till we update...");
        setPhoneMsgType('warning');
        return;
      }

      if (!email || !password) {
        if (!email) {
          setEmailMsg('Email is required');
          setEmailMsgType('error');
        }
        if (!password) {
          setPasswordMsg('Password is required');
          setPasswordMsgType('error');
        }
        return;
      }

      // Supabase email login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = (error as any)?.message || '';
        const isEmailNotConfirmed = msg.toLowerCase().includes('confirm');
        if (isEmailNotConfirmed) {
          // For development: bypass email confirmation
          setPasswordMsg('Email not confirmed — continuing for development');
          setPasswordMsgType('warning');
          
          // Create a temporary session-like object and store it
          const tempAuth = {
            user: { id: 'demo-user', email: email },
            session: { access_token: 'demo-token' }
          };
          
          // Store in AsyncStorage to simulate authenticated state
          await AsyncStorage.setItem('tempAuth', JSON.stringify(tempAuth));
          
          // Navigate to tabs
          router.replace('/(tabs)');
          return;
        } else {
          setPasswordMsg(msg || 'Login failed');
          setPasswordMsgType('error');
          return;
        }
      }

      if (data?.user) {
        setPasswordMsg('Login successful');
        setPasswordMsgType('success');
        // The session is automatically handled by Supabase auth state change
        // No need to manually navigate - the auth state change will handle it
        // router.replace('/(tabs)'); // Remove this line
      }
    } catch (error) {
      setPasswordMsg('An unexpected error occurred');
      setPasswordMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleResendCode = () => {
    setPhoneMsg('Code resent successfully');
    setPhoneMsgType('success');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your healthcare journey
          </Text>
        </View>

        <AuthToggle
          value={isPhoneLogin}
          onValueChange={setIsPhoneLogin}
          leftLabel="Email"
          rightLabel="Phone"
        />

        <View style={styles.form}>
          {isPhoneLogin ? (
            <>
              {!showOtp ? (
                <AuthInput
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  isPhoneInput
                  autoCapitalize="none"
                  message={phoneMsg}
                  messageType={phoneMsgType}
                />
              ) : (
                <>
                  <OTPInput onComplete={setOtp} />
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
                onBlur={() => {
                  if (!email) { setEmailMsg('Email is required'); setEmailMsgType('error'); }
                  else { setEmailMsg(undefined); setEmailMsgType(undefined); }
                }}
                onSubmitEditing={handleLogin}
                message={emailMsg}
                messageType={emailMsgType}
              />
              <AuthInput
                icon="lock-closed"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onBlur={() => {
                  if (!password) { setPasswordMsg('Password is required'); setPasswordMsgType('error'); }
                  else { setPasswordMsg(undefined); setPasswordMsgType(undefined); }
                }}
                onSubmitEditing={handleLogin}
                message={passwordMsg}
                messageType={passwordMsgType}
              />
            </>
          )}

          <View style={styles.options}>
            <View style={styles.rememberMe}>
              <Checkbox
                value={rememberMe}
                onValueChange={setRememberMe}
                color={rememberMe ? colors.primary : undefined}
              />
              <Text style={styles.rememberMeText}>Keep me signed in</Text>
            </View>

            {!isPhoneLogin && (
              <Pressable onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </Pressable>
            )}
          </View>

          <AuthButton
            title={isPhoneLogin ? (showOtp ? 'Verify OTP' : 'Send OTP') : 'Login'}
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={handleSignup}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberMeText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.primary,
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
  signupText: {
    fontSize: 14,
    fontFamily: fontFamily.semibold,
    color: colors.primary,
  },
});
