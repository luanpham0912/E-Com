import { axiosClient } from './axiosClient';
import { ApiError } from './apiError';

interface AxiosErrorData {
  error?: {
    message?: string;
    details?: unknown;
  };
}

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = (response.data as { data: unknown }).data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status ?? 0;
    const message =
      (error.response?.data as AxiosErrorData)?.error?.message ??
      error.message ??
      'An unexpected error occurred';

    return Promise.reject(new ApiError(status, message, (error.response?.data as AxiosErrorData)?.error?.details));
  }
);
