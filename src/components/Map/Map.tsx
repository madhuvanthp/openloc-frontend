import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Device, Location } from '../../types';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet using CDN for reliability
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    locations: Record<string, Location>;
    devices: Device[];
    selectedDeviceId?: string;
}

function AutoCenter({ locations }: { locations: Record<string, Location> }) {
    const map = useMap();

    useEffect(() => {
        const locs = Object.values(locations).filter(l =>
            l && typeof l.latitude === 'number' && typeof l.longitude === 'number'
        );
        if (locs.length > 0) {
            try {
                const bounds = L.latLngBounds(locs.map(l => [l.latitude, l.longitude]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                }
            } catch (err) {
                console.error('Error fitting bounds:', err);
            }
        }
    }, [locations, map]);

    return null;
}

export default function Map({ locations, devices, selectedDeviceId = 'all' }: MapProps) {
    // Filter locations to only show the selected device(s) - USED ONLY FOR CENTERING
    const filteredLocations = Object.entries(locations).filter(([deviceId, loc]) => {
        if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return false;
        if (selectedDeviceId !== 'all' && deviceId !== selectedDeviceId) return false;
        return true;
    });

    const locationsToCenter = Object.fromEntries(filteredLocations);

    // All valid locations for rendering pins
    const allValidLocations = Object.entries(locations).filter(([_, loc]) => {
        return loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number';
    });

    return (
        <div className="map-container">
            <MapContainer
                center={[0, 0]}
                zoom={2}
                scrollWheelZoom={true}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {allValidLocations.map(([deviceId, loc]) => {
                    const device = devices.find(d => d.id === deviceId);
                    // Determine display name: use specific name for own devices, username for friends, or fallback
                    let displayName = 'Unknown Device';
                    if (device) {
                        // Check if the device belongs to the current user (if username matches name, it's likely a friend's device we only know by username)
                        // A simple heuristic is that if it has a specific name we use it, otherwise fallback to username
                        displayName = device.name || device.username || 'Unknown Device';
                    }

                    const isSelected = selectedDeviceId === 'all' || selectedDeviceId === deviceId;
                    const opacity = isSelected ? 1.0 : 0.4;

                    return (
                        <Marker
                            key={deviceId}
                            position={[loc.latitude, loc.longitude]}
                            opacity={opacity}
                        >
                            <Popup>
                                <div style={{ color: '#333' }}>
                                    <strong>{displayName}</strong><br />
                                    Speed: {(loc.speed || 0).toFixed(2)} km/h<br />
                                    Altitude: {(loc.altitude || 0).toFixed(1)}m<br />
                                    <small>{new Date(loc.timestamp).toLocaleString()}</small>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <AutoCenter locations={locationsToCenter} />
            </MapContainer>
        </div>
    );
}
