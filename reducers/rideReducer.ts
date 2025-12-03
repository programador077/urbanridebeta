import { RideRequest, RideStatus, VehicleType, Location } from '../types';

export type RideAction =
    | { type: 'REQUEST_RIDE'; payload: { origin: Location; destination: Location; price: number; distance: number; vehicleType: VehicleType; clientId: string; clientName: string } }
    | { type: 'DRIVER_ACCEPT'; payload: { driverId: string } }
    | { type: 'DRIVER_ARRIVED' }
    | { type: 'START_TRIP' }
    | { type: 'COMPLETE_TRIP' }
    | { type: 'CANCEL_RIDE' }
    | { type: 'RESET' };

export const rideReducer = (state: RideRequest | null, action: RideAction): RideRequest | null => {
    switch (action.type) {
        case 'REQUEST_RIDE':
            if (state) {
                console.warn('Ride already active, cannot request new one.');
                return state;
            }
            return {
                id: `ride-${Date.now()}`,
                status: 'searching',
                clientId: action.payload.clientId,
                clientName: action.payload.clientName,
                origin: action.payload.origin,
                destination: action.payload.destination,
                estimatedPrice: action.payload.price,
                distanceKm: action.payload.distance,
                estimatedTimeMin: Math.round(action.payload.distance * 3),
                vehicleType: action.payload.vehicleType,
            };

        case 'DRIVER_ACCEPT':
            if (state?.status !== 'searching') {
                console.warn(`Invalid transition: Cannot accept ride in status ${state?.status}`);
                return state;
            }
            return {
                ...state,
                status: 'accepted',
                driverId: action.payload.driverId,
            };

        case 'DRIVER_ARRIVED':
            if (state?.status !== 'accepted') {
                console.warn(`Invalid transition: Cannot arrive in status ${state?.status}`);
                return state;
            }
            return { ...state, status: 'driver_arrived' };

        case 'START_TRIP':
            if (state?.status !== 'driver_arrived') {
                console.warn(`Invalid transition: Cannot start trip in status ${state?.status}`);
                return state;
            }
            return { ...state, status: 'in_progress' };

        case 'COMPLETE_TRIP':
            if (state?.status !== 'in_progress') {
                console.warn(`Invalid transition: Cannot complete trip in status ${state?.status}`);
                return state;
            }
            return { ...state, status: 'completed' };

        case 'CANCEL_RIDE':
            if (state?.status === 'completed') {
                console.warn('Cannot cancel a completed ride.');
                return state;
            }
            return null; // Or keep it with status 'cancelled' if we want history

        case 'RESET':
            return null;

        default:
            return state;
    }
};
