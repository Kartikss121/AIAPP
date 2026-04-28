import { useAuth } from '@clerk/expo';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface UserProfile {
  user_id: string;
  email: string;
  credits: number;
  plan: string;
  ads_watched_today: number;
  ad_credits_earned_today: number;
}

export const useProfile = () => {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420',
        },
      });

      return response.data as UserProfile;
    },
    enabled: !!isSignedIn,
  });
};
