// Utility function to add authentication tokens to image URLs

export const addTokenToImageUrl = (imageUrl, token) => {
  if (!imageUrl) return imageUrl;
  
  // If no token is available, return the URL as-is for public access
  if (!token) return imageUrl;
  
  // If the URL already has query parameters, append the token
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}token=${token}`;
};

export const getImageUrlWithToken = (imageUrl) => {
  const token = localStorage.getItem('token');
  return addTokenToImageUrl(imageUrl, token);
};

// Hook to get authenticated image URLs
import { useAuth } from '../contexts/AuthContext';

export const useAuthenticatedImageUrl = (imageUrl) => {
  const { token } = useAuth();
  return addTokenToImageUrl(imageUrl, token);
};
