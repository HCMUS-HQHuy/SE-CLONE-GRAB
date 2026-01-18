
import { apiService } from './api';

const SHIPPER_SERVICE_URL = 'http://localhost:8001';

export interface CreateDriverRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  citizenIdImage: File;
  driverLicenseImage: File;
  driverRegistrationImage: File;
  driverId: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  status: string;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  profileImageUrl: string | null;
  citizenIdImageUrl: string;
  driverLicenseImageUrl: string;
  driverRegistrationImageUrl: string;
  licenseNumber?: string;
}

export interface DriversResponse {
  items: Driver[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type TripStatus = 'Assigned' | 'Accepted' | 'PickedUp' | 'InTransit' | 'Delivered' | 'Cancelled' | 'Failed' | 'Rejected';

export interface TripItem {
  id: string;
  orderId: string;
  status: TripStatus;
  pickupAddress: string;
  deliveryAddress: string;
  fare: number;
  assignedAt: string;
  deliveredAt: string | null;
  distanceKm: number | null;
}

export interface TripsResponse {
  items: TripItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId: string | null;
  reference: string | null;
  description: string;
  createdAt: string;
  isCredit: boolean;
}

export const shipperApiService = {
  async createDriverProfile(data: CreateDriverRequest) {
    const formData = new FormData();
    formData.append('FullName', data.fullName);
    formData.append('PhoneNumber', data.phoneNumber);
    formData.append('Email', data.email);
    formData.append('LicenseNumber', data.licenseNumber);
    formData.append('CitizenIdImage', data.citizenIdImage);
    formData.append('DriverLicenseImage', data.driverLicenseImage);
    formData.append('DriverRegistrationImage', data.driverRegistrationImage);
    formData.append('DriverId', data.driverId);

    const headers = apiService.getAuthHeaders('shipper');

    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Drivers`, {
      method: 'POST',
      headers: { ...headers },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể gửi hồ sơ tài xế.');
    }
    return await response.text();
  },

  async getDrivers(page = 1, pageSize = 20, verificationStatus?: string, searchTerm?: string): Promise<DriversResponse> {
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (verificationStatus && verificationStatus !== 'All') params.append('verificationStatus', verificationStatus);
    if (searchTerm) params.append('searchTerm', searchTerm);

    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Drivers?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('admin'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy danh sách tài xế.');
    }

    return await response.json();
  },

  async getDriverById(id: string): Promise<Driver> {
    const headers = apiService.getAuthHeaders('shipper');
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Drivers/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không tìm thấy thông tin tài xế.');
    }

    return await response.json();
  },

  async updateDriverProfile(id: string, data: { fullName: string; email: string; phoneNumber: string }): Promise<void> {
    const headers = apiService.getAuthHeaders('shipper');
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Drivers/${id}/profile`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Cập nhật hồ sơ tài xế thất bại.');
    }
  },

  async verifyDriver(id: string): Promise<void> {
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Drivers/${id}/verify`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        ...apiService.getAuthHeaders('admin'),
      },
      body: '',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Xác thực tài xế trên Shipper Service thất bại.');
    }
  },

  async getDriverTrips(driverId: string, activeOnly = false, page = 1, pageSize = 20): Promise<TripsResponse> {
    const params = new URLSearchParams({
      activeOnly: activeOnly.toString(),
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Trips/driver/${driverId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('shipper'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy danh sách chuyến đi.');
    }

    return await response.json();
  },

  async updateTripStatus(tripId: string, status: TripStatus): Promise<void> {
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Trips/${tripId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        ...apiService.getAuthHeaders('shipper'),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.title || 'Cập nhật trạng thái chuyến đi thất bại.');
    }
  },

  async completeTrip(tripId: string): Promise<void> {
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/Trips/${tripId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        ...apiService.getAuthHeaders('shipper'),
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.title || 'Hoàn tất chuyến đi thất bại.');
    }
  },

  async getWalletTransactions(driverId: string, page = 1, pageSize = 20): Promise<Transaction[]> {
    const params = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    const response = await fetch(`${SHIPPER_SERVICE_URL}/api/drivers/${driverId}/wallet/transactions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...apiService.getAuthHeaders('shipper'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể lấy lịch sử giao dịch ví.');
    }

    return await response.json();
  }
};
