import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { AD_UNIT_ID } from '@/utils/admob';
import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalRewardedAd } from '@/context/RewardedAdContext';

const adUnitId = AD_UNIT_ID;

export default function ProfileScreen() {
  const { colors, activeTheme, mode, setMode } = useTheme();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const { isLoaded, showAd, error } = useGlobalRewardedAd();
  const insets = useSafeAreaInsets();

  const logToken = async () => {
    try {
      const token = await getToken();
      console.log('--- DEBUG TOKEN ---');
      console.log(token);
      console.log('-------------------');
    } catch (err) {
      console.error('Failed to get token:', err);
    }
  };

  const userEmail = user?.primaryEmailAddress?.emailAddress || 'No email provided';
  const userName = user?.fullName || user?.username || 'User';
  const userImage = user?.imageUrl;

  const profileStats = [
    { label: 'Images', value: '0', icon: 'image-outline' },
    { label: 'Credits', value: profile?.credits?.toString() || '-', icon: 'flash-outline' },
    { label: 'Joined', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: 'calendar-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Gradient */}
        <LinearGradient
          colors={['#4F1FE8', '#7C3AED', '#2D0F8F']}
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative Orbs */}
          <View style={[styles.cardOrb, { backgroundColor: 'rgba(255,255,255,0.1)', top: -20, right: -20, width: 120, height: 120 }]} />
          <View style={[styles.cardOrb, { backgroundColor: 'rgba(255,255,255,0.05)', top: 60, left: -30, width: 80, height: 80 }]} />

          {/* Header Title */}
          <Text style={styles.headerTitleText}>Profile</Text>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.avatarLarge} />
            ) : (
              <View style={[styles.avatarPlaceholderLarge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.avatarInitialLarge}>{userName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.onlineBadge} />
          </View>

          {/* Name & Title */}
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileTitle}>{userEmail}</Text>

          {/* Stats Row */}
          <View style={styles.statsRowNew}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profileStats[0].value}</Text>
              <Text style={styles.statLabelNew}>Images</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profileStats[1].value}</Text>
              <Text style={styles.statLabelNew}>Credits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profileStats[2].value}</Text>
              <Text style={styles.statLabelNew}>Joined</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body Content */}
        <View style={styles.bodyContent}>
          
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APPEARANCE</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {(['light', 'dark', 'system'] as const).map((themeMode, index) => {
                const isSelected = mode === themeMode;
                const isLast = index === 2;

                let iconName: keyof typeof Ionicons.glyphMap = 'color-palette-outline';
                if (themeMode === 'light') iconName = 'sunny-outline';
                if (themeMode === 'dark') iconName = 'moon-outline';
                if (themeMode === 'system') iconName = 'phone-portrait-outline';

                return (
                  <TouchableOpacity
                    key={themeMode}
                    style={[
                      styles.row,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
                    ]}
                    onPress={() => setMode(themeMode)}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                        <Ionicons name={iconName} size={20} color="#8B5CF6" />
                      </View>
                      <Text style={[styles.rowText, { color: colors.text }]}>
                        {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} Mode
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Earn Credits Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>REWARDS</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.row}
                onPress={showAd}
                disabled={!isLoaded || (profile?.ads_watched_today ?? 0) >= 5}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                    <Ionicons name="play-circle-outline" size={20} color="#7C3AED" />
                  </View>
                  <View>
                    <Text style={[styles.rowText, { color: colors.text }]}>
                      {(profile?.ads_watched_today ?? 0) >= 5
                        ? 'Daily Limit Reached'
                        : (isLoaded ? 'Watch Ad for Credit' : (error ? 'Ad Unavailable' : 'Loading Reward Ad...'))}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'Poppins_400Regular' }}>
                      {(profile?.ads_watched_today ?? 0) >= 5
                        ? 'Come back tomorrow for more ads'
                        : (error ? 'Please try again in a few minutes' : `Credits earned today: ${profile?.ad_credits_earned_today ?? 0}/3`)}
                    </Text>
                  </View>
                </View>
                {!isLoaded && !error && (profile?.ads_watched_today ?? 0) < 5 && <ActivityIndicator size="small" color={colors.accent} />}
                {error && !isLoaded && (profile?.ads_watched_today ?? 0) < 5 && <Ionicons name="alert-circle" size={20} color={colors.error} />}
                {isLoaded && (profile?.ads_watched_today ?? 0) < 5 && <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />}
                {(profile?.ads_watched_today ?? 0) >= 5 && <Ionicons name="lock-closed" size={16} color={colors.iconMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Options */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT SETTINGS</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="person-outline" size={20} color="#3B82F6" />
                  </View>
                  <Text style={[styles.rowText, { color: colors.text }]}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="notifications-outline" size={20} color="#10B981" />
                  </View>
                  <Text style={[styles.rowText, { color: colors.text }]}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#F59E0B" />
                  </View>
                  <Text style={[styles.rowText, { color: colors.text }]}>Security</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Developer Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>DEVELOPER</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.row} onPress={logToken}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
                    <Ionicons name="code-working-outline" size={20} color="#6B7280" />
                  </View>
                  <Text style={[styles.rowText, { color: colors.text }]}>Log Session Token</Text>
                </View>
                <Ionicons name="terminal-outline" size={20} color={colors.iconMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>DANGER ZONE</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => signOut()}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  </View>
                  <Text style={[styles.rowText, { color: '#EF4444' }]}>
                    Sign Out
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    alignItems: 'center',
    paddingBottom: 25,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  cardOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 10,
  },
  avatarLarge: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholderLarge: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarInitialLarge: {
    color: '#FFFFFF',
    fontSize: 30,
    fontFamily: 'Poppins_700Bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    marginTop: 10,
  },
  profileTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  statsRowNew: {
    flexDirection: 'row',
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  statLabelNew: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bodyContent: {
    padding: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
  },
});
