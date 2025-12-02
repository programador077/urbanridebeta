import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location, RideStatus } from '../types';

// --- Custom Icons ---

const createPulseIcon = (colorClass: string) => L.divIcon({
  className: 'custom-pin',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-full h-full ${colorClass} rounded-full animate-ping opacity-75"></div>
           <div class="relative w-4 h-4 ${colorClass} border-2 border-white rounded-full shadow-lg"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const riderIcon = createPulseIcon('bg-blue-500');
const destinationIcon = createPulseIcon('bg-red-500');

const createCarIcon = (heading: number, colorClass: string) => L.divIcon({
  className: 'custom-car',
  html: `<div class="relative w-12 h-12 flex items-center justify-center" style="transform: rotate(${heading}deg); transition: transform 0.3s linear;">
           <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-2xl ${colorClass}">
             <path d="M24 2L20 6L18 12L16 16V34L18 40L20 42H28L30 40L32 34V16L30 12L28 6L24 2Z" fill="currentColor" class="opacity-90"/>
             <path d="M20 10H28L29 14H19L20 10Z" fill="#1e293b" />
             <path d="M19 14H29V24H19V14Z" fill="currentColor" class="opacity-80"/>
             <path d="M19 24H29L28 28H20L19 24Z" fill="#1e293b" />
             <rect x="18" y="4" width="2" height="2" fill="#fbbf24" />
             <rect x="28" y="4" width="2" height="2" fill="#fbbf24" />
             <rect x="18" y="40" width="2" height="1" fill="#ef4444" />
             <rect x="28" y="40" width="2" height="1" fill="#ef4444" />
           </svg>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

// --- Helper Components ---

const MapController: React.FC<{ center: Location; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom || map.getZoom(), { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const MapClickHandler: React.FC<{ onClick: (loc: Location) => void; isSelecting: boolean }> = ({ onClick, isSelecting }) => {
  useMapEvents({
    click(e) {
      if (isSelecting) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

const ZoomControls = ({ onLocateMe }: { onLocateMe?: () => void }) => {
  const map = useMap();

  return (
    <div className="absolute top-24 right-4 z-[400] flex flex-col gap-3">
      {onLocateMe && (
        <button
          onClick={(e) => { e.stopPropagation(); onLocateMe(); }}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-slate-800/90 backdrop-blur p-3 rounded-xl text-blue-400 shadow-xl border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all hover:scale-110 active:scale-95 group mb-2"
          aria-label="Locate Me"
        >
          <svg className="w-6 h-6 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
        onDoubleClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-slate-800/90 backdrop-blur p-3 rounded-xl text-white shadow-xl border border-slate-600 hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 group"
        aria-label="Zoom In"
      >
        <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
        onDoubleClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-slate-800/90 backdrop-blur p-3 rounded-xl text-white shadow-xl border border-slate-600 hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 group"
        aria-label="Zoom Out"
      >
        <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
      </button>
    </div>
  );
};

// --- Main Component ---

interface SimulatedMapProps {
  riderLocation: Location;
  driverLocation?: Location;
  driverHeading?: number;
  destination?: Location;
  status: RideStatus;
  isDriver?: boolean;
  onMapClick?: (loc: Location) => void;
  isSelecting?: boolean;
  showControls?: boolean;
  interactive?: boolean;
  onLocateMe?: () => void;
}

const SimulatedMap: React.FC<SimulatedMapProps> = ({
  riderLocation,
  driverLocation,
  driverHeading = 0,
  destination,
  status,
  isDriver,
  onMapClick,
  isSelecting,
  showControls = true,
  interactive = true,
  onLocateMe
}) => {

  // Determine Map Center
  // If driver is active and we are tracking, maybe follow driver? 
  // For now, keep simple logic: if driver is arriving/in-progress, center might need to adjust.
  // But let's stick to rider location as primary, or midpoint.
  const center = riderLocation;

  // Driver Visuals
  let driverColorClass = 'text-emerald-400';
  if (status === 'driver_arrived') driverColorClass = 'text-red-500';
  if (status === 'in_progress') driverColorClass = 'text-blue-500';

  const driverIcon = createCarIcon(driverHeading, driverColorClass);

  return (
    <div className={`relative w-full h-full bg-slate-900 overflow-hidden ${isSelecting ? 'cursor-crosshair' : ''}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#0f172a' }}
      >
        {/* Dark Mode Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Map Controller to handle external state updates */}
        <MapController center={center} />

        {/* Click Handler */}
        {onMapClick && <MapClickHandler onClick={onMapClick} isSelecting={!!isSelecting} />}

        {/* Rider Marker */}
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
          <Popup className="custom-popup">Tu Ubicación</Popup>
        </Marker>

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup className="custom-popup">Destino</Popup>
          </Marker>
        )}

        {/* Driver Marker */}
        {driverLocation && status !== 'idle' && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} zIndexOffset={1000}>
            <Popup>{isDriver ? 'Tú' : 'Conductor'}</Popup>
          </Marker>
        )}

        {/* Route Line */}
        {destination && (
          <Polyline
            positions={[
              [riderLocation.lat, riderLocation.lng],
              [destination.lat, destination.lng]
            ]}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />
        )}

        {/* Driver Route (if needed, e.g. from driver to pickup) */}
        {driverLocation && status === 'accepted' && (
          <Polyline
            positions={[
              [driverLocation.lat, driverLocation.lng],
              [riderLocation.lat, riderLocation.lng]
            ]}
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.6 }}
          />
        )}

        {/* Custom Zoom Controls */}
        {showControls && <ZoomControls onLocateMe={onLocateMe} />}

      </MapContainer>

      {/* Selection Overlay UI */}
      {isSelecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg border border-blue-500 animate-bounce">
          Toca el mapa para seleccionar ubicación
        </div>
      )}
    </div>
  );
};

export default SimulatedMap;