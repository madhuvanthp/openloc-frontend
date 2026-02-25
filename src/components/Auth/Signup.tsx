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
    Link
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Signup request
            const signupRes = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const signupData = await signupRes.json();

            if (!signupRes.ok) {
                throw new Error(signupData.message || 'Failed to register');
            }

            // Automatically login after signup
            const loginRes = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                throw new Error(loginData.message || 'Signup successful, but login failed');
            }

            login(loginData.token, loginData.user_id, email);
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
                padding: 3
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 4,
                        bgcolor: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
                        color: 'white'
                    }}
                >
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em', mb: 1 }}>
                            OpenLoc
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Create your account to start tracking
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>{error}</Alert>}

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
                                    borderRadius: 2,
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.8,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1rem',
                                bgcolor: '#3b82f6',
                                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.5)',
                                '&:hover': {
                                    bgcolor: '#2563eb',
                                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
                                },
                                '&:disabled': {
                                    bgcolor: 'rgba(59, 130, 246, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                        </Button>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" sx={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Signup;
