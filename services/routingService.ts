import { Location } from '../types';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

export interface RouteResult {
    coordinates: Location[];
    distance: number; // in meters
    duration: number; // in seconds
}

export const getRoute = async (start: Location, end: Location): Promise<RouteResult | null> => {
    try {
        // OSRM expects "lng,lat"
        const url = `${OSRM_BASE_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            console.error('OSRM Error:', data);
            return null;
        }

        const route = data.routes[0];
        const coordinates: Location[] = route.geometry.coordinates.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0]
        }));

        return {
            coordinates,
            distance: route.distance,
            duration: route.duration
        };

    } catch (error) {
        console.error('Failed to fetch route:', error);
        return null;
    }
};
