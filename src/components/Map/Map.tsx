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

export default function Map({ locations, devices }: MapProps) {
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

                {Object.entries(locations).map(([deviceId, loc]) => {
                    if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
                        return null;
                    }
                    const device = devices.find(d => d.id === deviceId);
                    return (
                        <Marker key={deviceId} position={[loc.latitude, loc.longitude]}>
                            <Popup>
                                <div style={{ color: '#333' }}>
                                    <strong>{device?.name || 'Unknown Device'}</strong><br />
                                    Speed: {(loc.speed || 0).toFixed(2)} km/h<br />
                                    Altitude: {(loc.altitude || 0).toFixed(1)}m<br />
                                    <small>{new Date(loc.timestamp).toLocaleString()}</small>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <AutoCenter locations={locations} />
            </MapContainer>
        </div>
    );
}
