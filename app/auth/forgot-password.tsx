import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | undefined>();
  const [emailMsgType, setEmailMsgType] = useState<'success' | 'error' | 'warning' | undefined>();

  const handleResetPassword = async () => {
    try {
      setLoading(true);

      if (!email) {
        setEmailMsg('Please enter your email address');
        setEmailMsgType('error');
        return;
      }

      // Reset password logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setEmailMsg('If an account exists, a reset link has been sent.');
      setEmailMsgType('success');
      setTimeout(() => router.back(), 800);
    } catch (error) {
      setEmailMsg('Failed to send reset link');
      setEmailMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address to receive a password reset link
          </Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            icon="mail"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={() => {
              if (!email) {
                setEmailMsg('Email is required');
                setEmailMsgType('error');
              } else {
                setEmailMsg(undefined);
                setEmailMsgType(undefined);
              }
            }}
            onSubmitEditing={handleResetPassword}
            message={emailMsg}
            messageType={emailMsgType}
          />

          <AuthButton
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password?</Text>
          <Pressable onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
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
    gap: 24,
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
});