import React, { useState } from 'react';
import { UserRole } from '../types';

interface TutorialOverlayProps {
  role: UserRole;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ role, onClose }) => {
  const [step, setStep] = useState(0);

  const clientSteps = [
    {
      step: 1,
      title: "Bienvenido a UrbanRide",
      description: "Experimenta la próxima generación de viajes compartidos impulsada por Gemini. ¡Vamos a movernos!",
      icon: "👋"
    },
    {
      step: 2,
      title: "Ingresa tu Destino",
      description: "Escribe a dónde quieres ir. Nuestra IA usa datos de Google Maps para encontrar los mejores lugares.",
      icon: "📍"
    },
    {
      step: 3,
      title: "Precios Inteligentes",
      description: "Analizamos el tráfico y la demanda en tiempo real para darte un precio justo y transparente.",
      icon: "💎"
    },
    {
      step: 4,
      title: "Sigue tu Viaje",
      description: "Mira a tu conductor llegar en tiempo real en el mapa dinámico. ¡Relájate y disfruta el viaje!",
      icon: "🚗"
    }
  ];

  const driverSteps = [
    {
      step: 1,
      title: "Bienvenido Socio",
      description: "Maximiza tus ganancias con nuestro panel inteligente. Así es como funciona.",
      icon: "👋"
    },
    {
      step: 2,
      title: "Conéctate",
      description: "Activa el interruptor en la esquina superior izquierda a 'Conectado' para recibir solicitudes.",
      icon: "🟢"
    },
    {
      step: 3,
      title: "Acepta Solicitudes",
      description: "Mira las ganancias y la distancia de cada viaje por adelantado. Toca 'Aceptar' para iniciar.",
      icon: "✅"
    },
    {
      step: 4,
      title: "Navega y Gana",
      description: "Sigue el mapa en vivo hasta el pasajero. Completa el viaje para ver crecer tus ganancias inmediatamente.",
      icon: "💰"
    }
  ];

  const steps = role === 'driver' ? driverSteps : clientSteps;
  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center text-4xl mb-6 border border-slate-600 shadow-inner">
            {current.icon}
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {current.title}
          </h3>
          
          <div className="flex items-center space-x-2 mb-4">
             <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Paso {current.step} de {steps.length}</span>
          </div>

          <p className="text-slate-300 mb-8 leading-relaxed text-sm">
            {current.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-blue-500 w-6' : 'bg-slate-600'}`}
              />
            ))}
          </div>

          <div className="flex space-x-3">
             {step > 0 && (
                 <button 
                 onClick={() => setStep(step - 1)}
                 className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm transition-colors"
               >
                 Atrás
               </button>
             )}
            <button 
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20 text-sm"
            >
                {step === steps.length - 1 ? "¡Vamos!" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;