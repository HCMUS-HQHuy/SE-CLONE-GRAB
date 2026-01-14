
// Sử dụng biến môi trường cho BASE_URL, mặc định là localhost:8000
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export type UserRole = 'user' | 'seller' | 'shipper' | 'admin';

export const apiService = {
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
      // Hiển thị message chi tiết từ server (ví dụ: "User is not allowed to login as...")
      throw new Error(errorData.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }

    const data = await response.json();
    
    // Lưu trữ thông tin định danh vào localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_type', data.token_type);
    
    return data;
  },

  async signup(userData: any) {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
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

  logout() {
    // Xóa toàn bộ trạng thái phiên làm việc
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('restaurant_profile_status');
    localStorage.removeItem('shipper_profile_status');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};
