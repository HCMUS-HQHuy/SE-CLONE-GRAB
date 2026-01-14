
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
      throw new Error(errorData.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }

    const data = await response.json();
    
    // Lưu trữ token theo prefix role
    localStorage.setItem(`${role}_token`, data.access_token);
    localStorage.setItem(`${role}_token_type`, data.token_type);
    localStorage.setItem(`${role}_logged_in`, 'true');
    
    return data;
  },

  logout(role: UserRole) {
    // Chỉ xóa các thông tin liên quan đến role đó
    localStorage.removeItem(`${role}_token`);
    localStorage.removeItem(`${role}_token_type`);
    localStorage.removeItem(`${role}_logged_in`);
    
    // Xóa thêm các status phụ tùy theo role
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
