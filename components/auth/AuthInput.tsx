import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  leftText?: string;
  isPhoneInput?: boolean;
  message?: string;
  messageType?: 'success' | 'error' | 'warning';
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
  const inputRef = useRef<TextInput>(null);

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
          color={(error || (props as any).messageType === 'error') ? colors.error : colors.textSecondary}
          style={styles.icon}
        />
        {isPhoneInput && (
          <Text style={[styles.leftText, { opacity: isFocused ? 1 : 0.5 }]}>+91</Text>
        )}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            styles.inputWithIcon,
            isPhoneInput && styles.inputWithLeftText,
            (error || (props as any).messageType === 'error') && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          blurOnSubmit={false}
          // @ts-ignore - supported on RN
          showSoftInputOnFocus={true}
          placeholder={isPhoneInput && isFocused ? '' : props.placeholder}
          {...props}
        />
        {isPassword && (
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color={colors.textSecondary}
            style={styles.visibilityIcon}
            onPress={() => {
              setIsPasswordVisible(v => !v);
              // Keep keyboard open and cursor at end after toggling
              setTimeout(() => {
                try {
                  const len = String((props as any).value ?? '').length;
                  inputRef.current?.focus();
                  // @ts-ignore - selection is supported on RN TextInput
                  inputRef.current?.setNativeProps?.({ selection: { start: len, end: len } });
                } catch {}
              }, 0);
            }}
          />
        )}
      </View>
      {(() => {
        const msg = (props as any).message || error;
        const type = (props as any).messageType as 'success'|'error'|'warning'|undefined;
        if (!msg) return null;
        const color = type === 'success' ? colors.success : type === 'warning' ? colors.warning : colors.error;
        return <Text style={[styles.messageText, { color }]}>{msg}</Text>;
      })()}
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
  messageText: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 4,
    marginLeft: 20,
  },
});
