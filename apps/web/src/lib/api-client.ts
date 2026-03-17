import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from './env.mjs';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = env.apiUrl) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Generic request method
  async request<T>(method: string, url: string, data?: any, config?: any) {
    try {
      const response = await this.client({
        method,
        url,
        data,
        ...config,
      });
      return response.data as T;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  get<T = any>(url: string, config?: any) {
    return this.request<T>('GET', url, undefined, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>('POST', url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>('PUT', url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>('PATCH', url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.request<T>('DELETE', url, undefined, config);
  }
}

export const apiClient = new ApiClient();
