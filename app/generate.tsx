import { useCustomAlert } from '@/context/AlertContext';
import { useGlobalRewardedAd } from '@/context/RewardedAdContext';
import { useTheme } from '@/context/ThemeContext';
import { useGenerateImage } from '@/hooks/useGenerateImage';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const loadingAnimation = require('@/loading.json');

const { width } = Dimensions.get('window');

// Aspect Ratios
const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', w: 1, h: 1, icon: 'square-outline' },
  { id: '4:3', label: '4:3', w: 4, h: 3, icon: 'tablet-landscape-outline' },
  { id: '3:4', label: '3:4', w: 3, h: 4, icon: 'tablet-portrait-outline' },
  { id: '16:9', label: '16:9', w: 16, h: 9, icon: 'tv-outline' },
  { id: '9:16', label: '9:16', w: 9, h: 16, icon: 'phone-portrait-outline' },
  { id: '2:3', label: '2:3', w: 2, h: 3, icon: 'phone-portrait-outline' },
];

// Art Styles
const ART_STYLES = [
  {
    id: 'realistic',
    label: 'Realistic',
    emoji: '📷',
    color: '#3B82F6',
    image: require('../assets/images/realistic_lion.png'),
    promptBuilder: (input: string) => `Ultra-realistic photo of ${input}. Natural skin texture with pores and slight imperfections. Soft natural lighting, subtle shadows, candid moment. Shot on 50mm lens, shallow depth of field, blurred background. Realistic colors, no overprocessing, accurate proportions.`
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    emoji: '🎬',
    color: '#F59E0B',
    image: require('../assets/images/cinematic_astronaut.png'),
    promptBuilder: (input: string) => `Cinematic scene of ${input}. Dramatic lighting with strong highlights and shadows. Volumetric light rays, wide angle composition. Shot like a movie still, shallow depth of field. Film color grading, high dynamic range, subtle grain.`
  },
  {
    id: 'anime',
    label: 'Anime',
    emoji: '🎌',
    color: '#EC4899',
    image: require('../assets/images/anime_forest.png'),
    promptBuilder: (input: string) => `Anime illustration of ${input}. Clean line art, vibrant colors, expressive detailed eyes. Soft shading, stylized proportions. Studio Ghibli inspired environment, high detail background.`
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    emoji: '✨',
    color: '#8B5CF6',
    image: require('../assets/images/fantasy_castle.png'),
    promptBuilder: (input: string) => `Epic fantasy artwork of ${input}. Magical atmosphere with glowing particles. Highly detailed environment, intricate designs. Dramatic lighting, grand scale composition.`
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    emoji: '🌃',
    color: '#14B8A6',
    image: require('../assets/images/cyberpunk_tokyo.png'),
    promptBuilder: (input: string) => `Cyberpunk scene of ${input}. Futuristic city with neon lights and rain reflections. Dark moody atmosphere, glowing accents. High detail, cinematic composition.`
  },
  {
    id: '3d_render',
    label: '3D Render',
    emoji: '🧊',
    color: '#6366F1',
    image: require('../assets/images/render_robot.png'),
    promptBuilder: (input: string) => `High quality 3D render of ${input}. Realistic materials, global illumination, ray tracing. Soft shadows, studio lighting, ultra detailed surfaces. Octane render style, professional CGI.`
  },
  {
    id: 'oil_paint',
    label: 'Oil Paint',
    emoji: '🖌️',
    color: '#EF4444',
    image: require('../assets/images/oil_still_life.png'),
    promptBuilder: (input: string) => `Classical oil painting of ${input}. Thick brush strokes, impasto texture, visible canvas grain. Rich deep colors, dramatic chiaroscuro lighting. Masterpiece, museum quality, historical art aesthetic.`
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    emoji: '💧',
    color: '#06B6D4',
    image: require('../assets/images/watercolor_lake.png'),
    promptBuilder: (input: string) => `Watercolor painting of ${input}. Soft color bleeding, delicate washes, paper texture. Dreamy atmosphere, light and airy composition. Artistic hand-drawn feel, elegant splashes.`
  },
  {
    id: 'pixel',
    label: 'Pixel Art',
    emoji: '🟩',
    color: '#10B981',
    image: require('../assets/images/pixel_spaceship.png'),
    promptBuilder: (input: string) => `Pixel art of ${input}. 16-bit aesthetic, crisp pixels, limited color palette. Retro video game sprite style, clean edges. Nostalgic 90s gaming look.`
  },
  {
    id: 'sketch',
    label: 'Sketch',
    emoji: '✏️',
    color: '#6B7280',
    image: require('../assets/images/sketch_portrait.png'),
    promptBuilder: (input: string) => `Hand-drawn sketch of ${input}. Pencil shading, rough charcoal lines, artistic cross-hatching. White paper background, minimalist yet detailed. Personal sketchbook aesthetic.`
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    emoji: '🎨',
    color: '#F43F5E',
    image: require('../assets/images/cartoon_puppy.png'),
    promptBuilder: (input: string) => `Stylized cartoon of ${input}. Disney Pixar inspired 3D style, smooth shading. Bright playful colors, cute proportions, expressive character design. High quality digital animation look.`
  },
  {
    id: 'vaporwave',
    label: 'Vaporwave',
    emoji: '🌴',
    color: '#D946EF',
    image: require('../assets/images/vaporwave_statue.png'),
    promptBuilder: (input: string) => `Vaporwave aesthetic of ${input}. 1980s retro-futurism, neon magenta and cyan colors, grid floors, greek statues. VHS glitch effects, nostalgic synthwave vibe.`
  },
  {
    id: 'steampunk',
    label: 'Steampunk',
    emoji: '⚙️',
    color: '#B45309',
    image: require('../assets/images/steampunk_owl.png'),
    promptBuilder: (input: string) => `Steampunk style ${input}. Victorian era fashion, brass gears, steam-powered machinery, goggles. Warm copper and brown tones, intricate mechanical details.`
  },
  {
    id: 'origami',
    label: 'Origami',
    emoji: '🦢',
    color: '#14B8A6',
    image: require('../assets/images/origami_crane.png'),
    promptBuilder: (input: string) => `Origami papercraft of ${input}. Geometric folds, crisp paper texture, clean shadows. Minimalist background, beautifully crafted folded paper art.`
  },
  {
    id: 'gothic',
    label: 'Gothic',
    emoji: '🦇',
    color: '#4B5563',
    image: require('../assets/images/gothic_cathedral.png'),
    promptBuilder: (input: string) => `Dark gothic style ${input}. Dramatic contrast, eerie atmosphere, elaborate architectural details. Moody lighting, monochromatic with hints of deep red, macabre elegant aesthetic.`
  },
  {
    id: 'pop_art',
    label: 'Pop Art',
    emoji: '💥',
    color: '#EAB308',
    image: require('../assets/images/pop_portrait.png'),
    promptBuilder: (input: string) => `Pop art style ${input}. Andy Warhol inspired, vibrant contrasting colors, Ben-Day dots, comic book style halftone patterns. Bold black outlines, retro 1960s pop culture vibe.`
  }
];

