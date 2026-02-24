import { useState, useEffect, useCallback } from 'react';
import type { Device, Location } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';
const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8080/ws';

export function useLocationData(userId: string) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [locations, setLocations] = useState<Record<string, Location>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [devicesRes, locationsRes] = await Promise.all([
                fetch(`${API_BASE}/devices/list?user_id=${userId}`),
                fetch(`${API_BASE}/v1/locations/latest?user_id=${userId}`)
            ]);

            if (!devicesRes.ok || !locationsRes.ok) throw new Error('Failed to fetch data');

            const devicesData = await devicesRes.json();
            const locationsData = await locationsRes.json();

            console.log('Raw Devices Response:', devicesData);
            console.log('Raw Locations Response:', locationsData);

            if (!Array.isArray(devicesData)) {
                console.error('Devices response is not an array:', devicesData);
                setDevices([]);
            } else {
                setDevices(devicesData);
            }

            const locMap: Record<string, Location> = {};
            if (Array.isArray(locationsData)) {
                locationsData.forEach(loc => {
                    if (loc && loc.device_id) {
                        locMap[loc.device_id] = loc;
                    }
                });
            } else {
                console.error('Locations response is not an array:', locationsData);
            }
            setLocations(locMap);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();

        const socket = new WebSocket(WS_BASE);

        socket.onmessage = (event) => {
            try {
                const newLoc: Location = JSON.parse(event.data);
                if (newLoc && newLoc.device_id) {
                    setLocations(prev => ({
                        ...prev,
                        [newLoc.device_id]: newLoc
                    }));
                }
            } catch (err) {
                console.error('WS Error:', err);
            }
        };

        socket.onerror = (err) => console.error('WebSocket error:', err);

        return () => socket.close();
    }, [userId, fetchData]);

    return { devices, locations, loading, error, refetch: fetchData };
}
