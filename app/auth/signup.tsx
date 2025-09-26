
import { supabase } from '@/lib/supabaseClient';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
// Inline messages per input instead of global toast
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
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthToggle } from '@/components/auth/AuthToggle';
import { OTPInput } from '@/components/auth/OTPInput';

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

  // Inline field messages
  const [fullNameMsg, setFullNameMsg] = useState<string | undefined>();
  const [fullNameMsgType, setFullNameMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [emailMsg, setEmailMsg] = useState<string | undefined>();
  const [emailMsgType, setEmailMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [passwordMsg, setPasswordMsg] = useState<string | undefined>();
  const [passwordMsgType, setPasswordMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [confirmPasswordMsg, setConfirmPasswordMsg] = useState<string | undefined>();
  const [confirmPasswordMsgType, setConfirmPasswordMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [phoneMsg, setPhoneMsg] = useState<string | undefined>();
  const [phoneMsgType, setPhoneMsgType] = useState<'success' | 'error' | 'warning' | undefined>();
  const [termsMsg, setTermsMsg] = useState<string | undefined>();
  const [termsMsgType, setTermsMsgType] = useState<'success' | 'error' | 'warning' | undefined>();

  const handleSignup = async () => {
    try {
      setLoading(true);
      // reset messages
      setFullNameMsg(undefined); setFullNameMsgType(undefined);
      setEmailMsg(undefined); setEmailMsgType(undefined);
      setPasswordMsg(undefined); setPasswordMsgType(undefined);
      setConfirmPasswordMsg(undefined); setConfirmPasswordMsgType(undefined);
      setPhoneMsg(undefined); setPhoneMsgType(undefined);
      setTermsMsg(undefined); setTermsMsgType(undefined);

      if (!fullName) {
        setFullNameMsg('Please enter your full name');
        setFullNameMsgType('error');
        return;
      }

      if (isPhoneSignup) {
        setPhoneMsg("Phone signup isn't available for now, wait till we update...");
        setPhoneMsgType('warning');
        return;
      }

      if (!email || !password || !confirmPassword) {
        if (!email) { setEmailMsg('Email is required'); setEmailMsgType('error'); }
        if (!password) { setPasswordMsg('Password is required'); setPasswordMsgType('error'); }
        if (!confirmPassword) { setConfirmPasswordMsg('Please confirm password'); setConfirmPasswordMsgType('error'); }
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordMsg('Passwords do not match');
        setConfirmPasswordMsgType('error');
        return;
      }

      if (!acceptTerms) {
        setTermsMsg('Please accept the terms and privacy policy');
        setTermsMsgType('error');
        return;
      }

      // Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setEmailMsg(error.message || 'Signup failed');
        setEmailMsgType('error');
        return;
      }

      if (data?.user) {
        setEmailMsg('Account created! Please verify your email.');
        setEmailMsgType('success');
        router.replace('/auth/login');
      }
    } catch (error) {
      setEmailMsg('An unexpected error occurred');
      setEmailMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // Resend OTP logic here
    setPhoneMsg('Code resent successfully');
    setPhoneMsgType('success');
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
            onBlur={() => {
              if (!fullName) { setFullNameMsg('Please enter your full name'); setFullNameMsgType('error'); }
              else { setFullNameMsg(undefined); setFullNameMsgType(undefined); }
            }}
            onSubmitEditing={handleSignup}
            message={fullNameMsg}
            messageType={fullNameMsgType}
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
                  onBlur={() => {
                    if (!phone) { setPhoneMsg('Phone number is required'); setPhoneMsgType('error'); }
                    else { setPhoneMsg(undefined); setPhoneMsgType(undefined); }
                  }}
                  onSubmitEditing={handleSignup}
                  message={phoneMsg}
                  messageType={phoneMsgType}
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
                onBlur={() => {
                  if (!email) { setEmailMsg('Email is required'); setEmailMsgType('error'); }
                  else { setEmailMsg(undefined); setEmailMsgType(undefined); }
                }}
                onSubmitEditing={handleSignup}
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
                onSubmitEditing={handleSignup}
                message={passwordMsg}
                messageType={passwordMsgType}
              />
              <AuthInput
                icon="lock-closed"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                onBlur={() => {
                  if (!confirmPassword) { setConfirmPasswordMsg('Please confirm password'); setConfirmPasswordMsgType('error'); }
                  else if (password !== confirmPassword) { setConfirmPasswordMsg('Passwords do not match'); setConfirmPasswordMsgType('error'); }
                  else { setConfirmPasswordMsg(undefined); setConfirmPasswordMsgType(undefined); }
                }}
                onSubmitEditing={handleSignup}
                message={confirmPasswordMsg}
                messageType={confirmPasswordMsgType}
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
          {termsMsg ? (
            <Text style={{ color: termsMsgType === 'warning' ? colors.warning : termsMsgType === 'success' ? colors.success : colors.error, marginTop: 8, fontFamily: fontFamily.regular, fontSize: 12 }}>
              {termsMsg}
            </Text>
          ) : null}
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