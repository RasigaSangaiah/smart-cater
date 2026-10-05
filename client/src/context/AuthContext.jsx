import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("smartcater_token");
      const cachedUser = localStorage.getItem("smartcater_user");
      if (token && cachedUser) {
        setUser(JSON.parse(cachedUser));
        try {
          const { data } = await authService.getMe();
          setUser(data.user);
        } catch {
          localStorage.removeItem("smartcater_token");
          localStorage.removeItem("smartcater_user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem("smartcater_token", data.token);
    localStorage.setItem("smartcater_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem("smartcater_token", data.token);
    localStorage.setItem("smartcater_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("smartcater_token");
    localStorage.removeItem("smartcater_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
