import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({ title, variant = 'primary', style, textStyle, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.8}
      {...props}
    >
      {isPrimary && (
        <LinearGradient
          colors={['#4F1FE8', '#7C3AED', '#2D0F8F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.5,
  },
});
