
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

export interface UpdateRestaurantRequest {
  name?: string;
  address?: string;
  phone?: string;
  description?: string;
  is_open?: boolean;
  opening_hours?: string;
  business_license_image?: string;
  food_safety_certificate_image?: string;
  status?: string;
}

export interface CreateDishRequest {
  name: string;
  price: string;
  discounted_price?: string;
  description?: string;
  category_id?: number;
  image?: File;
  is_available?: boolean;
  stock_quantity?: number;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  price?: number;
  discounted_price?: number;
  image?: File;
  category_id?: number;
  is_available?: boolean;
  stock_quantity?: number;
}

export interface DishResponse {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: string;
  discounted_price: string | null;
  image_url: string | null;
  category_id: number;
  is_available: boolean;
  stock_quantity: number;
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

  async updateRestaurant(id: number, data: UpdateRestaurantRequest): Promise<RestaurantListItem> {
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/restaurants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...apiService.getAuthHeaders('seller'),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Cập nhật hồ sơ nhà hàng thất bại.');
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

  async getRestaurantById(id: number): Promise<RestaurantListItem> {
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/restaurants/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không tìm thấy thông tin nhà hàng.');
    }

    return await response.json();
  },

  async getRestaurantByOwner(ownerId: number): Promise<RestaurantListItem> {
    const headers = apiService.getAuthHeaders('seller');
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/restaurants/owner/${ownerId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy thông tin nhà hàng của bạn.');
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    throw new Error('Bạn chưa đăng ký nhà hàng.');
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
  },

  async getDishes(restaurantId: number): Promise<DishResponse[]> {
    const headers = apiService.getAuthHeaders('user');
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/menu/restaurants/${restaurantId}/dishes`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy danh sách món ăn.');
    }

    return await response.json();
  },

  async getAllDishes(params?: { category_id?: number, available_only?: boolean, skip?: number, limit?: number }): Promise<DishResponse[]> {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.available_only !== undefined) query.append('available_only', params.available_only.toString());
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());

    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/menu/dishes?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('user'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể tải danh sách món ăn.');
    }

    return await response.json();
  },

  async updateDish(dishId: number, data: UpdateDishRequest): Promise<DishResponse> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.discounted_price !== undefined) formData.append('discounted_price', data.discounted_price.toString());
    if (data.category_id !== undefined) formData.append('category_id', data.category_id.toString());
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString());
    if (data.stock_quantity !== undefined) formData.append('stock_quantity', data.stock_quantity.toString());
    if (data.image) formData.append('image', data.image);

    const headers = apiService.getAuthHeaders('seller');
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/menu/dishes/${dishId}`, {
      method: 'PUT',
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Cập nhật món ăn thất bại.');
    }

    return await response.json();
  },

  async createDish(restaurantId: number, data: CreateDishRequest) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price);
    if (data.discounted_price) formData.append('discounted_price', data.discounted_price);
    if (data.description) formData.append('description', data.description);
    if (data.category_id) formData.append('category_id', data.category_id.toString());
    if (data.image) formData.append('image', data.image);
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString());
    if (data.stock_quantity) formData.append('stock_quantity', data.stock_quantity.toString());

    const headers = apiService.getAuthHeaders('seller');

    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/v1/menu/restaurants/${restaurantId}/dishes`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Không thể tạo món ăn.');
    }

    return await response.json();
  }
};
