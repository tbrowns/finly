import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthApi, getToken, setToken, type User } from "./api";

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!getToken());

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const me = await AuthApi.me();
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const signIn = (token: string, u: User) => {
    setToken(token);
    setUser(u);
  };
  const signOut = () => {
    setToken(null);
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, signIn, signOut, refresh }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
