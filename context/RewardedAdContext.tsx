import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { useAuth } from '@clerk/expo';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AD_UNIT_ID } from '@/utils/admob';
import { useProfile } from '@/hooks/useProfile';
import { useCustomAlert } from '@/context/AlertContext';

interface RewardedAdContextType {
  isLoaded: boolean;
  showAd: () => void;
  loadAd: () => void;
  error?: Error;
}

const RewardedAdContext = createContext<RewardedAdContextType | undefined>(undefined);

// Module-level lock to persist across ALL renders and Strict Mode remounts
let globalRewardLock = false;
let lastRewardTime = 0;

export const RewardedAdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { refetch: refetchProfile } = useProfile();
  const { showAlert } = useCustomAlert();

  const { isLoaded, isEarnedReward, show, load, reward, error } = useRewardedAd(AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  // Auto-reload ads
  useEffect(() => {
    if (!isLoaded && !error) {
      load();
    }
  }, [isLoaded, load, error]);

  useEffect(() => {
    if (error) {
      console.warn('AdMob Load Error (No Fill / Rate Limit). Retrying in 5s...', error.message);
      // Wait a few seconds before trying to reload to avoid rate limits
      const timer = setTimeout(() => {
        load();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, load]);

  // Global reward listener
  useEffect(() => {
    const syncReward = async () => {
      const now = Date.now();
      // Only process if: 
      // 1. Hook says we earned a reward
      // 2. We haven't locked this ad session yet
      // 3. It's been at least 2 seconds since the last reward (extra safety)
      if (isEarnedReward && reward && !globalRewardLock && (now - lastRewardTime > 2000)) {
        globalRewardLock = true;
        lastRewardTime = now;
        
        console.log('--- GLOBAL REWARD PROCESSOR ---');
        console.log('User earned reward of ', reward);

        // 1. Optimistic Update
        queryClient.setQueryData(['profile'], (old: any) => {
          if (!old) return old;
          return { ...old, credits: (old.credits || 0) + 1 };
        });

        // 2. Backend Sync
        try {
          const token = await getToken();
          const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/add-reward-credits`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': '69420',
            }
          });
          
          if (res.data.credit_granted) {
            showAlert({
              title: 'Success',
              message: "You've earned 1 credit!",
              type: 'success',
            });
          } else {
            showAlert({
              title: 'Daily Credit Limit',
              message: "Thanks for watching! You've reached your limit of 3 free credits from ads today.",
              type: 'info',
            });
          }
        } catch (err: any) {
          console.error('Global sync failed:', err);
          showAlert({
            title: 'Sync Error',
            message: err?.response?.data?.detail || 'Reward earned but failed to sync with server.',
            type: 'error',
          });
        }

        // 3. Final Sync
        refetchProfile();
      }
    };

    syncReward();
  }, [isEarnedReward, reward, queryClient, refetchProfile, getToken]);

  const showAd = () => {
    if (isLoaded) {
      globalRewardLock = false; // Reset the lock exactly when the ad begins
      show();
    } else {
      showAlert({
        title: 'Ad Loading',
        message: 'The ad is still preparing. Please try again in a few seconds.',
        type: 'info',
      });
      load();
    }
  };

  return (
    <RewardedAdContext.Provider value={{ isLoaded, showAd, loadAd: load, error }}>
      {children}
    </RewardedAdContext.Provider>
  );
};

export const useGlobalRewardedAd = () => {
  const context = useContext(RewardedAdContext);
  if (context === undefined) {
    throw new Error('useGlobalRewardedAd must be used within a RewardedAdProvider');
  }
  return context;
};
