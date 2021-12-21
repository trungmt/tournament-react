import axios from 'axios';
import constants from './constants';

export const axiosClient = (accessToken: string) => {
  const axiosAdminClient = axios.create({
    baseURL: constants.ADMIN_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  });

  axiosAdminClient.interceptors.response.use(
    res => {
      return res;
    },
    error => {
      // TODO: handle error connect https://axios-http.com/docs/handling_errors
      throw error;
    }
  );
  return axiosAdminClient;
};

export const axiosAuthClient = axios.create({
  baseURL: constants.AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
