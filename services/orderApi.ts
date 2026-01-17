
import { apiService } from './api';

const ORDER_SERVICE_URL = 'http://localhost:8002';

export interface OrderItemRequest {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  note: string;
}

export interface CreateOrderRequest {
  user_id: string;
  restaurant_id: string;
  delivery_address: string;
  delivery_note: string;
  payment_method: string;
  items: OrderItemRequest[];
}

export interface OrderResponseData {
  id: string;
  user_id: string;
  restaurant_id: string;
  driver_id: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_address: string;
  delivery_note: string;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  total_amount: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: OrderResponseData;
}

export const orderApiService = {
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponseData> {
    const response = await fetch(`${ORDER_SERVICE_URL}/api/v1/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Đặt hàng thất bại. Vui lòng thử lại.');
    }

    const result: CreateOrderResponse = await response.json();
    return result.data;
  }
};
