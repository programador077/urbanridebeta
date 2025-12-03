import React, { useEffect, useState } from 'react';
import { RideProvider, useRide } from './contexts/RideContext';
import { useRideSimulation } from './hooks/useRideSimulation';
import { RideStatus, VehicleType, ChatMessage, CompletedRide, Location } from './types';
import { calculateFare } from './utils/pricing';
import { generateSmartReply } from './services/geminiService';

import SimulatedMap from './components/SimulatedMap';
import DriverDashboard from './components/DriverDashboard';
import ClientDashboard from './components/ClientDashboard';
import Notification from './components/Notification';
import TutorialOverlay from './components/TutorialOverlay';
import DriverLogin from './components/DriverLogin';
import LandingPage from './components/LandingPage';

// --- Inner Component to use Context ---
const UrbanRideApp: React.FC = () => {
  const {
    role, setRole,
    myLocation, setMyLocation,
    driverLocation, driverHeading,
    destination, setDestination,
    activeRide, dispatchRide,
    isDriverOnline, setIsDriverOnline,
    chatMessages, setChatMessages, addChatMessage,
    notification, showNotification,
    earnings, setEarnings,
    rideHistory, setRideHistory
  } = useRide();

  // Activate Simulation Hook
  useRideSimulation();

  const [showDriverLogin, setShowDriverLogin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'origin' | 'destination' | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (role === 'simulation') setIsDriverOnline(true);
  }, [role]);

  // --- Actions ---

  const handleRequestRide = (destStr: string, price: number, distance: number, vehicleType: VehicleType) => {
    let mockDestCoords = destination;
    if (!mockDestCoords) {
      mockDestCoords = { lat: -29.4131, lng: -66.8558 }; // Default
    }

    dispatchRide({
      type: 'REQUEST_RIDE',
      payload: {
        origin: myLocation,
        destination: mockDestCoords,
        price,
        distance,
        vehicleType,
        clientId: 'client-1',
        clientName: 'Tú'
      }
    });
    setChatMessages([]);
  };

  const handleDriverAccept = () => {
    if (!activeRide) return;
    dispatchRide({ type: 'DRIVER_ACCEPT', payload: { driverId: 'driver-me' } });
    addChatMessage({ id: 'sys', sender: 'driver', text: '¡Hola! Estoy en camino.', timestamp: Date.now() });
  };

  const handleDriverReject = () => {
    dispatchRide({ type: 'RESET' });
    setDestination(undefined);
    setChatMessages([]);
  };

  const handleStatusUpdate = (status: RideStatus) => {
    if (!activeRide) return;

    if (status === 'driver_arrived') {
      dispatchRide({ type: 'DRIVER_ARRIVED' });
    } else if (status === 'in_progress') {
      dispatchRide({ type: 'START_TRIP' });
    } else if (status === 'completed') {
      const rideEarnings = activeRide.estimatedPrice * 0.85;
      setEarnings(prev => prev + rideEarnings);

      const completedRide: CompletedRide = {
        ...activeRide,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      setRideHistory(prev => [completedRide, ...prev]);
      dispatchRide({ type: 'COMPLETE_TRIP' });

      // Reset after delay
      setTimeout(() => {
        dispatchRide({ type: 'RESET' });
        setDestination(undefined);
        setChatMessages([]);
      }, 3000);
    }
  };

  const handleCancelRide = () => {
    dispatchRide({ type: 'CANCEL_RIDE' });
    setDestination(undefined);
    setChatMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeRide) return;
    addChatMessage({ id: Date.now().toString(), sender: 'client', text, timestamp: Date.now() });

    // Simulate Driver Smart Reply
    if (Math.random() > 0.3) {
      try {
        const reply = await generateSmartReply(text, activeRide.status);
        setTimeout(() => {
          addChatMessage({ id: Date.now().toString(), sender: 'driver', text: reply, timestamp: Date.now() });
        }, 2000);
      } catch (e) { console.error(e); }
    }
  };

  const handleMapClick = (loc: Location) => {
    if (selectionMode === 'origin') {
      setMyLocation(loc);
      setSelectionMode(null);
    } else if (selectionMode === 'destination') {
      setDestination(loc);
      setSelectionMode(null);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          showNotification("¡Ubicación actualizada!", "success");
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === 1) { // PERMISSION_DENIED
            showNotification("🚫 Acceso denegado.\n\nPara activar la ubicación:\n1. Haz clic en el icono de 🔒 o 📍 en la barra de direcciones.\n2. Activa el permiso de 'Ubicación'.\n3. Recarga la página.", "error");
          } else {
            showNotification("⚠️ No pudimos obtener tu ubicación. Asegúrate de tener el GPS activado.", "error");
          }
        }
      );
    } else {
      showNotification("Tu navegador no soporta geolocalización.", "error");
    }
  };

  // --- Views ---

  if (!role) {
    if (showDriverLogin) {
      return <DriverLogin onLogin={() => setRole('driver')} onBack={() => setShowDriverLogin(false)} />;
    }
    return <LandingPage onSelectRole={setRole} onDriverLoginClick={() => setShowDriverLogin(true)} />;
  }

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <button onClick={() => { setRole(null); setShowDriverLogin(false); }} className="w-10 h-10 bg-slate-800/90 backdrop-blur rounded-full flex items-center justify-center text-white shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="bg-slate-800/90 backdrop-blur px-4 py-2 rounded-full border border-slate-700 shadow-lg">
            <span className="font-bold text-blue-500">URBAN</span><span className="text-white font-bold">RIDE</span>
            {role === 'simulation' && <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded text-white font-normal uppercase">Modo Sim</span>}
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <SimulatedMap
          riderLocation={myLocation}
          driverLocation={driverLocation}
          driverHeading={driverHeading}
          destination={destination}
          status={activeRide?.status || 'idle'}
          isDriver={role === 'driver' || role === 'simulation'}
          onMapClick={handleMapClick}
          isSelecting={!!selectionMode}
          onLocateMe={handleLocateMe}
        />
      </div>

      {/* UI Layers */}
      {role === 'driver' && (
        <DriverDashboard
          activeRide={activeRide}
          onAcceptRide={handleDriverAccept}
          onRejectRide={handleDriverReject}
          onUpdateStatus={handleStatusUpdate}
          driver={{ id: 'me', name: 'Yo', role: 'driver', avatar: '', rating: 5.0 }}
          isOnline={isDriverOnline}
          setIsOnline={setIsDriverOnline}
          earnings={earnings}
          rideHistory={rideHistory}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
          onLocateMe={handleLocateMe}
        />
      )}

      {role === 'client' && (
        <ClientDashboard
          activeRide={activeRide}
          onRequestRide={handleRequestRide}
          onCancelRide={handleCancelRide}
          onSelectDemoRoute={(o) => setMyLocation(o)}
          onStartMapSelection={(m) => setSelectionMode(prev => prev === m ? null : m)}
          isSelectingLocation={selectionMode}
          currentOrigin={myLocation}
          currentDestination={destination}
          onSimulateDriverFound={handleDriverAccept}
          onSimulateStartTrip={() => handleStatusUpdate('in_progress')}
          chatMessages={chatMessages}
          onSendMessage={handleSendMessage}
          onLocateMe={handleLocateMe}
        />
      )}

      {role === 'simulation' && (
        <div className="absolute inset-0 top-20 z-40 p-4 pointer-events-none flex flex-col md:flex-row gap-4 overflow-hidden">
          <div className="flex-1 pointer-events-auto relative h-1/2 md:h-full flex flex-col justify-end">
            <div className="absolute -top-6 left-0 text-xs font-bold text-blue-400 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded">Lado Cliente</div>
            <ClientDashboard
              activeRide={activeRide}
              onRequestRide={handleRequestRide}
              onCancelRide={handleCancelRide}
              onSelectDemoRoute={(o) => setMyLocation(o)}
              containerClassName="relative w-full max-h-full"
              onStartMapSelection={(m) => setSelectionMode(prev => prev === m ? null : m)}
              isSelectingLocation={selectionMode}
              currentOrigin={myLocation}
              currentDestination={destination}
              onSimulateDriverFound={handleDriverAccept}
              onSimulateStartTrip={() => handleStatusUpdate('in_progress')}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              onLocateMe={handleLocateMe}
            />
          </div>

          <div className="flex-1 pointer-events-auto relative h-1/2 md:h-full flex flex-col justify-end">
            <div className="absolute -top-6 right-0 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded">Lado Conductor</div>
            <DriverDashboard
              activeRide={activeRide}
              onAcceptRide={handleDriverAccept}
              onRejectRide={handleDriverReject}
              onUpdateStatus={handleStatusUpdate}
              driver={{ id: 'me', name: 'Yo', role: 'driver', avatar: '', rating: 5.0 }}
              isOnline={isDriverOnline}
              setIsOnline={setIsDriverOnline}
              earnings={earnings}
              rideHistory={rideHistory}
              containerClassName="relative w-full max-h-full"
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              onLocateMe={handleLocateMe}
            />
          </div>
        </div>
      )}

      {showTutorial && <TutorialOverlay role={role!} onClose={() => setShowTutorial(false)} />}
      <Notification notification={notification} onClose={() => showNotification('', 'info')} />
    </div>
  );
};

// --- Main App Wrapper ---
const App: React.FC = () => {
  return (
    <RideProvider>
      <UrbanRideApp />
    </RideProvider>
  );
};

export default App;