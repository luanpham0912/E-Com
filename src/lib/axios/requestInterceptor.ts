import { axiosClient } from './axiosClient';

axiosClient.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('access_token='))
    ?.split('=')[1];

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
