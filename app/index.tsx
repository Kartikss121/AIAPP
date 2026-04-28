import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@clerk/expo';
import MaskedView from '@react-native-masked-view/masked-view';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/button';

const { height } = Dimensions.get('window');

const GradientText = ({ text, style }: { text: string; style?: any }) => {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]}>{text}</Text>
      }
    >
      <LinearGradient
        colors={['#f200ff', '#5900ff', '#f700ff', '#5100ff']}
        locations={[0, 0.4, 0.6, 1]} // This spreads the middle colors out
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default function GetStartedScreen() {
  const router = useRouter();
  const { colors, activeTheme } = useTheme();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBarStyle} />

      {/* Masonry Image Grid Background */}
      <View style={styles.gridContainer}>
        {/* Left Column */}
        <View style={[styles.column, { marginTop: 40 }]}>
          <Image
            source={require('../assets/images/fantasy_landscape_1777107572320.png')}
            style={[styles.image, { height: 200 }]}
            contentFit="cover"
          />
          <Image
            source={require('../assets/images/neon_city_1777107555700.png')}
            style={[styles.image, { height: 260 }]}
            contentFit="cover"
          />
          <Image
            source={require('../assets/images/anime_boy_1777107534204.png')}
            style={[styles.image, { height: 160 }]}
            contentFit="cover"
          />
        </View>

        {/* Center Column */}
        <View style={[styles.column, { marginTop: 0 }]}>
          <Image
            source={require('../assets/images/mecha_girl_1777107587543.png')}
            style={[styles.image, { height: 260 }]}
            contentFit="cover"
          />
          <Image
            source={require('../assets/images/anime_boy_1777107534204.png')}
            style={[styles.image, { height: 200 }]}
            contentFit="cover"
          />
          <Image
            source={require('../assets/images/fantasy_landscape_1777107572320.png')}
            style={[styles.image, { height: 180 }]}
            contentFit="cover"
          />
        </View>

        {/* Right Column */}
        <View style={[styles.column, { marginTop: 40 }]}>
          <Image
            source={require('../assets/images/fantasy_landscape_1777107572320.png')}
            style={[styles.image, { height: 200 }]}
            contentFit="cover"
          />
          <Image
            source={require('../assets/images/neon_city_1777107555700.png')}
            style={[styles.image, { height: 260 }]}
            contentFit="cover"
          />
          <Image
            source={require('../assets/images/mecha_girl_1777107587543.png')}
            style={[styles.image, { height: 160 }]}
            contentFit="cover"
          />
        </View>

        {/* Gradient Overlay for Text Visibility */}
        <LinearGradient
          colors={['transparent', colors.background, colors.background]}
          style={styles.gradient}
        />
      </View>

      {/* Content */}
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          {activeTheme === 'dark' ? (
            <GradientText
              text="Visionary AI"
              style={styles.title}
            />
          ) : (
            <Text style={[styles.title, { color: colors.text }]}>
              Visionary AI
            </Text>
          )}
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Transform your imagination into stunning visual masterpieces with just a few words.
          </Text>
        </View>

        <Button
          title="Get Started"
          onPress={() => router.navigate('/(tabs)')}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    height: height * 0.85,
    paddingHorizontal: 12,
    paddingTop: 40,
    gap: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
    gap: 12,
  },
  image: {
    width: '100%',
    borderRadius: 16,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-end',
    paddingBottom: 80,
  },
  textContent: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 48,
    textAlign: 'center',
  },
  titleHighlight: {
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
