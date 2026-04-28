import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, activeTheme } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#DB2777', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 35 : 85}
          tint={activeTheme === 'dark' ? 'dark' : 'light'}
          style={[
            styles.tabBar,
            {
              backgroundColor: activeTheme === 'dark' ? 'rgba(11, 7, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            }
          ]}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            if (route.name === 'create') {
              return (
                <View key={route.name} style={{ width: 60 }} />
              );
            }

            // Map route names to icons
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
            if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
            else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

            const activePillBg = '#7C3AED';

            const inactiveIconColor = activeTheme === 'dark'
              ? 'rgba(255, 255, 255, 0.45)'
              : 'rgba(0, 0, 0, 0.45)';

            return (
              <AnimatedTouchableOpacity
                key={route.name}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.title !== undefined ? options.title : route.name}
                onPress={onPress}
                onLongPress={onLongPress}
                layout={LinearTransition.springify().mass(0.5)}
                style={styles.tabItem}
              >
                {isFocused && (
                  <LinearGradient
                    colors={['#7C3AED', '#DB2777']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? '#FFFFFF' : inactiveIconColor}
                />
                <Text
                  style={[
                    styles.activeTabText,
                    { color: isFocused ? '#FFFFFF' : inactiveIconColor }
                  ]}
                >
                  {options.title !== undefined ? options.title : route.name}
                </Text>
              </AnimatedTouchableOpacity>
            );
          })}
        </BlurView>
      </LinearGradient>

      {/* Absolute Floating Create Button */}
      {(() => {
        const createRoute = state.routes.find(r => r.name === 'create');
        if (!createRoute) return null;
        const { options } = descriptors[createRoute.key];
        const isFocused = state.index === state.routes.findIndex(r => r.name === 'create');

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: createRoute.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(createRoute.name, createRoute.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.title !== undefined ? options.title : createRoute.name}
            onPress={onPress}
            style={styles.createFloatingButton}
          >
            <LinearGradient
              colors={['#7C3AED', '#DB2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createGradient}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </LinearGradient>
          </AnimatedTouchableOpacity>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 99,
  },
  gradientBorder: {
    borderRadius: 40,
    padding: 1.5,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 38.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: width * 0.85,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  createFloatingButton: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    zIndex: 100,
  },
  createGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
});
