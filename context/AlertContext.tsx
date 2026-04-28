import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { colors, activeTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = (newOptions: AlertOptions) => {
    // Provide default OK button if none specified
    if (!newOptions.buttons || newOptions.buttons.length === 0) {
      newOptions.buttons = [{ text: 'OK', style: 'default' }];
    }
    
    // Trigger haptic feedback based on type
    if (newOptions.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (newOptions.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (newOptions.type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setOptions(newOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    setOptions(null); // Trigger Reanimated exiting animation
    setTimeout(() => setVisible(false), 300); // Fully unmount Modal after animation completes
  };

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    if (button.onPress) {
      // Wait for modal to fully unmount before executing action (prevents Android Dialog race conditions)
      setTimeout(button.onPress, 500);
    }
  };

  const getIconConfig = () => {
    switch (options?.type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#10B981', gradient: ['#10B981', '#059669'] };
      case 'error':
        return { name: 'close-circle', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] };
      case 'warning':
        return { name: 'warning', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] };
      default:
        return { name: 'information-circle', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={hideAlert}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint={activeTheme === 'dark' ? 'dark' : 'light'} style={styles.overlay}>
          {visible && options && (
            <Animated.View entering={FadeInDown.springify()} exiting={FadeOutDown} style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Glow Effect */}
              <View style={styles.iconContainer}>
                <View style={[styles.iconGlow, { backgroundColor: iconConfig.color }]} />
                <Ionicons name={iconConfig.name as any} size={48} color={iconConfig.color} />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{options.title}</Text>
              <Text style={[styles.message, { color: colors.textMuted }]}>{options.message}</Text>

              <View style={styles.buttonContainer}>
                {options.buttons?.map((button, index) => {
                  const isPrimary = button.style !== 'cancel';
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        isPrimary ? styles.primaryButton : styles.secondaryButton,
                        options.buttons!.length > 1 && styles.flexButton
                      ]}
                      onPress={() => handleButtonPress(button)}
                      activeOpacity={0.8}
                    >
                      {isPrimary && (
                        <LinearGradient
                          colors={iconConfig.gradient as [string, string, ...string[]]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFillObject}
                        />
                      )}
                      <Text style={[
                        styles.buttonText,
                        !isPrimary && { color: colors.textMuted }
                      ]}>
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}
        </BlurView>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useCustomAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useCustomAlert must be used within an AlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
    transform: [{ scale: 2 }],
    filter: [{ blur: 10 }] as any,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  flexButton: {
    flex: 1,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
