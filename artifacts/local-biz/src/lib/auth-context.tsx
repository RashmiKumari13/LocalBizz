import React, { createContext, useContext, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  businessName?: string | null;
  locality?: string | null;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refetch: () => void;
  onLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem("token"));

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
      enabled: hasToken,
      queryKey: getGetMeQueryKey(),
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    qc.clear();
    window.location.href = "/";
  };

  const onLogin = () => {
    setHasToken(true);
  };

  return (
    <AuthContext.Provider value={{ user: (user as User) ?? null, isLoading: hasToken ? isLoading : false, logout, refetch, onLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
