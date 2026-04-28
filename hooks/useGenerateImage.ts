import { useAuth } from '@clerk/expo';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface GenerateParams {
  prompt: string;
  aspect_ratio: string;
  style?: string;
  quality: string;
  source_url?: string;
  strength?: number;
}

export const useGenerateImage = () => {
  const { getToken } = useAuth(); // ✅ inside hook

  return useMutation({
    mutationFn: async (params: GenerateParams) => {
      console.log('Generating with params:', params);

      const token = await getToken({ template: "fastapi" }); // ✅ fetch fresh token
      console.log(token);

      const endpoint = params.source_url
        ? `${API_URL}/image-to-image`
        : `${API_URL}/text-to-image`;

      const response = await axios.post(endpoint, params, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
          Authorization: `Bearer ${token}`, // ✅ IMPORTANT
        },
      });

      console.log('✅ API SUCCESS:', {
        status: response.status,
        data: response.data,
      });

      return response.data.url;
    },
    onError: (error: any) => {
      console.log('❌ API ERROR:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};