import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    CircularProgress,
    Link,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid credentials');
            }

            login(data.token, data.user_id, email);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
                position: 'relative',
                overflow: 'hidden',
                padding: 3
            }}
        >
            {/* Decorative Blur Circles - Toned Down */}
            <Box sx={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 6,
                        bgcolor: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(20px) saturate(120%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
                        color: 'white'
                    }}
                >
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '-0.025em',
                                mb: 1,
                                color: 'white'
                            }}
                        >
                            OpenLoc
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                            Sign in to OpenLoc
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1rem',
                                bgcolor: '#3b82f6',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#2563eb',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&:disabled': {
                                    bgcolor: 'rgba(59, 130, 246, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                Don't have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/signup"
                                    sx={{
                                        color: '#3b82f6',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Create Account
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
