
import { apiService } from './api';

const PROFILE_SERVICE_URL = 'http://localhost:8002';

export interface UserProfileData {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
}

export const profileApiService = {
  async getProfile(userId: string | number): Promise<UserProfileData> {
    const response = await fetch(`${PROFILE_SERVICE_URL}/api/v1/profiles/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
    });

    if (response.status === 404) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy thông tin hồ sơ.');
    }

    const result: ProfileResponse = await response.json();
    return result.data;
  },

  async createProfile(data: UserProfileData): Promise<UserProfileData> {
    const response = await fetch(`${PROFILE_SERVICE_URL}/api/v1/profiles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Không thể tạo hồ sơ.');
    }

    const result: ProfileResponse = await response.json();
    return result.data;
  },

  async updateProfile(userId: string | number, data: Partial<UserProfileData>): Promise<UserProfileData> {
    const response = await fetch(`${PROFILE_SERVICE_URL}/api/v1/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Không thể cập nhật hồ sơ.');
    }

    const result: ProfileResponse = await response.json();
    return result.data;
  }
};
