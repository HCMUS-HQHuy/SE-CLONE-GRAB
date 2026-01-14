
// Sử dụng biến môi trường cho BASE_URL, mặc định là localhost nếu không được định nghĩa
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export const apiService = {
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
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
    
    // Lưu trữ thông tin định danh vào localStorage cho prototype
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
