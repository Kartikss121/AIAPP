import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Banner slides data
const BANNERS = [
  {
    id: '1',
    title: 'AI Art Generation',
    subtitle: 'Turn your words into stunning masterpieces',
    image: require('../../assets/images/render_robot.png'),
    color: '#1a0533',
  },
  {
    id: '2',
    title: 'Anime Styles',
    subtitle: 'Transform any photo into anime art',
    image: require('../../assets/images/anime_forest.png'),
    color: '#001a33',
  },
  {
    id: '3',
    title: 'Fantasy Worlds',
    subtitle: 'Create breathtaking fantasy landscapes',
    image: require('../../assets/images/fantasy_castle.png'),
    color: '#0a1a00',
  },
];

// Mode sections data
const MODE_SECTIONS = [
  {
    id: 'cartoonize',
    title: 'Cartoonize',
    modes: [
      { id: 'cartoon', label: 'Cartoon', image: require('../../assets/images/cartoon_puppy.png'), pro: false },
      { id: 'anime', label: 'Anime', image: require('../../assets/images/anime_forest.png'), pro: true },
      { id: 'fantasy', label: 'Fantasy', image: require('../../assets/images/fantasy_castle.png'), pro: false },
      { id: 'toon_3d', label: '3D Toon', image: require('../../assets/images/toon_3d.png'), pro: true },
    ],
  },
  {
    id: 'art_styles',
    title: 'Art Styles',
    modes: [
      { id: 'origami', label: 'Origami', image: require('../../assets/images/origami_crane.png'), pro: false },
      { id: 'steampunk', label: 'Steampunk', image: require('../../assets/images/steampunk_owl.png'), pro: true },
      { id: 'gothic', label: 'Gothic', image: require('../../assets/images/gothic_cathedral.png'), pro: false },
      { id: 'oil_paint', label: 'Oil Paint', image: require('../../assets/images/oil_still_life.png'), pro: false },
    ],
  },
  {
    id: 'cinematic',
    title: 'Cinematic & Realism',
    modes: [
      { id: 'realistic', label: 'Realistic', image: require('../../assets/images/realistic_lion.png'), pro: true },
      { id: 'cinematic', label: 'Cinematic', image: require('../../assets/images/cinematic_astronaut.png'), pro: false },
      { id: 'landscape', label: 'Landscape', image: require('../../assets/images/fantasy_landscape_1777107572320.png'), pro: false },
      { id: 'watercolor', label: 'Watercolor', image: require('../../assets/images/watercolor_lake.png'), pro: false },
    ],
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk & Sci-Fi',
    modes: [
      { id: 'cyberpunk', label: 'Cyberpunk', image: require('../../assets/images/cyberpunk_tokyo.png'), pro: false },
      { id: 'mecha', label: 'Mecha', image: require('../../assets/images/mecha_girl_1777107587543.png'), pro: true },
      { id: 'vaporwave', label: 'Vaporwave', image: require('../../assets/images/vaporwave_statue.png'), pro: false },
      { id: 'pixel', label: 'Pixel Art', image: require('../../assets/images/pixel_spaceship.png'), pro: true },
    ],
  },
  {
    id: 'recommended',
    title: 'Recommended for You',
    modes: [
      { id: 'pop_art', label: 'Pop Art', image: require('../../assets/images/pop_portrait.png'), pro: false },
      { id: 'render_3d', label: '3D Render', image: require('../../assets/images/render_robot.png'), pro: true },
      { id: 'manga', label: 'Manga', image: require('../../assets/images/anime_boy_1777107534204.png'), pro: false },
      { id: 'sketch', label: 'Sketch', image: require('../../assets/images/sketch_portrait.png'), pro: true },
    ],
  },
];

const TRENDING_PROMPTS = [
  { id: '1', text: 'Cyberpunk samurai in neon rain', tag: 'Sci-Fi' },
  { id: '2', text: 'Cute fluffy kitten playing with a ball of yarn, cinematic', tag: 'Cute' },
  { id: '3', text: 'Majestic golden eagle soaring over mountains', tag: 'Nature' },
];

