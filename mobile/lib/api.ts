import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3001/api'; // Changez cette URL pour votre serveur de production

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users
export const userApi = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadAvatar: async (uri: string, fileName: string, mimeType: string) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
    
    const token = await AsyncStorage.getItem('token');
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
};

// Posts
export const postApi = {
  createPost: (data: { content: string; type?: string }) =>
    api.post('/posts', data),
  getPosts: (params?: { type?: string; userId?: string; page?: number; limit?: number }) =>
    api.get('/posts', { params }),
  getPostById: (postId: string) => api.get(`/posts/${postId}`),
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  likePost: (postId: string) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId: string) => api.delete(`/posts/${postId}/like`),
};

// Book Reviews
export const bookReviewApi = {
  createReview: (data: any) => api.post('/book-reviews', data),
  getReviews: (params?: { userId?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/book-reviews', { params }),
  getReviewById: (reviewId: string) => api.get(`/book-reviews/${reviewId}`),
  updateReview: (reviewId: string, data: any) => api.put(`/book-reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => api.delete(`/book-reviews/${reviewId}`),
  uploadBookCover: (reviewId: string, formData: FormData) => api.post(`/book-reviews/${reviewId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  likeReview: (reviewId: string) => api.post(`/book-reviews/${reviewId}/like`),
  unlikeReview: (reviewId: string) => api.delete(`/book-reviews/${reviewId}/like`),
};

// Friendships
export const friendshipApi = {
  sendRequest: (userId: string) => api.post(`/friendships/request/${userId}`),
  respondToRequest: (friendshipId: string, action: 'accept' | 'reject') =>
    api.put(`/friendships/request/${friendshipId}`, { action }),
  getFriends: (userId?: string) => api.get('/friendships/friends', { params: { userId } }),
  getFriendRequests: () => api.get('/friendships/requests'),
  removeFriend: (friendshipId: string) => api.delete(`/friendships/${friendshipId}`),
};

// Comments
export const commentApi = {
  createComment: (data: { content: string; postId?: string; bookReviewId?: string }) =>
    api.post('/comments', data),
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
};

// Books (Google Books API)
export const booksApi = {
  searchBooks: (query: string) => api.get('/books/search', { params: { query } }),
  getBookByIsbn: (isbn: string) => api.get(`/books/isbn/${isbn}`),
};

export default api;

