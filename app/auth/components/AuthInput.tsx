import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  leftText?: string;
  isPhoneInput?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  error,
  style,
  secureTextEntry,
  leftText,
  isPhoneInput,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = secureTextEntry;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons
          name={isPhoneInput ? 'call' : icon}
          size={20}
          color={error ? colors.error : colors.textSecondary}
          style={styles.icon}
        />
        {isPhoneInput && (
          <Text style={[styles.leftText, { opacity: isFocused ? 1 : 0.5 }]}>+91</Text>
        )}
        <TextInput
          style={[
            styles.input,
            styles.inputWithIcon,
            isPhoneInput && styles.inputWithLeftText,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isPhoneInput && isFocused ? '' : props.placeholder}
          {...props}
        />
        {isPassword && (
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color={colors.textSecondary}
            style={styles.visibilityIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: 50,
  },
  inputWithLeftText: {
    paddingLeft: 90,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  icon: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    padding: 4,
  },
  leftText: {
    position: 'absolute',
    left: 52,
    zIndex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    paddingHorizontal: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 4,
    marginLeft: 20,
  },
});
