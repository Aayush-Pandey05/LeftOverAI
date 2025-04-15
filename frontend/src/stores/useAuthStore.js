import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:9000';

// Helper function to manage token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('jwt', token);
    console.log('Token stored in localStorage');
  } else {
    localStorage.removeItem('jwt');
    console.log('Token removed from localStorage');
  }
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      // Check if we have a token before making the request
      const token = localStorage.getItem('jwt');
      console.log('Checking auth with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.log('No token found during checkAuth, skipping request');
        set({ authUser: null, isCheckingAuth: false });
        return;
      }
      
      const res = await axiosInstance.get('/auth/check');
      console.log('Auth check response:', res.data);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log('Error in checkAuth: ', error);
      // If unauthorized, clear token
      if (error.response && error.response.status === 401) {
        console.log('Auth check returned 401, clearing token');
        setAuthToken(null);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post('/auth/signup', data);
      console.log('Signup response:', res.data);
      
      // Store the token if it exists in the response
      if (res.data.token) {
        setAuthToken(res.data.token);
      } else {
        console.warn('No token received in signup response');
      }
      
      set({ authUser: res.data });
      toast.success('Account created successfully');
      get().connectSocket();
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post('/auth/login', data);
      console.log('Login response:', res.data);
      
      // Store the token if it exists in the response
      if (res.data.token) {
        setAuthToken(res.data.token);
      } else {
        console.warn('No token received in login response');
      }
      
      set({ authUser: res.data });
      toast.success('Logged in successfully');
      get().connectSocket();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setAuthToken(null);
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout api fails, clear token and user state
      setAuthToken(null);
      set({ authUser: null });
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const token = localStorage.getItem('jwt');
    console.log('Connecting socket with token:', token ? 'Token exists' : 'No token');

    const socket = io(BASE_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      // Authenticate the socket with the user ID
      socket.emit('authenticate', authUser._id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, reconnect manually
        socket.connect();
      }
    });

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: socket });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      console.log('Disconnecting socket');
      get().socket.disconnect();
    }
  },
}));