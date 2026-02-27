import { useState, useMemo, useEffect } from 'react';
import Map from './components/Map/Map';
import { useLocationData, API_BASE } from './hooks/useLocationData';
import { MapPin, Smartphone, RefreshCw, Layers, LogOut, Users as UsersIcon, Navigation, Play, Square, Star, Plus } from 'lucide-react';
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
  Button,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
  const { user, updatePrimaryDevice, logout } = useAuth();
  const { devices, locations, loading, error, refetch } = useLocationData(user?.id || '');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [trackingDeviceId, setTrackingDeviceId] = useState<string | null>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isCreatingDevice, setIsCreatingDevice] = useState(false);

  useEffect(() => {
    if (!trackingDeviceId) return;

    let watchId: number;

    const handleSuccess = async (position: GeolocationPosition) => {
      try {
        await fetch(`${API_BASE}/v1/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: trackingDeviceId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || 0,
            speed: position.coords.speed || 0,
          })
        });
      } catch (err) {
        console.error('Failed to auto-push location:', err);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
      alert(`Geolocation error: ${error.message}`);
      setTrackingDeviceId(null);
    };

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      alert('Geolocation is not supported by your browser');
      setTrackingDeviceId(null);
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trackingDeviceId]);

  const pushSingleLocation = (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation();
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`${API_BASE}/v1/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_id: deviceId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || 0,
              speed: position.coords.speed || 0,
            })
          });
          if (!res.ok) alert('Failed to push location');
        } catch (err) {
          console.error('Failed to push location:', err);
          alert('Failed to push location');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(`Geolocation error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSetPrimary = async (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/devices/primary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Fallback if context not ideal
        },
        body: JSON.stringify({ device_id: deviceId })
      });
      if (res.ok) {
        updatePrimaryDevice(deviceId);
      } else {
        alert('Failed to update primary device');
      }
    } catch (err) {
      console.error('Error setting primary device:', err);
      alert('Error setting primary device');
    }
  };

  const handleCreateDevice = async () => {
    if (!newDeviceName.trim()) return;
    setIsCreatingDevice(true);
    try {
      const res = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: user?.id, name: newDeviceName })
      });

      if (res.ok) {
        const device = await res.json();
        // Initialize with default location [0, 0]
        await fetch(`${API_BASE}/v1/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: device.id,
            latitude: 0,
            longitude: 0,
            altitude: 0,
            speed: 0,
          })
        });

        setIsAddDeviceOpen(false);
        setNewDeviceName('');
        refetch();
      } else {
        alert('Failed to create device');
      }
    } catch (err) {
      console.error('Error creating device:', err);
      alert('Error creating device');
    } finally {
      setIsCreatingDevice(false);
    }
  };


  const { myDevices, sharedDevices } = useMemo(() => {
    return {
      myDevices: devices.filter(d => d.user_id === user?.id),
      sharedDevices: devices.filter(d => d.user_id !== user?.id)
    };
  }, [devices, user]);

  const renderDeviceCard = (device: any, isMe: boolean) => {
    const hasLocation = !!locations[device.id];
    const isTracking = trackingDeviceId === device.id;
    const isPrimary = user?.primary_device_id === device.id;
    return (
      <Box
        key={device.id}
        onClick={() => setSelectedDeviceId(device.id)}
        sx={{
          padding: '1rem',
          backgroundColor: selectedDeviceId === device.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: selectedDeviceId === device.id ? 'var(--accent-primary)' : 'var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'var(--accent-secondary)',
            bgcolor: 'rgba(255,255,255,0.05)'
          }
        }}
      >
        <div style={{
          padding: '0.5rem',
          backgroundColor: hasLocation ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
          borderRadius: '8px'
        }}>
          <Smartphone size={20} color={hasLocation ? 'var(--accent-primary)' : 'var(--text-muted)'} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', margin: 0 }}>
              {isMe ? device.name : device.username}
            </h3>
            {isMe && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <IconButton
                  size="small"
                  onClick={(e) => handleSetPrimary(e, device.id)}
                  title={isPrimary ? "Primary Device" : "Set as Primary"}
                  sx={{ color: isPrimary ? '#fbbf24' : 'var(--text-secondary)', padding: '4px', '&:hover': { color: '#fbbf24', bgcolor: 'rgba(251, 191, 36, 0.1)' } }}
                >
                  <Star size={14} fill={isPrimary ? '#fbbf24' : 'none'} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => pushSingleLocation(e, device.id)}
                  title="Push Location Now"
                  sx={{ color: 'var(--text-secondary)', padding: '4px', '&:hover': { color: 'var(--accent-primary)', bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
                >
                  <Navigation size={14} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrackingDeviceId(isTracking ? null : device.id);
                  }}
                  title={isTracking ? "Stop Tracking" : "Start Auto-Tracking"}
                  sx={{ color: isTracking ? '#10b981' : 'var(--text-secondary)', padding: '4px', '&:hover': { color: isTracking ? '#ef4444' : '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                >
                  {isTracking ? <Square size={14} /> : <Play size={14} />}
                </IconButton>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: isTracking ? '#10b981' : 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {isTracking ? 'Tracking Live...' : (hasLocation ? 'Online' : 'Offline')}
          </p>
        </div>
      </Box>
    );
  };

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
          {/* Header with Refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Find My</h2>
            <IconButton onClick={refetch} size="small" sx={{ color: 'var(--text-muted)' }}>
              <RefreshCw size={18} />
            </IconButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading devices...</p>
            ) : error ? (
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
            ) : (
              <>
                {/* ME Section */}
                {myDevices.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="overline" sx={{ color: 'var(--text-muted)', fontWeight: 800, m: 0, display: 'block', letterSpacing: '0.1em' }}>
                        ME
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setIsAddDeviceOpen(true)}
                        sx={{ color: 'var(--accent-primary)', p: 0 }}
                      >
                        <Plus size={16} />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {myDevices.map(device => renderDeviceCard(device, true))}
                    </Box>
                  </Box>
                )}

                {/* PEOPLE Section */}
                {sharedDevices.length > 0 && (
                  <Box>
                    <Typography variant="overline" sx={{ color: 'var(--text-muted)', fontWeight: 800, mb: 1.5, display: 'block', letterSpacing: '0.1em' }}>
                      PEOPLE
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {sharedDevices.map(device => renderDeviceCard(device, false))}
                    </Box>
                  </Box>
                )}
              </>
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
        <Map locations={locations} devices={devices} selectedDeviceId={selectedDeviceId} currentUserId={user?.id} />

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

      {/* Add Device Dialog */}
      <Dialog
        open={isAddDeviceOpen}
        onClose={() => !isCreatingDevice && setIsAddDeviceOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-secondary)',
            backgroundImage: 'none',
            borderRadius: 3,
            border: '1px solid var(--border-color)',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Add New Device</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Device Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            disabled={isCreatingDevice}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
              },
              '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-primary)' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsAddDeviceOpen(false)} sx={{ color: 'var(--text-secondary)' }} disabled={isCreatingDevice}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateDevice}
            variant="contained"
            disabled={isCreatingDevice || !newDeviceName.trim()}
            sx={{ fontWeight: 600 }}
          >
            {isCreatingDevice ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
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
