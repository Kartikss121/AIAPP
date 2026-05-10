import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: 'weekly',
    title: 'Weekly Pro',
    price: '$4.99',
    period: '/week',
    popular: false,
  },
  {
    id: 'yearly',
    title: 'Yearly Pro',
    price: '$49.99',
    period: '/year',
    popular: true,
    badge: 'SAVE 80%',
  },
  {
    id: 'monthly',
    title: 'Monthly Pro',
    price: '$9.99',
    period: '/month',
    popular: false,
  }
];

const FEATURES = [
  'Unlimited Image & Video Generations',
  'Priority Queue Processing',
  'Ad-Free Experience',
  'Unlock 4K Ultra HD Exports',
  'Exclusive Art Styles',
  'Commercial Usage Rights',
];

export default function PremiumScreen() {
  const { colors, activeTheme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  // Pulsing animation for the CTA button
  const pulseAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
              withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          )
        }
      ]
    };
  });

  const handleSubscribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Add RevenueCat or In-App Purchase logic here
    console.log('Subscribe to', selectedPlan);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      {/* Background Gradients */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#0F0C29', '#302B63', '#24243E']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View entering={FadeInDown.duration(2000)} style={styles.glow1}>
          <LinearGradient colors={['rgba(124, 58, 237, 0.4)', 'transparent']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(2000)} style={styles.glow2}>
          <LinearGradient colors={['rgba(236, 72, 153, 0.4)', 'transparent']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Title Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(800).springify()} style={styles.titleContainer}>
            <LinearGradient
              colors={['#FFD700', '#FDB931']}
              style={styles.proBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="star" size={14} color="#000" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
            <Text style={styles.title}>Unlock Limitless</Text>
            <Text style={styles.titleGradient}>Creativity</Text>
            <Text style={styles.subtitle}>
              Join the premium tier and get access to exclusive features, faster processing, and endless generations.
            </Text>
          </Animated.View>

          {/* Features List */}
          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name="checkmark-circle" size={22} color="#EC4899" />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Pricing Plans */}
          <Animated.View entering={FadeInUp.delay(300).duration(800).springify()} style={styles.plansContainer}>
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.planCardWrapper}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPlan(plan.id);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isSelected ? ['#EC4899', '#8B5CF6'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                    style={[styles.planCardBorder, isSelected && styles.planCardBorderSelected]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={[styles.planCard, { backgroundColor: isSelected ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)' }]}>
                      {plan.popular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                        </View>
                      )}
                      <View style={styles.planHeader}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.planTitle, isSelected && { color: '#FFF' }]}>{plan.title}</Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{plan.price}</Text>
                        <Text style={styles.period}>{plan.period}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </Animated.View>

        </ScrollView>

        {/* Action Button */}
        <Animated.View entering={FadeInUp.delay(500).duration(800).springify()} style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
          <TouchableOpacity onPress={handleSubscribe} activeOpacity={0.9}>
            <Animated.View style={[styles.ctaWrapper, pulseAnim]}>
              <LinearGradient
                colors={['#EC4899', '#8B5CF6', '#7C3AED']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.ctaText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.ctaIcon} />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy. Cancel anytime in your App Store settings.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    transform: [{ scale: 1.5 }],
  },
  glow2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    transform: [{ scale: 1.5 }],
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restoreText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  proBadgeText: {
    color: '#000',
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  titleGradient: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
    color: '#EC4899',
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginBottom: 35,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconWrap: {
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#FFF',
    flex: 1,
  },
  plansContainer: {
    gap: 16,
  },
  planCardWrapper: {
    width: '100%',
  },
  planCardBorder: {
    borderRadius: 20,
    padding: 2,
  },
  planCardBorderSelected: {
    // shadow
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  planCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#EC4899',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  popularBadgeText: {
    color: '#FFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#EC4899',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EC4899',
  },
  planTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#FFF',
  },
  period: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  ctaWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  ctaIcon: {
    marginTop: 2,
  },
  disclaimer: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
