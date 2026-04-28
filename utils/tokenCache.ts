import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      const item = await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      console.error('❌ AsyncStorage get item error: ', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.error('❌ AsyncStorage save item error: ', err);
    }
  },
  async clearToken(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error('❌ AsyncStorage delete item error: ', err);
    }
  }
};
