import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (formData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('firstname', formData.firstname);
    formDataToSend.append('middlename', formData.middlename || '');
    formDataToSend.append('lastname', formData.lastname);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('password_confirmation', formData.password_confirmation);
    formDataToSend.append('contact_number', formData.contact_number);
    formDataToSend.append('valid_id', formData.valid_id);

    try {
      const response = await api.post('/auth/register', formDataToSend);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        'Registration failed';
      throw new Error(message);
    }
  };

  // updateProfile now simply appends the method spoofing field
  // to the incoming FormData and sends it directly.
  const updateProfile = async (formData) => {
    formData.append('_method', 'PUT');

    try {
      const response = await api.post('/auth/profile', formData);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Derived properties
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isApproved = user?.account_status === 'approved';
  const isPending = user?.account_status === 'pending';
  const isRejected = user?.account_status === 'rejected';
  const hasPendingChanges = user?.has_pending_changes;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isClient,
        isApproved,
        isPending,
        isRejected,
        hasPendingChanges,
        setUser,
        fetchUser,
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