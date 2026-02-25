import { useState, useMemo } from 'react';
import Map from './components/Map/Map';
import { useLocationData } from './hooks/useLocationData';
import { MapPin, Smartphone, RefreshCw, Layers, LogOut } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

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
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mt: 0.5 }}>
            Logged in as: {user?.email}
          </Typography>
        </header>

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

        <footer style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OpenLoc</span>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </footer>
      </aside>

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
