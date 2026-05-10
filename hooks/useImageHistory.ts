import { useAuth } from '@clerk/expo';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ImageHistoryItem {
  _id: string;
  user_id: string;
  url: string;
  prompt: string;
  type: string;
  created_at: string;
}

export const useImageHistory = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['image-history'],
    queryFn: async () => {
      const token = await getToken({ template: 'fastapi' });
      const response = await axios.get(`${API_URL}/image-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420',
        },
      });
      return response.data as ImageHistoryItem[];
    },
  });
};
