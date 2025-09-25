import { fontFamily } from '@/theme/fonts';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

export const toastConfig = {
  success: (props: any) => (
    <View style={[styles.toast as ViewStyle, styles.success as ViewStyle]}>
      <Text style={[styles.text as TextStyle, styles.title as TextStyle]}>{props.text1}</Text>
      {props.text2 && <Text style={[styles.text as TextStyle, styles.message as TextStyle]}>{props.text2}</Text>}
    </View>
  ),
  error: (props: any) => (
    <View style={[styles.toast as ViewStyle, styles.error as ViewStyle]}>
      <Text style={[styles.text as TextStyle, styles.title as TextStyle]}>{props.text1}</Text>
      {props.text2 && <Text style={[styles.text as TextStyle, styles.message as TextStyle]}>{props.text2}</Text>}
    </View>
  ),
  warning: (props: any) => (
    <View style={[styles.toast as ViewStyle, styles.warning as ViewStyle]}>
      <Text style={[styles.text as TextStyle, styles.title as TextStyle]}>{props.text1}</Text>
      {props.text2 && <Text style={[styles.text as TextStyle, styles.message as TextStyle]}>{props.text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    minHeight: 60,
    width: '90%',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  success: {
    backgroundColor: '#10b981',
  },
  error: {
    backgroundColor: '#ef4444',
  },
  warning: {
    backgroundColor: '#f59e0b',
  },
  text: {
    color: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
});