// Quality options
const QUALITY_OPTIONS = [
  { id: 'standard', label: 'Standard', desc: 'Fast generation', pro: false },
  { id: 'hd', label: 'HD', desc: 'High detail', pro: false },
  { id: 'ultra', label: 'Ultra 4K', desc: 'Maximum quality', pro: true },
];

// Safe helper to create a clean path
const getLocalUri = () => {
  return `${FileSystem.cacheDirectory}logixa_capture_${Date.now()}.jpg`;
};

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const MOCK_MODE = false; // 🔴 SET TO FALSE TO USE REAL API
  const { colors, activeTheme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ prompt?: string; style?: string; image?: string }>();
  const { mutate: generateReal, isPending: isPendingReal, data: resultData, error } = useGenerateImage();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const { getToken } = useAuth();
  const [mockImage, setMockImage] = useState<string | null>(null);
  const [mockPending, setMockPending] = useState(false);

  const resultImage = MOCK_MODE ? mockImage : resultData;
  const isPending = MOCK_MODE ? mockPending : isPendingReal;

  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const { showAlert } = useCustomAlert();

  const { isLoaded: isAdLoaded, showAd } = useGlobalRewardedAd();

  if (!isAuthLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  useEffect(() => {
    if (error) {
      showAlert({
        title: 'Generation Failed',
        message: 'Something went wrong while creating your art. Please try again.',
        type: 'error',
      });
    }
  }, [error, showAlert]);

  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('hd');

  const ALL_ART_STYLES = useMemo(() => {
    if (!params.style) return ART_STYLES;
    const exists = ART_STYLES.some(s => s.label.toLowerCase() === params.style?.toLowerCase() || s.id.toLowerCase() === params.style?.toLowerCase());
    if (exists) return ART_STYLES;

    const dynamicStyle = {
      id: params.style.toLowerCase().replace(/\s+/g, '_'),
      label: params.style,
      emoji: '✨',
      color: '#7C3AED',
      image: params.image ? Number(params.image) : require('../assets/images/fantasy_landscape_1777107572320.png'),
      promptBuilder: (input: string) => `${params.style} style of ${input}. High quality, detailed.`
    };

    return [dynamicStyle, ...ART_STYLES];
  }, [params.style, params.image]);

  const sortedStyles = useMemo(() => {
    if (!selectedStyle) return ALL_ART_STYLES;
    const selectedObj = ALL_ART_STYLES.find(s => s.id === selectedStyle);
    if (!selectedObj) return ALL_ART_STYLES;
    const otherStyles = ALL_ART_STYLES.filter(s => s.id !== selectedStyle);
    return [selectedObj, ...otherStyles];
  }, [selectedStyle, ALL_ART_STYLES]);

  const [isStylesExpanded, setIsStylesExpanded] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.prompt) {
      setPrompt(params.prompt);
    }
    if (params.style) {
      const foundStyle = ALL_ART_STYLES.find(s => s.label.toLowerCase() === params.style?.toLowerCase() || s.id.toLowerCase() === params.style?.toLowerCase());
      if (foundStyle) {
        setSelectedStyle(foundStyle.id);
      }
    }
  }, [params.prompt, params.style, ALL_ART_STYLES]);

  // Remove caching useEffect as we now download on-demand in handleSave/handleShare
  // This saves bandwidth as mock images/temp results aren't cached unless requested
  useEffect(() => {
    if (!resultImage) {
      setLocalImage(null);
    }
  }, [resultImage]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        title: 'Permission Denied',
        message: 'Please allow access to your photos to upload.',
        type: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSourceImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const ratioDimensions = useMemo(() => {
    switch (selectedRatio) {
      case '1:1': return { width: 1024, height: 1024 };
      case '4:3': return { width: 1024, height: 768 };
      case '3:4': return { width: 768, height: 1024 };
      case '16:9': return { width: 1024, height: 576 };
      case '9:16': return { width: 576, height: 1024 };
      case '2:3': return { width: 682, height: 1024 };
      default: return { width: 1024, height: 1024 };
    }
  }, [selectedRatio]);

  const activeStyleConfig = ART_STYLES.find(s => s.id === selectedStyle);

  const handleGenerate = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!prompt.trim()) {
      showAlert({
        title: 'Missing Prompt',
        message: 'Please enter a description for your image.',
        type: 'warning',
      });
      return;
    }

    if (profile && profile.credits < 1) {
      if (profile.ads_watched_today >= 5) {
        showAlert({
          title: 'Daily Limit Reached',
          message: 'You have reached the maximum limit of 5 ads per day. Please try again tomorrow!',
          type: 'error',
        });
      } else {
        showAlert({
          title: 'Out of Energy!',
          message: 'You need credits to generate more art. Watch a quick video ad to earn 1 free credit and continue creating.',
          type: 'warning',
          buttons: [
            { text: 'Maybe Later', style: 'cancel' },
            {
              text: isAdLoaded ? 'Watch Ad' : 'Ad Loading...',
              onPress: () => {
                if (isAdLoaded) {
                  showAd();
                } else {
                  showAlert({
                    title: 'Please Wait',
                    message: 'The ad is still loading. Try again in a few seconds.',
                    type: 'info',
                  });
                }
              }
            }
          ]
        });
      }
      return;
    }

    const styleObj = ART_STYLES.find(s => s.id === selectedStyle);
    const fullPrompt = styleObj?.promptBuilder ? styleObj.promptBuilder(prompt) : prompt;

    let source_url: string | undefined = undefined;
    if (sourceImage) {
      try {
        const response = await fetch(sourceImage);
        const blob = await response.blob();
        source_url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to read image as base64:", err);
        showAlert({
          title: 'Error',
          message: 'Failed to process the uploaded image.',
          type: 'error',
        });
        return;
      }
    }

    if (MOCK_MODE) {
      setMockPending(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setMockImage(`https://picsum.photos/1024/1024?sig=${Date.now()}`);
        setMockPending(false);
      }, 2000);
      return;
    }

    generateReal({
      prompt: fullPrompt,
      aspect_ratio: selectedRatio,
      quality: selectedQuality === 'ultra' ? 'high' : selectedQuality === 'hd' ? 'medium' : 'low',
      style: activeStyleConfig?.id !== 'none' ? activeStyleConfig?.label : undefined,
      ...(source_url ? { source_url } : {})
    }, {
      onSuccess: () => {
        refetchProfile();
      }
    });
  };

  const handleSave = async () => {
    if (!resultImage) {
      showAlert({
        title: 'Error',
        message: 'No image to save',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Permission Required',
          message: 'Gallery access is needed to save your AI art.',
          type: 'warning',
        });
        setIsSaving(false);
        return;
      }

      const localUri = getLocalUri();

      // Use the legacy downloadAsync
      const downloadResult = await FileSystem.downloadAsync(
        resultImage,
        localUri
      );

      // Save to Gallery
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      const albumName = 'Logixa AI';
      const album = await MediaLibrary.getAlbumAsync(albumName);

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert({
        title: 'Saved',
        message: 'Image saved to your Logixa AI album!',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Save Error:', err);
      showAlert({
        title: 'Save Failed',
        message: 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const localUri = getLocalUri();
      const downloadResult = await FileSystem.downloadAsync(resultImage, localUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share your AI Art',
        });
      }
    } catch (err) {
      console.error('Share error:', err);
      showAlert({
        title: 'Error',
        message: 'Failed to share image.',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBarStyle} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Create Magic <Text style={{ color: activeStyleConfig?.color || colors.accent }}>{activeStyleConfig?.emoji || '✨'}</Text></Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>Turn your imagination into reality</Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="close" size={20} color={colors.icon} />
          </TouchableOpacity>
        </Animated.View>

        {/* Credit Display */}
        <Animated.View entering={FadeInDown.delay(150).duration(600).springify()} style={styles.creditContainer}>
          <LinearGradient
            colors={['rgba(124, 58, 237, 0.1)', 'rgba(124, 58, 237, 0.05)']}
            style={styles.creditBadge}
          >
            <Ionicons name="flash" size={14} color="#7C3AED" />
            <Text style={[styles.creditText, { color: colors.text }]}>
              {profile?.credits ?? '-'} Credits Remaining
            </Text>
          </LinearGradient>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Result Preview Area - Only shown when pending or generated */}
          {(resultImage || isPending) && (
            <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.resultContainer}>
              <View style={[
                styles.resultCard,
                {
                  aspectRatio: ratioDimensions.width / ratioDimensions.height,
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }
              ]}>
                {/* Loading State */}
                {isPending && (
                  <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                    <LottieView
                      source={loadingAnimation}
                      autoPlay
                      loop
                      style={styles.lottieLoader}
                    />
                    <Text style={[styles.loadingText, { color: colors.text }]}>Synthesizing your masterpiece...</Text>
                  </View>
                )}

                {/* Success Result */}
                {!isPending && resultImage && (
                  <Animated.Image
                    entering={FadeInDown.duration(600)}
                    source={{ uri: resultImage }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}

                {/* Action Bar overlaid on image */}
                {!isPending && resultImage && (
                  <Animated.View entering={FadeInUp.delay(300).duration(500).springify()} style={[styles.actionOverlayWrapper, { borderColor: colors.border }]}>
                    <BlurView intensity={80} tint={activeTheme} style={styles.actionOverlay}>
                      <TouchableOpacity style={styles.iconBtn} onPress={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <ActivityIndicator size="small" color={colors.text} />
                        ) : (
                          <Ionicons name="download-outline" size={20} color={colors.text} />
                        )}
                        <Text style={[styles.iconBtnText, { color: colors.text }]}>{isSaving ? 'Saving...' : 'Save'}</Text>
                      </TouchableOpacity>
                      <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
                      <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                        <Ionicons name="share-outline" size={20} color={colors.text} />
                        <Text style={[styles.iconBtnText, { color: colors.text }]}>Share</Text>
                      </TouchableOpacity>
                    </BlurView>
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Prompt Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Prompt</Text>
            <View style={[styles.promptGlassContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.promptInput, { color: colors.text }]}
                placeholder="Describe what you want to see... e.g., 'A cyberpunk samurai in neon rain'"
                placeholderTextColor={colors.textMuted}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.promptFooter}>
                <View style={styles.promptFooterLeft}>
                  <TouchableOpacity style={[styles.uploadBtn, { borderColor: colors.border }]} onPress={pickImage}>
                    <Ionicons name="image-outline" size={20} color={colors.textMuted} />
                    {!sourceImage && (
                      <View style={styles.uploadPlusWrap}>
                        <Ionicons name="add" size={12} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {sourceImage && (
                    <View style={styles.sourceImageThumbWrap}>
                      <Image source={{ uri: sourceImage }} style={styles.sourceImageThumb} />
                      <TouchableOpacity
                        style={styles.sourceImageClear}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSourceImage(null);
                        }}
                      >
                        <Ionicons name="close" size={10} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.magicBtn} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const ideas = [
                    "A majestic lion made entirely of water, leaping over a waterfall",
                    "A futuristic city floating in the clouds, illuminated by neon lights",
                    "An astronaut exploring a vibrant, glowing alien forest",
                    "A cozy cabin in the snowy mountains, starry night, aurora borealis"
                  ];
                  setPrompt(ideas[Math.floor(Math.random() * ideas.length)]);
                }}>
                  <LinearGradient
                    colors={['#EC4899', '#8B5CF6']}
                    style={styles.magicGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="color-wand-outline" size={16} color="#FFF" />
                    <Text style={styles.magicText}>Inspire Me</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Art Style Grid */}
          <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabelNoMargin, { color: colors.text }]}>Art Style</Text>
              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsStylesExpanded(!isStylesExpanded);
              }}>
                <Text style={[styles.seeAll, { color: colors.accent }]}>
                  {isStylesExpanded ? 'Collapse' : 'See All >'}
                </Text>
              </TouchableOpacity>
            </View>

            {isStylesExpanded ? (
              <View style={styles.stylesGrid}>
                {sortedStyles.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleImageCard,
                        {
                          borderColor: isSelected ? style.color : 'transparent',
                          opacity: isSelected ? 1 : 0.6,
                          transform: [{ scale: isSelected ? 1 : 0.95 }],
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedStyle(selectedStyle === style.id ? null : style.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={style.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.styleCardGradient}
                      />
                      {isSelected && (
                        <View style={[styles.styleActiveOverlay, { backgroundColor: `${style.color}30` }]} />
                      )}
                      <Text style={styles.styleCardLabel}>{style.label}</Text>
                      {isSelected && (
                        <View style={[styles.styleCheckBadge, { backgroundColor: style.color }]}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                snapToInterval={122} // 110 width + 12 gap
                decelerationRate="fast"
              >
                {sortedStyles.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleImageCard,
                        {
                          borderColor: isSelected ? style.color : 'transparent',
                          opacity: isSelected ? 1 : 0.6,
                          transform: [{ scale: isSelected ? 1 : 0.95 }],
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedStyle(selectedStyle === style.id ? null : style.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={style.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.styleCardGradient}
                      />
                      {isSelected && (
                        <View style={[styles.styleActiveOverlay, { backgroundColor: `${style.color}30` }]} />
                      )}
                      <Text style={styles.styleCardLabel}>{style.label}</Text>
                      {isSelected && (
                        <View style={[styles.styleCheckBadge, { backgroundColor: style.color }]}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>

          {/* Aspect Ratio */}
          <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Aspect Ratio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                const maxW = 32;
                const maxH = 32;
                const scale = Math.min(maxW / ratio.w, maxH / ratio.h);
                const boxW = Math.round(ratio.w * scale);
                const boxH = Math.round(ratio.h * scale);

                return (
                  <TouchableOpacity
                    key={ratio.id}
                    style={[
                      styles.ratioCard,
                      {
                        backgroundColor: isSelected ? `${colors.accent}20` : colors.card,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedRatio(ratio.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.ratioPreviewBox,
                        {
                          width: boxW,
                          height: boxH,
                          borderColor: isSelected ? colors.accent : colors.textMuted,
                          backgroundColor: isSelected ? `${colors.accent}40` : 'transparent',
                        },
                      ]}
                    />
                    <Text style={[styles.ratioLabel, { color: isSelected ? colors.text : colors.textMuted }]}>
                      {ratio.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Quality Options */}
          <Animated.View entering={FadeInDown.delay(500).duration(600).springify()} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Quality</Text>
            <View style={styles.qualityRow}>
              {QUALITY_OPTIONS.map((q) => {
                const isSelected = selectedQuality === q.id;
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.qualityCard,
                      {
                        backgroundColor: isSelected ? `${colors.accent}20` : colors.card,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedQuality(q.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.qualityTitle, { color: isSelected ? colors.text : colors.textMuted }]}>
                      {q.label}
                    </Text>
                    <Text style={[styles.qualityDesc, { color: colors.textMuted }]}>{q.desc}</Text>
                    {q.pro && (
                      <LinearGradient
                        colors={['#F59E0B', '#EF4444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.proTag}
                      >
                        <Text style={styles.proTagText}>PRO</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Generate Button */}
      <View style={[styles.generateBarWrap, { backgroundColor: colors.background, bottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.generateBtn}
          activeOpacity={0.8}
          onPress={handleGenerate}
          disabled={isPending}
        >
          <LinearGradient
            colors={isPending ? ['#4C1D95', '#4C1D95'] : ['#4F1FE8', '#7C3AED', '#2D0F8F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          )}
          <Text style={styles.generateBtnText}>
            {isPending ? 'Crafting Image...' : 'Generate Art'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  creditContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  creditText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionLabelNoMargin: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },

  // Prompt Glass Box
  promptGlassContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  promptInput: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    minHeight: 100,
    lineHeight: 22,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  promptFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  uploadPlusWrap: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 2,
  },
  sourceImageThumbWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  sourceImageThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  sourceImageClear: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 2,
  },
  magicBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  magicGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  magicText: {
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  // Horizontal Scrolls
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },

  // Styles Grid 
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'center',
  },

  // Styles Grid (Image Cards)
  styleImageCard: {
    width: 110,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  styleCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  styleActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  styleCardLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  styleCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Aspect Ratio
  ratioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  ratioPreviewBox: {
    borderWidth: 2,
    borderRadius: 4,
  },
  ratioLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },

  // Quality
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  qualityCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 85,
  },
  qualityTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  qualityDesc: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  proTag: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
  },

  // Result Preview
  resultContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    width: '100%',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 12,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lottieLoader: {
    width: 200,
    height: 200,
  },
  loadingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    marginTop: -20,
  },
  actionOverlayWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  actionOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  actionDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },

  // Generate Bar
  generateBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 12,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
});
