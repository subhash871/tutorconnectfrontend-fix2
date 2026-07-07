import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import { tokenStore, extractErrorMessage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionIssue, setSessionIssue] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await usersApi.me();
      setUser(data?.data ?? data);
      setSessionIssue(null);
    } catch (err) {
      // Only drop the session on a genuinely invalid/expired token (401).
      // A 403 here means the token is valid but the backend rejected the
      // request for another reason (e.g. a permissions misconfiguration) -
      // we shouldn't silently sign the person out for that; surface it instead.
      if (err.response?.status === 401) {
        tokenStore.clear();
        setUser(null);
      } else {
        setSessionIssue(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
    const onLogout = () => setUser(null);
    window.addEventListener('tc:logout', onLogout);
    return () => window.removeEventListener('tc:logout', onLogout);
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const payload = data?.data ?? data;
    tokenStore.setTokens(payload.tokens?.access, payload.tokens?.refresh);
    setUser(payload.user);
    setSessionIssue(null);
    return payload.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    const body = data?.data ?? data;
    if (body?.tokens) {
      tokenStore.setTokens(body.tokens.access, body.tokens.refresh);
      setUser(body.user);
      setSessionIssue(null);
    }
    return body;
  };

  const logout = async () => {
    const refresh = tokenStore.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // ignore network errors on logout
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data } = await usersApi.me();
    const u = data?.data ?? data;
    setUser(u);
    return u;
  };

  // Lets a component apply a user object it already has (e.g. from a PATCH
  // response) without firing an extra GET /users/me/ request.
  const updateUser = (u) => setUser(u);

  const value = {
    user,
    loading,
    sessionIssue,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { extractErrorMessage };
