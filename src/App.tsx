import { useState, useMemo } from 'react';
import Map from './components/Map/Map';
import { useLocationData } from './hooks/useLocationData';
import { MapPin, Smartphone, RefreshCw, Layers, LogOut, Users as UsersIcon } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import SocialCenter from './components/Social/SocialCenter';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  IconButton
} from '@mui/material';
import { X } from 'lucide-react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
});

function Dashboard() {
  const { user, logout } = useAuth();
  const { devices, locations, loading, error, refetch } = useLocationData(user?.id || '');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  const filteredDevices = useMemo(() => {
    if (selectedDeviceId === 'all') return devices;
    return devices.filter(d => d.id === selectedDeviceId);
  }, [devices, selectedDeviceId]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin className="text-accent" style={{ color: 'var(--accent-primary)' }} />
            OpenLoc
          </h1>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mt: 0.2, fontSize: '0.65rem' }}>
              {user?.email}
            </Typography>
          </Box>
        </header>

        <Box sx={{ px: 2, pt: 2 }}>
          <Button
            fullWidth
            onClick={() => setIsSocialOpen(true)}
            startIcon={<UsersIcon size={18} />}
            sx={{
              justifyContent: 'flex-start',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: 2,
              py: 1,
              px: 2,
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
            }}
          >
            Social Center
          </Button>
        </Box>

        <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="device-select-label" sx={{ color: 'var(--text-muted)' }}>Filter Device</InputLabel>
              <Select
                labelId="device-select-label"
                id="device-select"
                value={selectedDeviceId}
                label="Filter Device"
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                sx={{
                  bgcolor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              >
                <MenuItem value="all">All Devices</MenuItem>
                {devices.map(device => (
                  <MenuItem key={device.id} value={device.id}>{device.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Devices ({filteredDevices.length})</h2>
            <button
              onClick={refetch}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading devices...</p>
            ) : error ? (
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
            ) : (
              filteredDevices.map(device => {
                const hasLocation = !!locations[device.id];
                return (
                  <div
                    key={device.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{
                      padding: '0.5rem',
                      backgroundColor: hasLocation ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <Smartphone size={20} color={hasLocation ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{device.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {hasLocation ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <footer style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OpenLoc</span>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </footer>
      </aside>

      <Dialog
        open={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-secondary)',
            backgroundImage: 'none',
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setIsSocialOpen(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.2)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' }
            }}
          >
            <X size={20} />
          </IconButton>
          {isSocialOpen && <SocialCenter />}
        </Box>
      </Dialog>

      <main style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Map locations={locations} devices={filteredDevices} />

        <div style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          padding: '0.75rem',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          <Layers size={18} />
          {selectedDeviceId === 'all' ? 'Tracking All' : 'Tracking Selected'}
        </div>
      </main>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
