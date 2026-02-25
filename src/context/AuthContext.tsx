import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userId: string, email: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('user_id');
        const savedEmail = localStorage.getItem('email');

        if (savedToken && savedUserId && savedEmail) {
            setToken(savedToken);
            setUser({ id: savedUserId, email: savedEmail });
        }
    }, []);

    const login = (token: string, userId: string, email: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', userId);
        localStorage.setItem('email', email);
        setToken(token);
        setUser({ id: userId, email: email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('email');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
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
