import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/axios";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean | null;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      api.get("/me")
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    const res = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    localStorage.setItem("token", res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
