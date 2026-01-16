
import { apiService } from './api';

const RESTAURANT_SERVICE_URL = 'http://localhost:8004';

export interface CreateRestaurantRequest {
  owner_id: number;
  name: string;
  address: string;
  phone: string;
  description: string;
  opening_hours: string;
  business_license_image: File;
  food_safety_certificate_image: File;
}

export interface RestaurantListItem {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  opening_hours: string;
  business_license_image: string;
  food_safety_certificate_image: string;
  rating: number;
  is_open: boolean;
  status: 'PENDING' | 'ACTIVE' | 'BANNED' | 'REJECTED';
  created_at: string;
}

export const restaurantApiService = {
  async createRestaurant(data: CreateRestaurantRequest) {
    const formData = new FormData();
    formData.append('owner_id', data.owner_id.toString());
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('phone', data.phone);
    formData.append('description', data.description);
    formData.append('opening_hours', data.opening_hours);
    formData.append('business_license_image', data.business_license_image);
    formData.append('food_safety_certificate_image', data.food_safety_certificate_image);

    const headers = apiService.getAuthHeaders('seller');

    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/restaurants/`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Không thể tạo hồ sơ nhà hàng.');
    }

    return await response.json();
  },

  async getRestaurants(skip = 0, limit = 100, status?: string): Promise<RestaurantListItem[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (status && status !== 'All') params.append('status', status);

    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/restaurants/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('admin'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy danh sách nhà hàng.');
    }

    return await response.json();
  },

  async updateStatus(restaurantId: number, status: string) {
     const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/restaurants/${restaurantId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...apiService.getAuthHeaders('admin'),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Cập nhật trạng thái nhà hàng thất bại.');
    }

    return await response.json();
  }
};
