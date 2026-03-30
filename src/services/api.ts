export interface User {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  confession_count: number;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  totalConfessions: number;
  totalCategories: number;
  totalCommunities: number;
  totalRevenue: number;
}

export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price_tzs: number;
  bonus: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralSettings {
  id?: number;
  referral_bonus_tzs: number;
  referral_withdraw_min_tzs: number;
  rate_tzs_per_credit: number;
  buy_rate_tzs_per_credit: number;
  sell_rate_tzs_per_credit: number;
  usd_to_tzs_rate: number;
  ksh_to_tzs_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSettings {
  id: number;
  support_email: string;
  support_phone: string;
  office_hours: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: number;
  title: string | null;
  image_url: string;
  link_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginResponse {
  token: string;
  user: User;
  message: string;
}

class AdminApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Auth
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`${this.baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async getMe(token: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseUrl}/admin/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admin info');
    }

    return response.json();
  }

  async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  }

  // Users
  async getUsers(token: string, page = 1, search = '', verified?: boolean): Promise<any> {
    let url = `${this.baseUrl}/admin/users?page=${page}&per_page=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (verified !== undefined) url += `&verified=${verified ? 1 : 0}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getUser(token: string, id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/users/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  async updateUser(token: string, id: number, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  }

  async deleteUser(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return response.json();
  }

  // Categories
  async getCategories(): Promise<{ data: Category[] }> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async createCategory(token: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    return response.json();
  }

  async updateCategory(token: string, id: number, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    return response.json();
  }

  // Credit packages
  async getCreditPackages(token: string): Promise<{ data: CreditPackage[] }> {
    const response = await fetch(`${this.baseUrl}/admin/credit-packages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit packages');
    }

    return response.json();
  }

  async createCreditPackage(token: string, data: Partial<CreditPackage>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/credit-packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create credit package');
    }

    return response.json();
  }

  async updateCreditPackage(token: string, id: number, data: Partial<CreditPackage>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/credit-packages/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update credit package');
    }

    return response.json();
  }

  async deleteCreditPackage(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/credit-packages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete credit package');
    }

    return response.json();
  }

  // Referral settings
  async getReferralSettings(token: string): Promise<{ data: ReferralSettings }> {
    const response = await fetch(`${this.baseUrl}/admin/referral-settings`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch referral settings');
    }

    return response.json();
  }

  async updateReferralSettings(
    token: string,
    data: ReferralSettings
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/referral-settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referral_bonus_tzs: data.referral_bonus_tzs,
        referral_withdraw_min_tzs: data.referral_withdraw_min_tzs,
        rate_tzs_per_credit: data.rate_tzs_per_credit,
        buy_rate_tzs_per_credit: data.buy_rate_tzs_per_credit,
        sell_rate_tzs_per_credit: data.sell_rate_tzs_per_credit,
        usd_to_tzs_rate: data.usd_to_tzs_rate,
        ksh_to_tzs_rate: data.ksh_to_tzs_rate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update referral settings');
    }

    return response.json();
  }

  async deleteCategory(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }

    return response.json();
  }

  // Stats
  async getStats(token: string): Promise<{ data: Stats }> {
    const response = await fetch(`${this.baseUrl}/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  }

  // Withdrawals
  async getWithdrawals(token: string, status = 'pending'): Promise<{ data: any[] }> {
    const response = await fetch(`${this.baseUrl}/admin/withdrawals?status=${status}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch withdrawals');
    }

    return response.json();
  }

  async approveWithdrawal(token: string, id: number, adminNotes?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/withdrawals/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_notes: adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve withdrawal');
    }

    return response.json();
  }

  async rejectWithdrawal(token: string, id: number, adminNotes: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/withdrawals/${id}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_notes: adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject withdrawal');
    }

    return response.json();
  }

  // App Versions
  async getAppVersions(token: string): Promise<any> {
    const url = `${this.baseUrl}/admin/app-versions`;
    console.log('Fetching app versions from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('App versions fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch app versions: ${response.status}`);
    }

    return response.json();
  }

  async createAppVersion(token: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/app-versions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create app version');
    }

    return response.json();
  }

  async updateAppVersion(token: string, id: number, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/app-versions/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update app version');
    }

    return response.json();
  }

  async deleteAppVersion(token: string, id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/app-versions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete app version');
    }

    return response.json();
  }

  // Contact Messages
  async getContactMessages(token: string, page = 1, status = '', search = ''): Promise<any> {
    let url = `${this.baseUrl}/admin/contact-messages?page=${page}&per_page=10`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contact messages');
    }

    return response.json();
  }

  async getContactMessageStats(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/contact-messages/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contact message stats');
    }

    return response.json();
  }

  async getContactMessage(token: string, id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/contact-messages/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contact message');
    }

    return response.json();
  }

  async updateContactMessageStatus(token: string, id: number, status: string, adminNotes?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/contact-messages/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update message status');
    }

    return response.json();
  }

  async deleteContactMessage(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/contact-messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete contact message');
    }

    return response.json();
  }

  // Contact Settings
  async getContactSettings(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/contact-settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contact settings');
    }

    return response.json();
  }

  async updateContactSettings(token: string, data: {
    support_email: string;
    support_phone: string;
    office_hours: string;
    enabled: boolean;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/contact-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update contact settings');
    }

    return response.json();
  }

  // Banners
  async getBanners(token: string): Promise<{ data: Banner[] }> {
    const response = await fetch(`${this.baseUrl}/admin/banners`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch banners');
    }

    return response.json();
  }

  async createBanner(token: string, data: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/banners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Failed to create banner');
      (error as any).errors = errorData.errors;
      throw error;
    }

    return response.json();
  }

  async updateBanner(token: string, id: number, data: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/banners/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Failed to update banner');
      (error as any).errors = errorData.errors;
      throw error;
    }

    return response.json();
  }

  async deleteBanner(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete banner');
    }

    return response.json();
  }
}

const adminApi = new AdminApiService(import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
export { adminApi };
export default adminApi;
