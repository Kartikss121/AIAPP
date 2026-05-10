import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { colors, activeTheme } = useTheme();
  const router = useRouter();
  const { user } = useUser();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const isDark = activeTheme === 'dark';
  const { mutate: deleteAccountRequest, isPending: isDeleting } = useDeleteAccount();

  const handleDeleteRequest = () => {
    if (!deleteReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for deleting your account.');
      return;
    }
    deleteAccountRequest({ reason: deleteReason }, {
      onSuccess: () => {
        setIsDeleteModalVisible(false);
        setDeleteReason('');
        Alert.alert('Request Sent', 'Your request to delete the account has been submitted to the admin for review.', [
          { text: 'OK' }
        ]);
      },
      onError: () => {
        Alert.alert('Error', 'Failed to submit request. Please try again.');
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.longMessage || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* First Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="First Name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Last Name"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Save Button */}
          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.accent, opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </Pressable>

          {/* Delete Account Button */}
          <Pressable
            style={styles.deleteInitBtn}
            onPress={() => setIsDeleteModalVisible(true)}
          >
            <Ionicons name="warning-outline" size={18} color="#EF4444" />
            <Text style={styles.deleteInitBtnText}>Delete Account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Delete Account Reason Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={28} color="#EF4444" />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Account</Text>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Please tell us why you are leaving. An admin will review and process your request.
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Reason for deletion..."
              placeholderTextColor={colors.textMuted}
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setDeleteReason('');
                }}
                disabled={isDeleting}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: '#EF4444', opacity: isDeleting ? 0.7 : 1 }]}
                onPress={handleDeleteRequest}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 24,
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
  saveBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  deleteInitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
    paddingVertical: 12,
  },
  deleteInitBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
});
