import axios from 'axios';
import constants from './constants';

export const axiosClient = (accessToken: string) =>
  axios.create({
    baseURL: constants.ADMIN_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  });

export const axiosAuthClient = axios.create({
  baseURL: constants.AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
