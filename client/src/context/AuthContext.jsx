import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:4000/v1';
const AUTH_TOKEN_KEY = 'craftly_auth_token';
const AUTH_USER_KEY = 'craftly_auth_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch current user details if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const json = await res.json();
          setUser(json.data);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(json.data));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const saveAuthSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'Login failed');
    }

    saveAuthSession(json.data.accessToken, json.data.user);
    return json.data.user;
  };

  const registerCustomer = async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'Registration failed');
    }

    saveAuthSession(json.data.accessToken, json.data.user);
    return json.data.user;
  };

  const registerStoreOwner = async (data) => {
    const res = await fetch(`${API_BASE}/auth/register-store-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'Store registration failed');
    }

    saveAuthSession(json.data.accessToken, json.data.user);
    return json.data;
  };

  const sendPhoneOtp = async (phone) => {
    const res = await fetch(`${API_BASE}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'Failed to send OTP');
    }

    return json.data;
  };

  const verifyPhoneOtp = async (phone, otp, name) => {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'OTP verification failed');
    }

    saveAuthSession(json.data.accessToken, json.data.user);
    return json.data.user;
  };

  const refreshProfile = async () => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(json.data));
        return json.data;
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
    return null;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const isAuthenticated = Boolean(token && user);
  const isCustomer = user?.role === 'CUSTOMER';
  const isStoreOwner = user?.role === 'STORE_OWNER' || user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isCustomer,
        isStoreOwner,
        isAdmin,
        isSuperAdmin,
        login,
        registerCustomer,
        registerStoreOwner,
        sendPhoneOtp,
        verifyPhoneOtp,
        refreshProfile,
        logout,
        apiBase: API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

