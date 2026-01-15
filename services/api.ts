
// Sử dụng biến môi trường cho BASE_URL, mặc định là localhost:8000
const BASE_URL = 'http://localhost:8003';

export type UserRole = 'user' | 'seller' | 'shipper' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'banned';

export interface UserMe {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AdminUserListItem {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export const apiService = {
  async register(userData: { email: string; password: string; role: UserRole }) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
    }

    return await response.json();
  },

  async login(credentials: { email: string; password: string }, role: UserRole) {
    const response = await fetch(`${BASE_URL}/auth/login/${role}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }

    const data = await response.json();
    
    // Lưu trữ token theo prefix role
    localStorage.setItem(`${role}_token`, data.access_token);
    localStorage.setItem(`${role}_token_type`, data.token_type);
    localStorage.setItem(`${role}_logged_in`, 'true');
    
    return data;
  },

  async getMe(role: UserRole): Promise<UserMe> {
    const headers = this.getAuthHeaders(role);
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        this.logout(role);
      }
      throw new Error(errorData.detail || 'Không thể lấy thông tin người dùng.');
    }

    const userData = await response.json();
    // Lưu trạng thái vào localStorage để Guard check nhanh
    localStorage.setItem(`${role}_status`, userData.status);
    return userData;
  },

  // --- Admin API Methods ---
  async adminGetUsers(): Promise<AdminUserListItem[]> {
    const headers = this.getAuthHeaders('admin');
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy danh sách người dùng.');
    }

    return await response.json();
  },

  async adminUpdateUserStatus(userId: number, status: UserStatus): Promise<AdminUserListItem> {
    const headers = this.getAuthHeaders('admin');
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Cập nhật trạng thái thất bại.');
    }

    return await response.json();
  },

  async adminDeleteUser(userId: number): Promise<{ message: string }> {
    const headers = this.getAuthHeaders('admin');
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/delete`, {
      method: 'PATCH',
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Xóa người dùng thất bại.');
    }

    return await response.json();
  },

  logout(role: UserRole) {
    localStorage.removeItem(`${role}_token`);
    localStorage.removeItem(`${role}_token_type`);
    localStorage.removeItem(`${role}_logged_in`);
    localStorage.removeItem(`${role}_status`);
    
    if (role === 'seller') {
      localStorage.removeItem('restaurant_profile_status');
    }
    if (role === 'shipper') {
      localStorage.removeItem('shipper_profile_status');
    }
  },

  getToken(role: UserRole) {
    return localStorage.getItem(`${role}_token`);
  },

  getAuthHeaders(role: UserRole) {
    const token = this.getToken(role);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};
