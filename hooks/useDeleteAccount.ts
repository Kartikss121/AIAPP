import { useAuth } from '@clerk/expo';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface DeleteAccountParams {
  reason: string;
}

export const useDeleteAccount = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (params: DeleteAccountParams) => {
      console.log('Requesting account deletion with reason:', params.reason);

      const token = await getToken({ template: "fastapi" });

      const endpoint = `${API_URL}/request-delete-account`;

      const response = await axios.post(endpoint, params, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ DELETE ACCOUNT REQUEST SUCCESS:', {
        status: response.status,
        data: response.data,
      });

      return response.data;
    },
    onError: (error: any) => {
      console.log('❌ DELETE ACCOUNT REQUEST ERROR:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};
