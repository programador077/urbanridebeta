import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RideRequest, RideStatus, Location, GeminiSource, VehicleType, ChatMessage } from '../types';
import { findPlace, checkTrafficConditions } from '../services/geminiService';
import { calculateFare, formatCurrency } from '../utils/pricing';
import { useSound } from '../hooks/useSound';

interface ClientDashboardProps {
  activeRide: RideRequest | null;
  onRequestRide: (destination: string, price: number, distance: number, vehicleType: VehicleType) => void;
  onCancelRide: () => void;
  onSelectDemoRoute?: (origin: Location, destString: string) => void;
  containerClassName?: string;
  onStartMapSelection: (mode: 'origin' | 'destination') => void;
  isSelectingLocation?: 'origin' | 'destination' | null;
  currentOrigin?: Location;
  currentDestination?: Location;
  onSimulateDriverFound?: () => void;
  onSimulateStartTrip?: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onLocateMe?: () => void;
}

interface AnalysisState {
  price: number;
  distance: number;
  duration: number;
  traffic: string;
  trafficSources: GeminiSource[];
}

const VEHICLE_OPTIONS: { id: VehicleType; label: string; icon: string; priceMult: number }[] = [
  { id: 'moto', label: 'Urban Moto', icon: '🛵', priceMult: 0.7 },
  { id: 'auto', label: 'Urban Auto', icon: '🚗', priceMult: 1.0 },
  { id: 'flash', label: 'Envíos Flash', icon: '📦', priceMult: 0.9 },
];

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeRide,
  onRequestRide,
  onCancelRide,
  onSelectDemoRoute,
  containerClassName,
  onStartMapSelection,
  isSelectingLocation,
  currentOrigin,
  currentDestination,
  onSimulateDriverFound,
  onSimulateStartTrip,
  chatMessages,
  onSendMessage,
  onLocateMe
}) => {
  const [destinationInput, setDestinationInput] = useState('');
  const [originInput, setOriginInput] = useState('Ubicación Actual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisState | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('auto');
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const { playSuccessSound, playMessageSound } = useSound();
  const prevRideStatus = useRef<RideStatus | undefined>(undefined);
  const prevMsgCount = useRef(chatMessages.length);

  // Sound Effects
  useEffect(() => {
    // Driver Found Alert
    if (activeRide?.status === 'accepted' && prevRideStatus.current === 'searching') {
      playSuccessSound();
    }
    prevRideStatus.current = activeRide?.status;
  }, [activeRide?.status, playSuccessSound]);

  useEffect(() => {
    // New Message Alert
    if (chatMessages.length > prevMsgCount.current) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.sender !== 'client') {
        playMessageSound();
      }
    }
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages, playMessageSound]);


  // Update inputs if external location changes
  useEffect(() => {
    if (currentOrigin) {
      const isInitial = currentOrigin.lat === -29.4131;
      if (!isInitial) setOriginInput(`${currentOrigin.lat.toFixed(4)}, ${currentOrigin.lng.toFixed(4)}`);
    }
  }, [currentOrigin]);

  useEffect(() => {
    if (currentDestination) {
      setDestinationInput(`${currentDestination.lat.toFixed(4)}, ${currentDestination.lng.toFixed(4)}`);
    }
  }, [currentDestination]);

  const handleDemoClick = () => {
    const demoOrigin = { lat: -29.4442, lng: -66.8885 };
    const demoDestName = "Plaza 25 de Mayo, La Rioja";
    setOriginInput("Parque de la Ciudad");
    setDestinationInput(demoDestName);
    if (onSelectDemoRoute) onSelectDemoRoute(demoOrigin, demoDestName);
  };

  const handleSearch = async () => {
    if (!destinationInput) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // 1. Get Traffic Info (Gemini)
      const trafficData = await checkTrafficConditions(originInput || "Current Location", destinationInput);

      // 2. Calculate Price (Local Utility)
      // In a real app, we would query OSRM here for exact distance.
      // For now, we simulate a realistic distance based on the "Demo" or random.
      const mockDistance = Math.floor(Math.random() * 5) + 3; // 3-8 km
      const mockDuration = Math.round(mockDistance * 4.5); // 4.5 min per km in city

      // Calculate Price
      const price = calculateFare(mockDistance, mockDuration, selectedVehicle);

      setAnalysisResult({
        price,
        distance: mockDistance,
        duration: mockDuration,
        traffic: trafficData.text,
        trafficSources: trafficData.sources,
      });
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-calculate price if vehicle changes while result is open
  useEffect(() => {
    if (analysisResult) {
      const newPrice = calculateFare(analysisResult.distance, analysisResult.duration, selectedVehicle);
      setAnalysisResult(prev => prev ? ({ ...prev, price: newPrice }) : null);
    }
  }, [selectedVehicle]);

  const handleRequest = () => {
    if (analysisResult) {
      onRequestRide(destinationInput, analysisResult.price, analysisResult.distance, selectedVehicle);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  const baseClasses = containerClassName || "absolute bottom-0 left-0 right-0 p-4 z-40";

  // Mode: Picking on Map
  if (isSelectingLocation) {
    const label = isSelectingLocation === 'origin' ? 'ORIGEN' : 'DESTINO';
    return (
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-800/90 backdrop-blur border border-blue-500 rounded-full px-6 py-3 shadow-2xl flex items-center space-x-3 pointer-events-auto"
        >
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          <span className="text-white font-bold">Toca el mapa para fijar {label}</span>
        </motion.div>
        <button
          onClick={() => onStartMapSelection(isSelectingLocation)}
          className="mt-2 mx-auto block text-xs bg-slate-900/50 text-slate-300 px-3 py-1 rounded-full hover:bg-slate-900 pointer-events-auto backdrop-blur transition-colors"
        >
          Cancelar Selección
        </button>
      </div>
    )
  }

  // View: Active Ride
  if (activeRide && activeRide.status !== 'idle' && activeRide.status !== 'completed') {
    return (
      <div className={baseClasses}>
        <AnimatePresence mode="wait">
          {showChat ? (
            <motion.div
              key="chat"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="glass-panel rounded-t-3xl p-4 shadow-2xl border-t border-blue-500/30 h-[50vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <h3 className="font-bold text-white">Chat con Conductor</h3>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 p-2 mb-2">
                {chatMessages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender === 'client' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-full px-4 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
                <button onClick={handleChatSend} className="bg-blue-600 p-2 rounded-full text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel rounded-t-3xl p-6 shadow-2xl border-t border-blue-500/30 h-full flex flex-col justify-between"
            >
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {activeRide.status === 'searching' && "Buscando conductor..."}
                    {activeRide.status === 'accepted' && "¡Conductor en camino!"}
                    {activeRide.status === 'driver_arrived' && "¡El conductor te espera!"}
                    {activeRide.status === 'in_progress' && "En viaje a tu destino"}
                  </h2>
                  <p className="text-slate-400 text-sm">{activeRide.estimatedTimeMin} min estimados de llegada</p>
                </div>

                {activeRide.status === 'searching' && (
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-700"></div>
                      <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    {onSimulateDriverFound && (
                      <button
                        onClick={onSimulateDriverFound}
                        className="text-xs bg-slate-800 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full hover:bg-emerald-900/30 transition-colors flex items-center gap-1 animate-pulse"
                        title="Simular que un conductor acepta el viaje"
                      >
                        ⚡ Encontrar Ahora (Demo)
                      </button>
                    )}
                  </div>
                )}

                {/* Driver Info & Chat Button */}
                {activeRide.driverId && (
                  <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700 relative">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-600 mr-4 flex items-center justify-center text-2xl border-2 border-slate-500">
                        {activeRide.vehicleType === 'moto' ? '🛵' : '🚗'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-white">Juan Pérez</h3>
                          <span className="flex items-center text-yellow-500 text-sm">★ 4.9</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          {activeRide.vehicleType === 'moto' ? 'Honda Wave • 110cc' : 'Toyota Corolla • AB 123 CD'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChat(true)}
                      className="absolute -top-3 -right-3 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-500 transition-transform hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {chatMessages.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800"></span>}
                    </button>
                  </div>
                )}

                {/* Demo Action: Start Trip */}
                {activeRide.status === 'driver_arrived' && onSimulateStartTrip && (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={onSimulateStartTrip}
                      className="text-sm bg-blue-900/50 text-blue-300 border border-blue-500/50 px-4 py-2 rounded-full hover:bg-blue-900/80 transition-colors flex items-center gap-2 animate-bounce"
                    >
                      🚀 Iniciar Viaje (Demo)
                    </button>
                  </div>
                )}

              </div>

              <div className="space-y-2">
                {activeRide.status === 'searching' && (
                  <button onClick={onCancelRide} className="w-full py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600">Cancelar Solicitud</button>
                )}
                <button className="w-full py-3 rounded-lg bg-blue-600/20 text-blue-400 font-medium border border-blue-500/50">Herramientas de Seguridad</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // View: Request Form
  return (
    <div className={baseClasses}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel rounded-t-3xl p-6 shadow-2xl border-t border-blue-500/30 h-full max-h-[85vh] flex flex-col overflow-y-auto custom-scrollbar"
      >
        <h2 className="text-xl font-bold text-white mb-4">¿A dónde vas?</h2>

        <div className="space-y-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
              <input
                placeholder="Punto de partida"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                className="bg-transparent w-full text-slate-300 outline-none text-sm placeholder-slate-500"
              />
              {onLocateMe && (
                <button
                  onClick={onLocateMe}
                  className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-full transition-colors"
                  title="Usar mi ubicación actual"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              )}
            </div>
            <button onClick={() => onStartMapSelection('origin')} className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center bg-slate-800 p-3 rounded-xl border border-slate-600 focus-within:border-blue-500 transition-colors">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
              <input
                placeholder="Ingresa destino"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="bg-transparent w-full text-white outline-none text-sm placeholder-slate-500"
              />
            </div>
            <button onClick={() => onStartMapSelection('destination')} className="p-3 bg-slate-800 border border-slate-600 rounded-xl hover:bg-slate-700 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>

        {/* Vehicle Selection */}
        {!analysisResult && !isAnalyzing && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {VEHICLE_OPTIONS.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selectedVehicle === v.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <div className="text-2xl mb-1">{v.icon}</div>
                <div className="text-[10px] font-bold uppercase">{v.label}</div>
              </button>
            ))}
          </div>
        )}

        {!analysisResult && !isAnalyzing && (
          <button
            onClick={handleDemoClick}
            className="w-full mb-4 py-3 bg-slate-800 hover:bg-slate-700 border border-blue-500/30 border-dashed rounded-xl text-sm text-blue-300 font-medium flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-blue-500/10 group"
          >
            <span className="group-hover:scale-110 transition-transform">🚀</span>
            <span>Usar Ruta Demo</span>
          </button>
        )}

        {!analysisResult && !isAnalyzing && (
          <button
            onClick={handleSearch}
            disabled={!destinationInput}
            className="w-full py-4 bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition-all"
          >
            Buscar Viaje
          </button>
        )}

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
            </div>
            <p className="text-xs text-slate-400">Gemini está analizando datos...</p>
          </div>
        )}

        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400 text-sm">Tarifa ({VEHICLE_OPTIONS.find(v => v.id === selectedVehicle)?.label})</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(analysisResult.price)}</span>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded mb-2 border-l-2 border-blue-500">
                <div className="font-bold text-blue-400 mb-1">Tráfico y Ruta en Vivo</div>
                {analysisResult.traffic}
                {analysisResult.trafficSources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Fuentes:</span>
                    {analysisResult.trafficSources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 px-2 py-0.5 rounded border border-slate-700 truncate max-w-[150px]">
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setAnalysisResult(null)} className="py-3 bg-slate-700 rounded-xl text-white font-medium">Volver</button>
              <button onClick={handleRequest} className="py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold shadow-lg shadow-blue-600/20">Confirmar</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ClientDashboard;