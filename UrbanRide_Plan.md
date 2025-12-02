# UrbanRide Beta: Concepto y Diseño Funcional

## 1. Descripción del Proyecto
**Nombre Clave:** UrbanRide (Beta)
**Slogan:** "Tu ciudad, tu tiempo, tu viaje."

**UrbanRide** es una plataforma tecnológica de movilidad y logística de última milla diseñada para conectar de manera eficiente a conductores independientes con usuarios que requieren transporte o envíos rápidos. A diferencia de las soluciones tradicionales, UrbanRide se centra en la transparencia total de tarifas, la libertad operativa para el conductor y una experiencia de usuario premium basada en mapas dinámicos en tiempo real.

El proyecto se lanzará en fase Beta en **La Rioja, Argentina**, validando un modelo de negocio justo donde el conductor conserva la mayor parte de sus ingresos (80-90%), fomentando así una oferta constante de vehículos y precios competitivos para el usuario.

---

## 2. Modelo Funcional

### A. Para Conductores (La Flota)
El conductor es el motor de la plataforma. Su experiencia se centra en la claridad y la rapidez.

1.  **Onboarding Rápido:** Registro simplificado (DNI, Licencia, Seguro, Foto del Vehículo). Validación en < 24hs.
2.  **Radar de Oportunidades:**
    *   Al conectarse ("Modo Disponible"), el mapa muestra zonas de alta demanda (mapas de calor).
    *   Al recibir una alerta de viaje, ve **TODO** antes de aceptar: Ganancia neta, Punto A (Origen), Punto B (Destino) y Distancia total.
3.  **Navegación Asistida:**
    *   Ruta óptima integrada en la app.
    *   Botones de estado grandes para seguridad al volante: "Llegué", "Iniciando", "Finalizado".
4.  **Billetera Transparente:**
    *   Visualización inmediata de la ganancia tras cada viaje.
    *   Resumen diario y semanal.

### B. Para Clientes (El Pasajero)
El cliente busca seguridad, precio y rapidez.

1.  **Solicitud Intuitiva:**
    *   Ingreso de destino (texto o pin en mapa).
    *   Selección de servicio: "Viaje Express" (Auto), "MotoRide" (Moto), o "Delivery" (Paquetería).
2.  **Cotización Anticipada:** Precio fijo estimado antes de confirmar. Sin sorpresas.
3.  **Seguimiento en Vivo:**
    *   Ver al conductor acercarse en el mapa en tiempo real (actualización cada 2s).
    *   Datos del conductor visibles: Foto, Modelo del Auto, Patente y Estrellas.
4.  **Seguridad:** Botón de pánico y compartir viaje.

---

## 3. Diseño Conceptual (UI/UX)

**Estilo Visual:** "Futurismo Profesional"
*   **Paleta de Colores:**
    *   *Fondo:* `Negro Profundo (#0A0A0A)` y `Gris Carbón (#121212)` para modo oscuro (default).
    *   *Primario:* `Azul Eléctrico (#2563EB)` para acciones principales y rutas.
    *   *Acento:* `Blanco Puro (#FFFFFF)` para textos y `Verde Neón Suave` para ganancias/éxito.
*   **Tipografía:** *Inter* o *Roboto*. Limpia, legible y moderna.
*   **Interacciones:**
    *   *Glassmorphism:* Paneles flotantes con fondo semitransparente y desenfoque (blur) sobre el mapa.
    *   *Micro-animaciones:* El auto en el mapa no "salta", se desliza suavemente entre coordenadas. Los botones tienen feedback táctil visual.

**Pantallas Clave:**
1.  **Home (Mapa):** Mapa a pantalla completa. Barra de búsqueda flotante en la parte inferior.
2.  **Match Screen:** Animación de radar buscando conductor -> Tarjeta del conductor asignado apareciendo desde abajo.
3.  **Viaje en Curso:** Mapa con la ruta azul brillante. Panel inferior con tiempo restante y controles de seguridad.

---

## 4. Roadmap de Desarrollo

### Fase 1: Cimientos (Semanas 1-2)
*   Configuración del entorno (Next.js, Node.js, Base de Datos).
*   Integración básica de Mapas (Mapbox/Google).
*   Diseño de Base de Datos (Usuarios, Viajes, Geolocalización).

### Fase 2: Núcleo MVP (Semanas 3-5)
*   **Backend:** API de Websockets para tracking en tiempo real.
*   **Frontend:** Interfaz de registro y login.
*   **Core:** Flujo de solicitud de viaje (Cliente) -> Aceptación (Conductor).

### Fase 3: Funcionalidades Beta (Semanas 6-7)
*   Cálculo de tarifas y distancias.
*   Historial y Perfil.
*   Sistema de Calificaciones.
*   Panel Administrativo básico.

### Fase 4: Pulido y Lanzamiento (Semana 8)
*   Pruebas de campo en La Rioja (simulaciones).
*   Optimización de animaciones y rendimiento.
*   Despliegue en servidores de producción.

---

## 5. Enfoque Técnico para el MVP

Para lograr un rendimiento estilo "nativa" pero con la velocidad de desarrollo web, usaremos una arquitectura moderna:

**Frontend (La App):**
*   **Framework:** **Next.js (React)**. Permite crear una PWA (Progressive Web App) instalable en iOS y Android sin pasar por stores inicialmente.
*   **Estilos:** **CSS Moderno (Variables + Flexbox/Grid)** para un diseño pixel-perfect y ligero.
*   **Mapas:** **Mapbox GL JS**. Más performante y personalizable visualmente que Google Maps para el estilo "oscuro/futurista".
*   **Estado:** React Context + Zustand para manejo fluido de datos.

**Backend (El Cerebro):**
*   **Runtime:** **Node.js** con **Express** o **NestJS**.
*   **Real-time:** **Socket.io**. Vital para que el auto se mueva en la pantalla del cliente sin recargar (comunicación bidireccional < 100ms).
*   **Base de Datos:** **PostgreSQL** con extensión **PostGIS**. Es el estándar de oro para consultas geográficas ("buscar conductores en radio de 2km").

**Infraestructura:**
*   **Hosting:** Vercel (Frontend) + Render/Railway (Backend & DB).
*   **Auth:** JWT (JSON Web Tokens) para sesiones seguras.

---

### Próximos Pasos
¿Deseas que comience a configurar la estructura del proyecto con este stack técnico?
