import {API_URL} from '@env'

export default function normalizeImageUrl(url) {
  if (!url) return null;

  // kalau sudah URL valid (cloudinary, s3, dll)
  if (url.startsWith('http') && !url.includes('localhost')) {
    return url;
  }

  // ganti localhost + port jadi BASE_URL
  return url.replace(
    /^http:\/\/localhost:\d+/,
    API_URL
  );
}
