import { axiosClient } from './axiosClient';

const TOKEN_KEY = 'auth_token';

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='))
    ?.split('=')[1];

  if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() ?? '')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});
