# 🚖 UrbanRide Beta

**UrbanRide** es una plataforma de movilidad de próxima generación diseñada para ofrecer una experiencia de usuario premium, rápida y segura. Este repositorio contiene el prototipo funcional (MVP) desarrollado con tecnologías web modernas.

## 🚀 Tecnologías Utilizadas

El proyecto está construido sobre un stack robusto y escalable:

*   **Core:** [React](https://reactjs.org/) (v18) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/) (para un desarrollo ultrarrápido)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y Glassmorphism)
*   **Mapas:** [React Leaflet](https://react-leaflet.js.org/) + OpenStreetMap (con estilos oscuros personalizados)
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/) (Transiciones fluidas)
*   **Estado Global:** React Context API
*   **PWA:** Web App Manifest (Instalable en móviles)

## 📂 Estructura del Proyecto

La arquitectura está organizada para ser modular y mantenible:

```bash
/src
  ├── /components       # Componentes de UI (Vistas y Elementos)
  │   ├── ClientDashboard.tsx  # Panel del pasajero (pedir viaje, chat)
  │   ├── DriverDashboard.tsx  # Panel del conductor (aceptar viajes, ganancias)
  │   ├── SimulatedMap.tsx     # Mapa interactivo con Leaflet
  │   ├── LandingPage.tsx      # Pantalla de bienvenida
  │   └── ...
  ├── /contexts         # Gestión de Estado Global
  │   └── RideContext.tsx      # Lógica central (roles, ubicación, viajes)
  ├── /hooks            # Custom Hooks (Lógica reutilizable)
  │   ├── useRideSimulation.ts # Motor de simulación de movimiento GPS
  │   └── useSound.ts          # Efectos de sonido y vibración
  ├── /services         # Integraciones Externas
  │   ├── routingService.ts    # Cálculo de rutas (OSRM)
  │   └── geminiService.ts     # IA para chat y análisis de tráfico
  ├── /utils            # Utilidades puras
  │   └── pricing.ts           # Algoritmo de precios dinámicos
  └── App.tsx           # Componente raíz y orquestador
```

## ✨ Características Clave

1.  **Simulación Dual:** Permite probar la app como Pasajero y Conductor simultáneamente en la misma pantalla.
2.  **Mapa en Tiempo Real:** Visualización de vehículos, rutas y estimaciones de llegada.
3.  **Experiencia Sensorial:** Efectos de sonido sintetizados y feedback háptico (vibración) para notificaciones.
4.  **Precios Dinámicos:** Algoritmo que ajusta tarifas según hora pico y demanda simulada.
5.  **Persistencia:** Guarda tu progreso (ganancias, historial) en el navegador.
6.  **PWA:** Puede instalarse como una app nativa en Android/iOS.

## 🛠️ Cómo Ejecutar el Proyecto

Sigue estos pasos para correr la aplicación en tu entorno local:

### Prerrequisitos
*   Node.js (v16 o superior)
*   npm (v8 o superior)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/programador077/urbanridebeta.git
    cd urbanridebeta
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Abrir en el navegador:**
    Visita `http://localhost:5173` (o el puerto que indique la terminal).

## 📱 Probar en Móvil (Red Local)
Para probar la geolocalización y la experiencia PWA en tu celular:
1.  Asegúrate de que tu PC y celular estén en la misma red WiFi.
2.  Ejecuta `npm run dev -- --host`.
3.  En tu celular, ingresa a la IP de tu PC (ej: `http://192.168.1.X:5173`).


---
&copy; 2025 **Esio Nahuel Vitanoff**. Todos los derechos reservados.
Desarrollado con ❤️ por UrbanRide Technologies.
