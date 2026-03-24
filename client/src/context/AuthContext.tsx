import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import api from "@/api/client";

type User = { id: string; email: string; name: string; role: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
  authBypass: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const BYPASS_TOKEN = "bypass";
const MOCK_USER: User = {
  id: "dev-bypass",
  email: "dev@local",
  name: "Dev User",
  role: "ADMIN",
};

function authBypassEnabled(): boolean {
  return import.meta.env.VITE_BYPASS_AUTH === "true";
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function initialUser(): User | null {
  if (authBypassEnabled()) return MOCK_USER;
  return loadStoredUser();
}

function initialToken(): string | null {
  if (authBypassEnabled()) return BYPASS_TOKEN;
  return localStorage.getItem("token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => initialUser());
  const [token, setToken] = useState<string | null>(() => initialToken());
  const [ready] = useState(true);

  useEffect(() => {
    if (!authBypassEnabled()) return;
    localStorage.setItem("token", BYPASS_TOKEN);
    localStorage.setItem("user", JSON.stringify(MOCK_USER));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    if (authBypassEnabled()) {
      localStorage.setItem("token", BYPASS_TOKEN);
      localStorage.setItem("user", JSON.stringify(MOCK_USER));
      setToken(BYPASS_TOKEN);
      setUser(MOCK_USER);
      return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      ready,
      authBypass: authBypassEnabled(),
    }),
    [user, token, login, logout, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
