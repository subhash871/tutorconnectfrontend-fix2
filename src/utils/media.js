import { API_BASE_URL } from '../api/client';

export function resolveMedia(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
