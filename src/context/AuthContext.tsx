import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    username: string;
    primary_device_id?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userId: string, email: string, username: string, primaryDeviceId?: string | null) => void;
    updatePrimaryDevice: (deviceId: string) => void;
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
        const savedUsername = localStorage.getItem('username');
        const savedPrimaryDeviceId = localStorage.getItem('primary_device_id');

        if (savedToken && savedUserId && savedEmail && savedUsername) {
            setToken(savedToken);
            setUser({
                id: savedUserId,
                email: savedEmail,
                username: savedUsername,
                primary_device_id: savedPrimaryDeviceId
            });
        }
    }, []);

    const login = (token: string, userId: string, email: string, username: string, primaryDeviceId?: string | null) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', userId);
        localStorage.setItem('email', email);
        localStorage.setItem('username', username);
        if (primaryDeviceId) {
            localStorage.setItem('primary_device_id', primaryDeviceId);
        } else {
            localStorage.removeItem('primary_device_id');
        }
        setToken(token);
        setUser({ id: userId, email: email, username: username, primary_device_id: primaryDeviceId });
    };

    const updatePrimaryDevice = (deviceId: string) => {
        localStorage.setItem('primary_device_id', deviceId);
        setUser(prev => prev ? { ...prev, primary_device_id: deviceId } : null);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('email');
        localStorage.removeItem('username');
        localStorage.removeItem('primary_device_id');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, updatePrimaryDevice, logout, isAuthenticated: !!token }}>
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
