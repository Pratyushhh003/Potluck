import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const login = (userData, tokenData, refreshTokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    if (refreshTokenData) {
      localStorage.setItem("refreshToken", refreshTokenData);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axios.post("http://localhost:4000/api/auth/logout", {
          refreshToken,
        });
      }
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;
    try {
      const res = await axios.post("http://localhost:4000/api/auth/refresh", {
        refreshToken,
      });
      const { token: newToken, refreshToken: newRefreshToken } = res.data;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return true;
    } catch {
      logout();
      return false;
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (stored && storedToken) {
      setUser(JSON.parse(stored));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(
      async () => {
        await refreshAccessToken();
      },
      6 * 24 * 60 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [token, refreshAccessToken]);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
