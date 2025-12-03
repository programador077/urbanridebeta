import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RideRequest, RideStatus, User, CompletedRide, ChatMessage } from '../types';
import { formatCurrency } from '../utils/pricing';
import { useSound } from '../hooks/useSound';

interface DriverDashboardProps {
  activeRide: RideRequest | null;
  onAcceptRide: () => void;
  onRejectRide: () => void;
  onUpdateStatus: (newStatus: RideStatus) => void;
  driver: User;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  earnings: number;
  containerClassName?: string;
  rideHistory?: CompletedRide[];
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onLocateMe?: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({
  activeRide,
  onAcceptRide,
  onRejectRide,
  onUpdateStatus,
  driver,
  isOnline,
  setIsOnline,
  earnings,
  containerClassName,
  rideHistory = [],
  chatMessages,
  onSendMessage,
  onLocateMe
}) => {
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);

  const { playRequestSound, playMessageSound } = useSound();
  const prevRideStatus = useRef<RideStatus | undefined>(undefined);
  const prevMsgCount = useRef(chatMessages.length);

  // Sound Effects Logic
  useEffect(() => {
    // New Request Alert
    if (activeRide?.status === 'searching' && prevRideStatus.current !== 'searching') {
      playRequestSound();
    }
    prevRideStatus.current = activeRide?.status;
  }, [activeRide?.status, playRequestSound]);

  useEffect(() => {
    // New Message Alert (only if count increases and last msg is not from me)
    if (chatMessages.length > prevMsgCount.current) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.sender !== 'driver') {
        playMessageSound();
      }
    }
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages, playMessageSound]);

  // Auto-open dashboard when a new ride comes in
  useEffect(() => {
    if (activeRide?.status === 'searching') {
      setView('dashboard');
      setShowChat(false);
    }
  }, [activeRide?.status]);

  const baseClasses = containerClassName || "absolute bottom-0 left-0 right-0 p-4 z-40";

  const toggleExpand = (id: string) => {
    setExpandedRideId(expandedRideId === id ? null : id);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

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
              <h3 className="font-bold text-white">Chat con Pasajero</h3>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-2 mb-2">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.sender === 'driver' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
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
            key="main-panel"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel rounded-t-3xl p-6 shadow-2xl border-t border-blue-500/30 h-full max-h-[80vh] flex flex-col"
          >

            {/* Header: Online/Offline & Earnings */}
            <div className="flex flex-wrap justify-between items-center mb-6 shrink-0 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-500'}`}></div>
                <span className="font-semibold text-lg">{isOnline ? 'Conectado' : 'Desconectado'}</span>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="text-right cursor-pointer group ml-auto" onClick={() => setView(view === 'dashboard' ? 'history' : 'dashboard')}>
                <p className="text-xs text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Ganancias de Hoy</p>
                <p className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center justify-end gap-1">
                  {formatCurrency(earnings)}
                  <svg className={`w-4 h-4 transition-transform ${view === 'history' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </p>
              </div>
            </div>

            {/* VIEW: HISTORY */}
            {view === 'history' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full mr-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h3 className="text-lg font-bold text-white">Historial de Viajes</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {rideHistory.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <div className="mb-2 text-4xl grayscale opacity-50">📜</div>
                      Aún no hay viajes completados.
                    </div>
                  ) : (
                    rideHistory.map((ride) => (
                      <motion.div
                        layout
                        key={ride.id}
                        className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
                      >
                        <div
                          onClick={() => toggleExpand(ride.id)}
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">✅</div>
                            <div>
                              <p className="font-bold text-white">{formatCurrency(ride.estimatedPrice * 0.85)}</p>
                              <p className="text-xs text-slate-400">
                                {new Date(ride.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">{ride.distanceKm} km</span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedRideId === ride.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 pt-0 text-sm bg-slate-900/30 border-t border-slate-700/50"
                            >
                              <div className="mt-3 space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] mt-0.5">●</div>
                                  <div className="flex-1">
                                    <p className="text-slate-500 text-xs">Origen</p>
                                    <p className="text-slate-300 truncate">{ride.origin.address || `${ride.origin.lat.toFixed(4)}, ${ride.origin.lng.toFixed(4)}`}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-[10px] mt-0.5">●</div>
                                  <div className="flex-1">
                                    <p className="text-slate-500 text-xs">Destino</p>
                                    <p className="text-slate-300 truncate">{ride.destination.address || `${ride.destination.lat.toFixed(4)}, ${ride.destination.lng.toFixed(4)}`}</p>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                                  <span className="text-xs text-slate-500">Cliente: {ride.clientName}</span>
                                  <span className="text-xs text-emerald-400">Pago con Tarjeta</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW: DASHBOARD (Active Ride) */}
            {view === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col"
              >
                {activeRide && activeRide.status === 'searching' && isOnline && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-800 p-4 rounded-xl border-2 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        ¡Nueva Solicitud!
                      </h3>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">{activeRide.distanceKm} km</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        Desde: {activeRide.origin.lat.toFixed(3)}, {activeRide.origin.lng.toFixed(3)}
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        Hasta: {activeRide.destination.lat.toFixed(3)}, {activeRide.destination.lng.toFixed(3)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4 bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-400">{formatCurrency(activeRide.estimatedPrice * 0.85)} <span className="text-xs text-slate-500 font-normal">(Tu ganancia)</span></div>
                      <div className="text-sm text-slate-400">Est. {activeRide.estimatedTimeMin} min</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={onRejectRide} className="py-3 rounded-lg bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors">Rechazar</button>
                      <button onClick={onAcceptRide} className="py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02]">Aceptar Viaje</button>
                    </div>
                  </motion.div>
                )}

                {/* Active Ride Controls */}
                {activeRide && activeRide.status !== 'searching' && activeRide.status !== 'completed' && activeRide.status !== 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-4 relative">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl border border-slate-600">👤</div>
                        <div>
                          <p className="font-bold text-white text-lg">{activeRide.clientName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            Pasajero • <span className="text-yellow-500">★ 4.8</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-slate-800 px-3 py-1 rounded text-xs text-emerald-400 border border-emerald-900/50 font-bold tracking-wider">
                          {activeRide.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <button
                          onClick={() => setShowChat(true)}
                          className="bg-blue-600/20 text-blue-400 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors relative"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {chatMessages.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {activeRide.status === 'accepted' && (
                        <button onClick={() => onUpdateStatus('driver_arrived')} className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-lg shadow-purple-600/20 transition-all transform hover:scale-[1.01]">
                          📍 Confirmar Llegada
                        </button>
                      )}
                      {activeRide.status === 'driver_arrived' && (
                        <button onClick={() => onUpdateStatus('in_progress')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.01]">
                          🚀 Iniciar Viaje
                        </button>
                      )}
                      {activeRide.status === 'in_progress' && (
                        <button onClick={() => onUpdateStatus('completed')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.01]">
                          🏁 Finalizar Viaje
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!activeRide && isOnline && (
                  <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center h-full">
                    <div className="relative w-20 h-20 mb-4">
                      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 border-4 border-blue-500/40 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">📡</div>
                    </div>
                    <p className="font-medium text-white">Buscando pasajeros...</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-[200px]">Mantente en zonas de alta demanda para recibir más viajes.</p>
                  </div>
                )}

                {!isOnline && (
                  <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
                      😴
                    </div>
                    <p className="font-medium">Estás desconectado</p>
                    <p className="text-xs mt-2">Activa el interruptor para comenzar a ganar dinero.</p>
                  </div>
                )}
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverDashboard;