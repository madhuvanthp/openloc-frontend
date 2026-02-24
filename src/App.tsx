import { useState } from 'react';
import Map from './components/Map/Map';
import { useLocationData } from './hooks/useLocationData';
import { MapPin, Smartphone, RefreshCw, Layers } from 'lucide-react';

function App() {
  const [userId, setUserId] = useState('00000000-0000-0000-0000-000000000000'); // Default demo UUID
  const { devices, locations, loading, error, refetch } = useLocationData(userId);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin className="text-accent" style={{ color: 'var(--accent-primary)' }} />
            OpenLoc
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Real-time device tracking
          </p>
        </header>

        <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User UUID"
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Devices ({devices.length})</h2>
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
              devices.map(device => {
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

        <footer style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          OpenStreetMap Dark Mode
        </footer>
      </aside>

      <main style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Map locations={locations} devices={devices} />

        {/* Floating Glass Control */}
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
          Dark Matter
        </div>
      </main>
    </div>
  );
}

export default App;
