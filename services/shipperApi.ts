
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
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Không thể gửi hồ sơ tài xế. Vui lòng thử lại.');
    }

    return await response.text(); // API returns text/plain 201 Created
  }
};
