
import { apiService } from './api';

const PROMOTION_SERVICE_URL = 'http://localhost:8004/api/v1/promotions';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface Promotion {
  id: number;
  restaurant_id: number;
  name: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
}

export interface CreatePromotionRequest {
  name: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount_value: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
}

export interface UpdatePromotionRequest {
    description?: string;
    is_active?: boolean;
    end_date?: string;
    usage_limit?: number;
    used_count?: number; // Thêm trường used_count để cập nhật lượt dùng
}

export const promotionApiService = {
  async getRestaurantPromotions(restaurantId: string | number): Promise<Promotion[]> {
    const response = await fetch(`${PROMOTION_SERVICE_URL}/restaurants/${restaurantId}/promotions`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy danh sách khuyến mãi.');
    }

    return await response.json();
  },

  async createPromotion(restaurantId: string | number, data: CreatePromotionRequest): Promise<Promotion> {
    const response = await fetch(`${PROMOTION_SERVICE_URL}/restaurants/${restaurantId}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('seller'),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Không thể tạo khuyến mãi.');
    }

    return await response.json();
  },

  async updatePromotion(promotionId: number, data: UpdatePromotionRequest): Promise<Promotion> {
    // Endpoint: /api/v1/promotions/promotions/{promotion_id}
    const response = await fetch(`${PROMOTION_SERVICE_URL}/promotions/${promotionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'), // Sử dụng quyền user khi khách hàng thực hiện order
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể cập nhật khuyến mãi.');
    }

    return await response.json();
  },

  async deletePromotion(promotionId: number): Promise<void> {
    const response = await fetch(`${PROMOTION_SERVICE_URL}/promotions/${promotionId}`, {
      method: 'DELETE',
      headers: {
        ...apiService.getAuthHeaders('seller'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể xóa khuyến mãi.');
    }
  }
};
