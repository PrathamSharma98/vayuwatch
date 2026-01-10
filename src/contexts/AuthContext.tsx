import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  phone: string;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  loginWithOtp: (phone: string, otp: string) => Promise<boolean>;
  signup: (phone: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  sendOtp: (phone: string) => { otp: string; expiresAt: number };
  verifyOtp: (phone: string, otp: string) => boolean;
  resetPassword: (phone: string, newPassword: string) => boolean;
  currentOtp: { otp: string; phone: string; expiresAt: number } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vayuwatch_users';
const SESSION_KEY = 'vayuwatch_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOtp, setCurrentOtp] = useState<{ otp: string; phone: string; expiresAt: number } | null>(null);

  // Load session on mount
  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Get all users from storage
  const getUsers = useCallback((): Record<string, { password: string; user: User }> => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }, []);

  // Save users to storage
  const saveUsers = useCallback((users: Record<string, { password: string; user: User }>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, []);

  // Generate mock OTP (visible in UI for demo)
  // DEMO MODE: Always generates 123456 as demo OTP
  const sendOtp = useCallback((phone: string) => {
    const otp = '123456'; // Fixed OTP for demo - always accept this
    const expiresAt = Date.now() + 60000; // 60 seconds
    setCurrentOtp({ otp, phone, expiresAt });
    return { otp, expiresAt };
  }, []);

  // Verify OTP
  // HACKATHON MODE: Always accepts 123456 as valid OTP
  const verifyOtp = useCallback((phone: string, otp: string): boolean => {
    // Always accept 123456 for demo purposes
    if (otp === '123456') {
      setCurrentOtp(null);
      return true;
    }
    
    if (!currentOtp) return false;
    if (currentOtp.phone !== phone) return false;
    if (currentOtp.otp !== otp) return false;
    if (Date.now() > currentOtp.expiresAt) return false;
    
    // Clear OTP after successful verification (one-time use)
    setCurrentOtp(null);
    return true;
  }, [currentOtp]);

  // Signup with phone and password
  const signup = useCallback(async (phone: string, password: string, name?: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    
    // Check if user already exists
    if (users[phone]) {
      return false;
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      phone,
      name,
      createdAt: new Date().toISOString(),
    };
    
    users[phone] = {
      password: btoa(password), // Simple encoding for demo (not secure for production)
      user: newUser,
    };
    
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    
    return true;
  }, [getUsers, saveUsers]);

  // Login with phone and password
  const login = useCallback(async (phone: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const users = getUsers();
    const userData = users[phone];
    
    if (!userData) return false;
    if (atob(userData.password) !== password) return false;
    
    setUser(userData.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData.user));
    
    return true;
  }, [getUsers]);

  // Login with OTP
  const loginWithOtp = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!verifyOtp(phone, otp)) return false;
    
    const users = getUsers();
    let userData = users[phone];
    
    // If user doesn't exist, create a new one (OTP login can double as signup)
    if (!userData) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        phone,
        createdAt: new Date().toISOString(),
      };
      users[phone] = {
        password: btoa('temp_' + Date.now()), // Temporary password
        user: newUser,
      };
      saveUsers(users);
      userData = users[phone];
    }
    
    setUser(userData.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData.user));
    
    return true;
  }, [verifyOtp, getUsers, saveUsers]);

  // Reset password
  const resetPassword = useCallback((phone: string, newPassword: string): boolean => {
    const users = getUsers();
    
    if (!users[phone]) return false;
    
    users[phone].password = btoa(newPassword);
    saveUsers(users);
    
    return true;
  }, [getUsers, saveUsers]);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setCurrentOtp(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithOtp,
        signup,
        logout,
        sendOtp,
        verifyOtp,
        resetPassword,
        currentOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
