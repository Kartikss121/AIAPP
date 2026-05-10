import { useAuth } from '@clerk/expo';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface GenerateVideoParams {
  prompt: string;
  aspect_ratio: string;
  duration?: number;
  audio?: boolean;
  source_url?: string;
}

export const useGenerateVideo = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (params: GenerateVideoParams) => {
      console.log('Generating video with params:', params);

      const token = await getToken({ template: "fastapi" });
      
      const endpoint = `${API_URL}/generate-video`;

      const response = await axios.post(endpoint, params, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ API SUCCESS (Video):', {
        status: response.status,
        data: response.data,
      });

      return response.data.url;
    },
    onError: (error: any) => {
      console.log('❌ API ERROR (Video):', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};
