/**
 * Resolves static asset paths or remote Cloudinary URLs.
 * If the URL is relative (e.g. starting with `/uploads`), it prefixes it with the backend base URL.
 */
export const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it is a local upload path
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Strip any trailing slashes/api from backend base
  const cleanBase = baseURL.replace(/\/api$/, '').replace(/\/$/, '');
  
  const separator = url.startsWith('/') ? '' : '/';
  return `${cleanBase}${separator}${url}`;
};
