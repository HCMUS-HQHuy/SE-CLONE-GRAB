
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
        // Lưu ý: Không set 'Content-Type' khi dùng FormData, browser sẽ tự set kèm boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Không thể tạo hồ sơ nhà hàng.');
    }

    return await response.json();
  }
};
