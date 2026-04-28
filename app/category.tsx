import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MODE_SECTIONS = [
  {
    id: 'cartoonize',
    title: 'Cartoonize',
    modes: [
      { id: 'cartoon', label: 'Cartoon', image: require('../assets/images/cartoon_puppy.png'), pro: false },
      { id: 'anime', label: 'Anime', image: require('../assets/images/anime_forest.png'), pro: true },
      { id: 'fantasy', label: 'Fantasy', image: require('../assets/images/fantasy_castle.png'), pro: false },
      { id: 'toon_3d', label: '3D Toon', image: require('../assets/images/toon_3d.png'), pro: true },
      { id: 'manga', label: 'Manga', image: require('../assets/images/anime_boy_1777107534204.png'), pro: false },
    ],
  },
  {
    id: 'art_styles',
    title: 'Art Styles',
    modes: [
      { id: 'origami', label: 'Origami', image: require('../assets/images/origami_crane.png'), pro: false },
      { id: 'steampunk', label: 'Steampunk', image: require('../assets/images/steampunk_owl.png'), pro: true },
      { id: 'gothic', label: 'Gothic', image: require('../assets/images/gothic_cathedral.png'), pro: false },
      { id: 'oil_paint', label: 'Oil Paint', image: require('../assets/images/oil_still_life.png'), pro: false },
      { id: 'watercolor', label: 'Watercolor', image: require('../assets/images/watercolor_lake.png'), pro: true },
      { id: 'sketch', label: 'Sketch', image: require('../assets/images/sketch_portrait.png'), pro: false },
    ],
  },
  {
    id: 'cinematic',
    title: 'Cinematic & Realism',
    modes: [
      { id: 'realistic', label: 'Realistic', image: require('../assets/images/realistic_lion.png'), pro: true },
      { id: 'cinematic', label: 'Cinematic', image: require('../assets/images/cinematic_astronaut.png'), pro: false },
      { id: 'landscape', label: 'Landscape', image: require('../assets/images/fantasy_landscape_1777107572320.png'), pro: false },
    ],
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk & Sci-Fi',
    modes: [
      { id: 'cyberpunk', label: 'Cyberpunk', image: require('../assets/images/cyberpunk_tokyo.png'), pro: false },
      { id: 'mecha', label: 'Mecha', image: require('../assets/images/mecha_girl_1777107587543.png'), pro: true },
      { id: 'vaporwave', label: 'Vaporwave', image: require('../assets/images/vaporwave_statue.png'), pro: false },
      { id: 'pixel', label: 'Pixel Art', image: require('../assets/images/pixel_spaceship.png'), pro: true },
      { id: 'neon_glow', label: 'Neon Glow', image: require('../assets/images/neon_city_1777107555700.png'), pro: false },
    ],
  },
  {
    id: 'recommended',
    title: 'Recommended for You',
    modes: [
      { id: 'pop_art', label: 'Pop Art', image: require('../assets/images/pop_portrait.png'), pro: false },
      { id: 'render_3d', label: '3D Render', image: require('../assets/images/render_robot.png'), pro: true },
      { id: 'manga_rec', label: 'Manga', image: require('../assets/images/anime_boy_1777107534204.png'), pro: false },
      { id: 'sketch_rec', label: 'Sketch', image: require('../assets/images/sketch_portrait.png'), pro: true },
    ],
  },
];

export default function CategoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 62) / 3;

  const section = MODE_SECTIONS.find(s => s.id === params.id) || MODE_SECTIONS[0];

  const handleSelectStyle = (styleLabel: string, imageSource: any) => {
    router.navigate(`/generate?style=${encodeURIComponent(styleLabel)}&image=${imageSource}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{section.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Grid list of styles */}
      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {section.modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeCard, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleSelectStyle(mode.label, mode.image)}
          >
            <Image source={mode.image} style={styles.modeImage} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 12,
  },
  modeCard: {
    width: (width - 56) / 3,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
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
    height: 80,
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
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
});
