import React from 'react';
import { UserRole } from '../types';

interface LandingPageProps {
    onSelectRole: (role: UserRole) => void;
    onDriverLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onDriverLoginClick }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

            <main className="relative z-10 w-full max-w-md bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in-up">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">
                        URBAN<span className="text-blue-500">RIDE</span>
                    </h1>
                    <p className="text-slate-400">Movilidad de Próxima Generación • Beta 1.0</p>
                </header>

                <nav className="space-y-4" aria-label="Selección de Rol">
                    <button
                        onClick={() => onSelectRole('client')}
                        className="w-full group relative overflow-hidden rounded-xl bg-blue-600 p-4 transition-all hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25"
                        aria-label="Ingresar como pasajero"
                    >
                        <div className="relative z-10 flex items-center justify-center space-x-2 font-bold text-white">
                            <span>Pedir un Viaje</span>
                        </div>
                    </button>

                    <button
                        onClick={onDriverLoginClick}
                        className="w-full group relative overflow-hidden rounded-xl bg-slate-700 p-4 transition-all hover:bg-slate-600 border border-slate-600 shadow-lg"
                        aria-label="Ingresar como conductor"
                    >
                        <div className="relative z-10 flex items-center justify-center space-x-2 font-bold text-slate-200">
                            <span>Conducir y Ganar</span>
                        </div>
                    </button>

                    <div className="relative flex py-2 items-center" role="separator">
                        <div className="flex-grow border-t border-slate-600"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Modo Desarrollador</span>
                        <div className="flex-grow border-t border-slate-600"></div>
                    </div>

                    <button
                        onClick={() => onSelectRole('simulation')}
                        className="w-full group relative overflow-hidden rounded-xl bg-purple-900/50 border border-purple-500/50 p-4 transition-all hover:bg-purple-900/70 shadow-lg hover:shadow-purple-500/20"
                        aria-label="Ingresar en modo simulación"
                    >
                        <div className="relative z-10 flex items-center justify-center space-x-2 font-bold text-purple-200">
                            <span>Simulación Dual</span>
                        </div>
                    </button>
                </nav>
            </main>

            <footer className="absolute bottom-4 text-slate-500 text-xs">
                &copy; {new Date().getFullYear()} UrbanRide Technologies
            </footer>
        </div>
    );
};

export default LandingPage;
