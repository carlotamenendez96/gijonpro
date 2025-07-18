
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
    id: 'user-1',
    name: 'Dueño del Negocio',
    email: 'admin@gijonpro.com',
    role: UserRole.ADMIN,
    businessName: 'Peluquería Estilo Gijón',
    plan: 'Pro'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    if (email === 'admin@gijonpro.com' && pass === 'password') {
      setUser(mockUser);
      setLoading(false);
    } else {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
      setLoading(false);
      throw new Error('Credenciales incorrectas');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
