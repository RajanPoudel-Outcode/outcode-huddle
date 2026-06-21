/**
 * App Configuration
 * Centralized configuration for API and app settings
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.3:3000/api/";

// Server origin (without the /api path) — used to build absolute URLs for
// statically served assets like uploaded profile images.
const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const Config = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 10000,
    retries: 3,
  },
  serverURL: SERVER_URL,
};

/**
 * Build an absolute URL for a server-relative asset path (e.g. "uploads/x.png").
 * Returns undefined for empty/missing paths and passes through absolute URLs.
 */
export const buildAssetUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\.?\//, "");
  return `${SERVER_URL}/${clean}`;
};

export default Config;
