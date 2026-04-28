import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';
type ActiveTheme = 'light' | 'dark';

interface ThemeContextProps {
  mode: ThemeMode;
  activeTheme: ActiveTheme;
  colors: typeof Colors.light;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load saved theme on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setModeState(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsMounted(true);
      }
    };
    loadTheme();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem('user-theme', newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Determine the actual active theme based on user preference or system
  const activeTheme: ActiveTheme = 
    mode === 'system' 
      ? (deviceColorScheme === 'dark' ? 'dark' : 'light') 
      : mode;

  const colors = Colors[activeTheme];

  if (!isMounted) return null; // Prevent flash of wrong theme

  return (
    <ThemeContext.Provider value={{ mode, activeTheme, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