export default function HomeScreen() {
  const { colors, activeTheme } = useTheme();
  const router = useRouter();
  const [activeBanner, setActiveBanner] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const bannerRef = useRef<FlatList>(null);

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const toggleExpandSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveBanner(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBarStyle} />

      {/* Animated Header Background */}
      <Animated.View style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 50,
          zIndex: 10,
        },
        headerAnimatedStyle
      ]}>
        <BlurView intensity={80} tint={activeTheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background, opacity: 0.9 }]} />
      </Animated.View>

      <View style={styles.safeArea}>
        {/* Header Content */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 5, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 11 }]}>
          <Text style={[styles.logoText, { color: colors.text }]}>LOGIXA</Text>
          <TouchableOpacity
            style={styles.proHeaderBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/premium')}
          >
            <LinearGradient
              colors={['#FFD700', '#FDB931']}
              style={styles.proHeaderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="star" size={12} color="#000" />
              <Text style={styles.proHeaderText}>PRO</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Banner Carousel */}
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerRef}
              data={BANNERS}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleBannerScroll}
              renderItem={({ item }) => (
                <View style={styles.bannerSlide}>
                  <Image source={item.image} style={styles.bannerImage} contentFit="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={styles.bannerGradient}
                  />
                  <View style={styles.bannerText}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              )}
            />
            {/* Dots */}
            <View style={styles.dotsContainer}>
              {BANNERS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeBanner
                      ? { backgroundColor: '#FFFFFF', width: 20 }
                      : { backgroundColor: 'rgba(255,255,255,0.4)', width: 8 },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            {/* Generate Image Card */}
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8} onPress={() => router.navigate('/generate')}>
              <LinearGradient
                colors={['#4F1FE8', '#7C3AED', '#2D0F8F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Decorative Orb */}
              <View style={[styles.cardOrb, { backgroundColor: 'rgba(255,255,255,0.12)', top: -20, right: -20, width: 90, height: 90 }]} />
              <View style={[styles.cardOrb, { backgroundColor: 'rgba(255,255,255,0.07)', top: 40, right: 20, width: 50, height: 50 }]} />
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionTitle}>Generate{"\n"}Image</Text>
              <Text style={styles.quickActionDesc}>AI art from text</Text>
              <View style={styles.quickActionArrow}>
                <View style={styles.arrowChip}>
                  <Ionicons name="arrow-forward" size={13} color="#7C3AED" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Edit Photo Card */}
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8} onPress={() => router.navigate('/generate?action=edit')}>
              <LinearGradient
                colors={['#0EA5E9', '#0284C7', '#0C4A6E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Decorative Orb */}
              <View style={[styles.cardOrb, { backgroundColor: 'rgba(255,255,255,0.12)', top: -20, right: -20, width: 90, height: 90 }]} />
              <View style={[styles.cardOrb, { backgroundColor: 'rgba(255,255,255,0.07)', top: 40, right: 20, width: 50, height: 50 }]} />
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="color-wand" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionTitle}>Edit your{"\n"}Photo</Text>
              <Text style={styles.quickActionDesc}>Enhance & stylize</Text>
              <View style={styles.quickActionArrow}>
                <View style={[styles.arrowChip, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="arrow-forward" size={13} color="#0284C7" />
                </View>
              </View>
            </TouchableOpacity>
          </View>



          {/* Mode Sections */}
          {MODE_SECTIONS.map((section) => (
            <View key={section.id} style={styles.modeSection}>
              <View style={styles.modeSectionHeader}>
                <Text style={[styles.modeSectionTitle, { color: colors.text }]}>{section.title}</Text>
                <TouchableOpacity onPress={() => router.navigate(`/category?id=${section.id}`)}>
                  <Text style={[styles.seeAll, { color: colors.accent }]}>See All &gt;</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeScroll}>
                {section.modes.map((mode) => (
                  <TouchableOpacity key={mode.id} style={styles.modeCard} onPress={() => router.navigate(`/generate?style=${encodeURIComponent(mode.label)}&image=${mode.image}`)}>
                    <Image source={mode.image} style={styles.modeImage} contentFit="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.modeGradient}
                    />
                    {mode.pro && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                    <Text style={styles.modeLabel}>{mode.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 3,
  },
  proHeaderBtn: {
    shadowColor: '#FDB931',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  proHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proHeaderText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },

  // Banner
  bannerContainer: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  bannerSlide: {
    width: width,
    height: 300,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bannerText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 28,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    minHeight: 170,
  },
  cardOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  quickActionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 22,
  },
  quickActionDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  quickActionArrow: {
    alignSelf: 'flex-start',
    marginTop: 14 as any,
  },
  arrowChip: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mode Sections
  modeSection: {
    marginBottom: 24,
  },
  modeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  modeSectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  modeScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  modeCard: {
    width: 120,
    height: 155,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modeImage: {
    width: '100%',
    height: '100%',
  },
  modeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  proBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },
  modeLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  trendingSection: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionTitleText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 14,
  },
  promptScroll: {
    gap: 12,
  },
  promptCard: {
    width: 200,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  promptTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  promptTagText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  promptCardText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    marginBottom: 12,
  },
  promptCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tryNowText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
  expandedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
});
