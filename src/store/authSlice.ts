import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:5000/api/auth';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  joinedDate: string;
  role?: 'user' | 'admin';
  favorites?: any[];
  recentlyPlayed?: any[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('melodify_user') || 'null'),
  token: localStorage.getItem('melodify_token') || null,
  loading: false,
  error: null,
  rememberMe: localStorage.getItem('melodify_remember') === 'true',
};

// Async Actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; rememberMe: boolean }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        if (credentials.rememberMe) {
          localStorage.setItem('melodify_token', token);
          localStorage.setItem('melodify_user', JSON.stringify(user));
          localStorage.setItem('melodify_remember', 'true');
        } else {
          sessionStorage.setItem('melodify_token', token);
          sessionStorage.setItem('melodify_user', JSON.stringify(user));
          localStorage.removeItem('melodify_token');
          localStorage.removeItem('melodify_user');
          localStorage.setItem('melodify_remember', 'false');
        }

        return { token, user, rememberMe: credentials.rememberMe };
      }
      return thunkAPI.rejectWithValue(response.data.message || 'Login failed');
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Login connection failed'
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (details: { username: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, details);

      if (response.data.success) {
        const { token, user } = response.data;
        // By default session store, user can select keep signed in
        sessionStorage.setItem('melodify_token', token);
        sessionStorage.setItem('melodify_user', JSON.stringify(user));
        return { token, user };
      }
      return thunkAPI.rejectWithValue(response.data.message || 'Signup failed');
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Signup connection failed'
      );
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/google',
  async (googleDetails: { googleId: string; email: string; username: string; avatarUrl?: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/google`, googleDetails);

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('melodify_token', token);
        localStorage.setItem('melodify_user', JSON.stringify(user));
        localStorage.setItem('melodify_remember', 'true');
        return { token, user };
      }
      return thunkAPI.rejectWithValue(response.data.message || 'Google Auth failed');
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Google Auth connection failed'
      );
    }
  }
);

export const loadProfile = createAsyncThunk(
  'auth/loadProfile',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        return response.data.user;
      }
      return null;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('melodify_token');
      localStorage.removeItem('melodify_user');
      sessionStorage.removeItem('melodify_token');
      sessionStorage.removeItem('melodify_user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.rememberMe = action.payload.rememberMe;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.rememberMe = true;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load Profile
      .addCase(loadProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
