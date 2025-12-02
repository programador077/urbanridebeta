export type UserRole = 'client' | 'driver' | 'simulation' | null;

export type RideStatus = 
  | 'idle' 
  | 'searching' 
  | 'accepted' 
  | 'driver_arrived' 
  | 'in_progress' 
  | 'completed';

export type VehicleType = 'moto' | 'auto' | 'flash';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  rating: number;
  vehicle?: string; // Only for drivers
  plate?: string;   // Only for drivers
}

export interface RideRequest {
  id: string;
  clientId: string;
  clientName: string;
  origin: Location;
  destination: Location;
  status: RideStatus;
  estimatedPrice: number;
  distanceKm: number;
  estimatedTimeMin: number;
  driverId?: string;
  vehicleType: VehicleType;
}

export interface CompletedRide extends RideRequest {
  completedAt: string; // ISO Date String
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface GeminiSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'driver';
  text: string;
  timestamp: number;
}