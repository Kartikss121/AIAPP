/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#11181C',
    textMuted: '#687076',
    card: '#F8F9FA',
    border: 'rgba(0, 0, 0, 0.05)',
    accent: '#1E40AF', // Dark Blue
    icon: '#11181C',
    iconMuted: '#8E8E9F',
    gradientBg: ['#F3E8FF', '#FFFFFF'] as const,
    tabBarBg: 'rgba(255, 255, 255, 0.85)',
    tabBarItemActive: '#1C1C28',
    tabBarItemActiveText: '#FFFFFF',
    statusBarStyle: 'dark' as const,
    error: '#EF4444',
  },
  dark: {
    background: '#0B0714',
    text: '#FFFFFF',
    textMuted: '#8E8E9F',
    card: '#1C1C28',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: '#2563EB', // Dark Blue
    icon: '#FFFFFF',
    iconMuted: '#8E8E9F',
    gradientBg: ['#090018ff', '#01001fff', '#02001aff', '#050019ff'] as const,
    tabBarBg: 'rgba(28, 28, 40, 0.87)',
    tabBarItemActive: '#FFFFFF',
    tabBarItemActiveText: '#000000',
    statusBarStyle: 'light' as const,
    error: '#EF4444',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
