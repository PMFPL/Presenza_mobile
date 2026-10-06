import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [puchInData, setPuchInData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load tokens on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedAccess = await AsyncStorage.getItem('accessToken');
      const storedRefresh = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');
      const storedPucnchInData = await AsyncStorage.getItem('punchInData');

      if (storedAccess && storedRefresh) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        setUser(JSON.parse(storedUser));
      }
      if (storedPucnchInData) {
        setPuchInData(JSON.parse(storedPucnchInData));
      }
    } catch (err) {
      console.log('Auth load error', err);
    } finally {
      setLoading(false);
    }
  };
  const updatePunchInData = async data => {
    setPuchInData(data);
    await AsyncStorage.setItem('punchInData', JSON.stringify(data));
  };

  const login = async (access, refresh, userData) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);

    await AsyncStorage.multiSet([
      ['accessToken', access],
      ['refreshToken', refresh],
      ['user', JSON.stringify(userData)],
    ]);
  };

  const logout = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setPuchInData(null);
    await AsyncStorage.clear();
  };

  const isTokenExpired = token => {
    if (!token) return true;

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  };

  const isTokenValid = () => {
    return accessToken && !isTokenExpired(accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        login,
        puchInData,
        updatePunchInData,
        logout,
        isTokenExpired,
        isTokenValid,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
