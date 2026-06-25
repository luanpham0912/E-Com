import { axiosClient } from './axiosClient';

axiosClient.interceptors.request.use((config) => {
  return config;
});
