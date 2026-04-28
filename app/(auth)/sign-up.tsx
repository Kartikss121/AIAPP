import { useTheme } from '@/context/ThemeContext';
import { useClerk, useOAuth, useSignUp } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/button';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const { setActive } = useClerk();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const { colors, activeTheme } = useTheme();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [code, setCode] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);

  const isLoading = fetchStatus === 'fetching';
  const isDark = activeTheme === 'dark';

  const handleGoogleSignIn = React.useCallback(async () => {
    setErrorMsg('');
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)'),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.navigate('/(tabs)');
      }
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.longMessage || 'Google sign in failed.');
    }
  }, []);

  const handleSubmit = async () => {
    if (!signUp || isLoading) return;
    setErrorMsg('');
    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
      });
      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.longMessage || 'Failed to create account.');
    }
  };

  const handleVerify = async () => {
    if (!signUp || isLoading) return;
    setErrorMsg('');
    try {
      await signUp.verifications.verifyEmailCode({ code });
      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        router.navigate('/(tabs)');
      }
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.longMessage || 'Invalid code.');
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <Image
        source={require('../../assets/images/lotus_bg.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        <Pressable
          style={styles.backCircle}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <Animated.View
          entering={FadeInUp.duration(800).springify()}
          style={[styles.whiteCard, { backgroundColor: isDark ? '#121212' : '#FFF' }]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={[styles.title, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                {pendingVerification ? "Verify Email 📬" : "Join Visionary AI"}
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                {pendingVerification
                  ? `Enter the code sent to ${emailAddress}`
                  : "Create an account to start generating magic"}
              </Text>
            </View>

            <View style={styles.form}>
              {pendingVerification ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: isDark ? '#FFF' : '#333' }]}>Verification Code</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB',
                      borderColor: isDark ? '#333' : '#E5E7EB',
                      color: isDark ? '#FFF' : '#000'
                    }]}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: isDark ? '#FFF' : '#333' }]}>Email</Text>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB',
                      borderColor: isDark ? '#333' : '#E5E7EB',
                      color: isDark ? '#FFF' : '#000'
                    }]}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              )}

              {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

              <Button
                title={isLoading ? "Please wait..." : (pendingVerification ? "Create Account" : "Sign Up")}
                onPress={pendingVerification ? handleVerify : handleSubmit}
                disabled={isLoading || (!pendingVerification && !emailAddress) || (pendingVerification && !code)}
                style={styles.primaryBtn}
              />

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <Pressable
                  style={[styles.socialBtn, { backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB' }]}
                  onPress={handleGoogleSignIn}
                >
                  <Ionicons name="logo-google" size={20} color={isDark ? '#FFF' : '#000'} />
                  <Text style={[styles.socialText, { color: isDark ? '#FFF' : '#333' }]}>Continue with Google</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.5)' : '#666' }]}>
                  {pendingVerification ? "Wrong email? " : "Already have an account? "}
                </Text>
                <Pressable onPress={() => {
                  if (pendingVerification) {
                    setPendingVerification(false);
                  } else {
                    router.replace('/(auth)/sign-in');
                  }
                }}>
                  <Text style={[styles.footerLink, { color: colors.accent }]}>
                    {pendingVerification ? "Change email" : "Sign In"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    zIndex: 10,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  whiteCard: {
    width: '100%',
    height: height * 0.65,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
    borderRadius: 14,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
  },
  primaryBtn: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
  },
});
