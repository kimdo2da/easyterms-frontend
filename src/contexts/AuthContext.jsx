import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'easyterms_access_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api.me(token)
      .then((profile) => { if (active) setUser(profile); })
      .catch(() => { if (active) logout(); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, logout]);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    const newToken = result?.accessToken || result?.token || result?.data?.accessToken;
    if (!newToken) throw new Error('로그인은 성공했지만 JWT가 응답에 없습니다. 로그인 응답 필드를 확인해 주세요.');
    const profile = await api.me(newToken);
    if (!(profile?.id ?? profile?.userId)) {
      throw new Error('/api/auth/me에서 사용자 ID를 찾지 못했어요.');
    }
    localStorage.setItem(TOKEN_KEY, newToken);
    setUser(profile);
    setToken(newToken);
    return profile;
  };

  const value = useMemo(() => ({
    token, user, userId: user?.id ?? user?.userId ?? null,
    loading, login, logout,
  }), [token, user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider 안에서만 사용해 주세요.');
  return context;
}
