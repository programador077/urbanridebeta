import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RideRequest, Location, UserRole, ChatMessage, CompletedRide } from '../types';
import { rideReducer, RideAction } from '../reducers/rideReducer';

interface RideContextType {
    // User State
    role: UserRole;
    setRole: (role: UserRole) => void;
    myLocation: Location;
    setMyLocation: (loc: Location) => void;

    // Ride State
    activeRide: RideRequest | null;
    dispatchRide: React.Dispatch<RideAction>; // Replaces setActiveRide
    destination: Location | undefined;
    setDestination: (loc: Location | undefined) => void;

    // Driver State
    driverLocation: Location;
    setDriverLocation: (loc: Location) => void;
    driverHeading: number;
    setDriverHeading: (heading: number) => void;
    isDriverOnline: boolean;
    setIsDriverOnline: (online: boolean) => void;

    // Data
    chatMessages: ChatMessage[];
    setChatMessages: (msgs: ChatMessage[]) => void;
    addChatMessage: (msg: ChatMessage) => void;
    notification: { message: string; type: 'success' | 'error' | 'info' } | null;
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;

    // Driver Stats
    earnings: number;
    setEarnings: (amount: number | ((prev: number) => number)) => void;
    rideHistory: CompletedRide[];
    setRideHistory: (history: CompletedRide[] | ((prev: CompletedRide[]) => CompletedRide[])) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state from localStorage if available
    const [role, setRole] = useState<UserRole | null>(() => {
        const saved = localStorage.getItem('urbanride_role');
        return saved ? JSON.parse(saved) : null;
    });

    const [myLocation, setMyLocation] = useState<Location>({ lat: -29.4131, lng: -66.8558 });
    const [driverLocation, setDriverLocation] = useState<Location | undefined>(undefined);
    const [driverHeading, setDriverHeading] = useState<number>(0);
    const [destination, setDestination] = useState<Location | undefined>(undefined);
    // Replace useState with useReducer
    const [activeRide, dispatchRide] = React.useReducer(rideReducer, null);

    const [isDriverOnline, setIsDriverOnline] = useState<boolean>(() => {
        return localStorage.getItem('urbanride_isOnline') === 'true';
    });

    const [earnings, setEarnings] = useState<number>(() => {
        const saved = localStorage.getItem('urbanride_earnings');
        return saved ? parseFloat(saved) : 12500;
    });

    const [rideHistory, setRideHistory] = useState<CompletedRide[]>(() => {
        const saved = localStorage.getItem('urbanride_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Persistence Effects
    React.useEffect(() => {
        if (role) localStorage.setItem('urbanride_role', JSON.stringify(role));
        else localStorage.removeItem('urbanride_role');
    }, [role]);

    React.useEffect(() => {
        localStorage.setItem('urbanride_isOnline', String(isDriverOnline));
    }, [isDriverOnline]);

    React.useEffect(() => {
        localStorage.setItem('urbanride_earnings', String(earnings));
    }, [earnings]);

    React.useEffect(() => {
        localStorage.setItem('urbanride_history', JSON.stringify(rideHistory));
    }, [rideHistory]);


    const addChatMessage = (msg: ChatMessage) => {
        setChatMessages(prev => [...prev, msg]);
    };

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const value = {
        role, setRole,
        myLocation, setMyLocation,
        driverLocation, setDriverLocation,
        driverHeading, setDriverHeading,
        destination, setDestination,
        activeRide, dispatchRide,
        isDriverOnline, setIsDriverOnline,
        chatMessages, setChatMessages, addChatMessage,
        notification, showNotification,
        earnings, setEarnings,
        rideHistory, setRideHistory
    };

    return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export const useRide = () => {
    const context = useContext(RideContext);
    if (!context) throw new Error('useRide must be used within a RideProvider');
    return context;
};
