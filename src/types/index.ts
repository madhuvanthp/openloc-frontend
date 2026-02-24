export interface Device {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
}

export interface Location {
    id: string;
    device_id: string;
    latitude: float64;
    longitude: float64;
    altitude: float64;
    speed: float64;
    timestamp: string;
}

export type float64 = number;
