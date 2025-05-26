import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: (SelectUser & { type?: string }) | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser & { type?: string }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = {
  usernameOrEmail: string;
  password: string;
};

type RegisterData = Pick<InsertUser, "username" | "email" | "password" | "firstName" | "lastName">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery({    
    queryKey: ["/auth/me"] as const,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      console.log('🔐 Auth Check - Token exists:', !!token);
      if (!token) {
        console.log('❌ No token found in localStorage');
        return null;
      }
      try {
        console.log('🔍 Fetching current user with token');
        const res = await apiRequest<{ success: boolean; user: SelectUser }>("/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('✅ Auth response:', { success: res.success, user: res.user ? 'Found' : 'None' });
        
        if (!res.success) {
          console.log('❌ Token validation failed');
          localStorage.removeItem("token");
          return null;
        }
        
        console.log('👤 Authenticated as:', res.user.username || res.user.email);
        return res.user;
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
        localStorage.removeItem("token");
        return null;
      }
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!localStorage.getItem("token")
  });

  // Effect to handle token changes and ensure authentication persistence
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log('🔑 Auth initialization - Token exists:', !!token);
    
    if (!token) {
      console.log('📤 No token in storage, clearing auth state');
      queryClient.setQueryData(["/auth/me"], null);
    } else {
      console.log('🔄 Token found, refreshing user data');
      // Force immediate refetch of user data with the token
      refetchUser();
    }
    
    // Set up storage event listener to handle token changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('💾 Token changed in storage:', e.newValue ? 'New token set' : 'Token removed');
        if (!e.newValue) {
          queryClient.setQueryData(["/auth/me"], null);
        } else {
          refetchUser();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetchUser]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest<{ success: boolean; token: string; user: SelectUser; message?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (!res.success) {
        throw new Error(res.message || 'Login failed');
      }
      return res;
    },
    onSuccess: async (data) => {
      if (data.success && data.token) {
        console.log('🔑 Login successful, setting up authentication');
        
        // First, save the token to localStorage
        localStorage.setItem("token", data.token);
        console.log('💾 Token saved to localStorage');
        
        // Update query cache with the user data
        queryClient.setQueryData(["/auth/me"], data.user);
        console.log('📡 User data saved to query cache');

        // Verify token is working by refetching user data
        try {
          console.log('🔄 Verifying token by refetching user data');
          await refetchUser();
          console.log('✅ Token verified successfully');
          
          // All good, redirect to dashboard
          console.log('🛑 Redirecting to dashboard');
          setLocation("/dashboard");
        } catch (error) {
          console.error('❌ Failed to verify token:', error);
          // Clear token and user data if verification fails
          localStorage.removeItem("token");
          queryClient.setQueryData(["/auth/me"], null);
          throw new Error('Failed to verify login. Please try again.');
        }
      } else {
        console.error('❌ Login response missing token or success flag');
        throw new Error('Invalid login response from server');
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      queryClient.setQueryData(["/auth/me"], null);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      console.log('📤 Sending registration data:', { ...credentials, password: '***' });
      const res = await apiRequest<{ user: SelectUser; token: string; success: boolean }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      console.log('✅ Registration response:', { user: res.user, token: res.token ? 'Present' : 'Missing' });
      if (!res.success) {
        throw new Error('Registration failed');
      }
      localStorage.setItem('token', res.token);
      return res.user;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/auth/me"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to AI Health Assistant, ${user.name || user.username}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      console.error('❌ Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      await apiRequest("/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.setQueryData(["/auth/me"], null);
      toast({
        title: "Logged out successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export individual hooks for convenience
export const useLogin = () => useAuth().loginMutation;
export const useLogout = () => useAuth().logoutMutation;
export const useRegister = () => useAuth().registerMutation;
