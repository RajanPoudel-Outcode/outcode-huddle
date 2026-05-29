/**
 * App Configuration
 * Centralized configuration for API and app settings
 */

const API_BASE_URL = "http://127.0.0.1:3000/api";

export const Config = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 10000,
    retries: 3,
  },
};

export default Config;
