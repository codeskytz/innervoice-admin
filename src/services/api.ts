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
  created_at?: string;
  updated_at?: string;
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
}

const adminApi = new AdminApiService(import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
export default adminApi;
