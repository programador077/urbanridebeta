import { useEffect, useState, useRef } from 'react';
import { useRide } from '../contexts/RideContext';
import { getRoute } from '../services/routingService';
import { Location } from '../types';

export const useRideSimulation = () => {
    const {
        activeRide,
        driverLocation,
        setDriverLocation,
        setDriverHeading,
        setActiveRide
    } = useRide();

    const [routePath, setRoutePath] = useState<Location[]>([]);
    const [routeProgress, setRouteProgress] = useState(0);

    // Ref to access latest state inside animation frame
    const activeRideRef = useRef(activeRide);
    useEffect(() => { activeRideRef.current = activeRide; }, [activeRide]);

    // 1. Fetch Route when status changes
    useEffect(() => {
        if (!activeRide) {
            setRoutePath([]);
            setRouteProgress(0);
            return;
        }

        const fetchRoute = async () => {
            let start = driverLocation;
            let end: Location;

            if (activeRide.status === 'accepted') {
                end = activeRide.origin;

                // If driver doesn't exist yet, spawn them nearby
                if (!start) {
                    const offsetLat = (Math.random() - 0.5) * 0.02; // ~2km radius
                    const offsetLng = (Math.random() - 0.5) * 0.02;
                    start = {
                        lat: activeRide.origin.lat + offsetLat,
                        lng: activeRide.origin.lng + offsetLng
                    };
                    setDriverLocation(start);
                }
            } else if (activeRide.status === 'in_progress') {
                start = driverLocation || activeRide.origin; // Fallback if lost
                end = activeRide.destination;
            } else {
                return;
            }

            if (!start || !end) return;

            const route = await getRoute(start, end);
            if (route) {
                setRoutePath(route.coordinates);
                setRouteProgress(0);
            } else {
                // Fallback straight line
                setRoutePath([start, end]);
            }
        };

        fetchRoute();
    }, [activeRide?.status]); // Only re-calc on status shift

    // 2. Animation Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();

        const animate = (time: number) => {
            const deltaTime = time - lastTime;

            if (
                activeRideRef.current &&
                ['accepted', 'in_progress'].includes(activeRideRef.current.status) &&
                routePath.length > 0
            ) {
                // Move every 40ms for smoother 25fps feel
                if (deltaTime > 40) {
                    setRouteProgress(prev => {
                        const nextIndex = prev + 1;
                        if (nextIndex >= routePath.length) return prev;

                        const currentPos = routePath[prev];
                        const nextPos = routePath[nextIndex];

                        // Calculate Heading
                        const dy = nextPos.lat - currentPos.lat;
                        const dx = nextPos.lng - currentPos.lng;
                        if (Math.abs(dx) > 0.000001 || Math.abs(dy) > 0.000001) {
                            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                            let bearing = 90 - angle;
                            if (bearing < 0) bearing += 360;
                            setDriverHeading(bearing);
                        }

                        setDriverLocation(nextPos);
                        return nextIndex;
                    });
                    lastTime = time;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [routePath]);

    // 3. Arrival Check
    useEffect(() => {
        if (!activeRide || routePath.length === 0) return;

        const isAtEnd = routeProgress >= routePath.length - 1;

        if (isAtEnd) {
            if (activeRide.status === 'accepted') {
                // Auto-arrive
                setActiveRide({ ...activeRide, status: 'driver_arrived' });
                setRoutePath([]);
            } else if (activeRide.status === 'in_progress') {
                // Auto-complete
                setActiveRide({ ...activeRide, status: 'completed' });
                setRoutePath([]);
            }
        }
    }, [routeProgress, routePath]);
};
