
# Gijón ProManager

**Gijón ProManager** es una aplicación web SaaS (Software as a Service) diseñada para ayudar a pequeños negocios locales a gestionar sus citas, clientes y comunicación de marketing de manera eficiente. La aplicación está construida como un prototipo frontend completamente funcional, con un backend simulado para demostrar toda la lógica de negocio.

## ✨ Características Principales

*   **Dashboard Interactivo**: Vista principal con estadísticas clave y una **agenda visual por horas** para las citas del día, que permite la gestión rápida (crear, ver detalles, editar, eliminar) con un solo clic.
*   **Gestión de Citas Completa**:
    *   Calendario mensual para una visión general.
    *   Flujo de confirmación de citas automatizado por SMS (simulado).
    *   Los clientes pueden confirmar su cita a través de una página pública.
*   **Base de Datos de Clientes (CRM)**:
    *   Listado de clientes con **búsqueda** y **paginación**.
    *   Ficha de cliente con historial de citas y notas.
    *   Segmentación por etiquetas personalizables.
*   **Marketing y Comunicación**:
    *   **Campañas**: Creación de campañas de marketing por Email o SMS dirigidas a segmentos específicos.
    *   **Segmentos**: Gestión centralizada para crear y eliminar segmentos de clientes (ej. "VIP", "Nuevo").
    *   **Automatización**: Creación de **reglas de recordatorio automático** para servicios recurrentes (ej. recordar un Tinte cada 30 días).
*   **Informes y Estadísticas**:
    *   Gráficos dinámicos para analizar la tasa de ocupación, estado de las citas y rendimiento de campañas.
    *   **Filtro por rango de fechas** (última semana, último mes, último año, etc.) para un análisis personalizado.
*   **Ajustes y Planes**: Vista de planes de suscripción (Gratis, Básico, Pro) para demostrar el modelo SaaS.
*   **Página de Reserva Pública**: Un widget de reserva simple para que los clientes puedan agendar citas.
*   **Autenticación**: Sistema de login para proteger el acceso al panel de gestión.

## 🚀 Stack Tecnológico

*   **Frontend**:
    *   **React** (con TypeScript): Biblioteca principal para construir la interfaz de usuario.
    *   **Vite**: Herramienta de construcción y servidor de desarrollo local de alta velocidad.
    *   **Tailwind CSS**: Para un diseño moderno y *utility-first*.
    *   **React Router**: Para la gestión de rutas en la aplicación.
    *   **Recharts**: Para la creación de gráficos interactivos en la sección de informes.

*   **Backend y Base de Datos (Simulados)**:
    *   Toda la lógica del backend y la persistencia de datos están **simuladas en el frontend** dentro del archivo `src/services/mockApi.ts`. Esto permite que la aplicación sea completamente interactiva sin necesidad de un servidor real.

## 🚀 Cómo Empezar

Este proyecto utiliza un entorno de desarrollo moderno basado en Node.js y Vite. Necesitarás tener Node.js (versión 18 o superior) y npm instalados en tu sistema.

### 1. Instalación

Clona el repositorio o descarga los archivos en tu máquina local. Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando para instalar todas las dependencias:

```bash
npm install
```

### 2. Ejecutar en Modo Desarrollo

Una vez instaladas las dependencias, puedes iniciar el servidor de desarrollo local con el siguiente comando:

```bash
npm run dev
```

Esto levantará la aplicación en un puerto local (normalmente `http://localhost:5173`) y se recargará automáticamente cada vez que hagas cambios en el código.

### 3. Construir para Producción

Cuando estés listo para desplegar la aplicación, puedes crear una versión optimizada para producción con el siguiente comando:

```bash
npm run build
```

Esto generará una carpeta `dist/` en la raíz del proyecto con todos los archivos estáticos optimizados, listos para ser subidos a cualquier servicio de hosting (como Vercel, Netlify, etc.).

## 📁 Estructura del Proyecto

El código está organizado de manera modular para facilitar su mantenimiento y escalabilidad:

```
/
├── public/               # Archivos estáticos
├── src/                  # Código fuente de la aplicación
│   ├── components/       # Componentes de React
│   ├── context/          # Contextos de React (ej. Auth)
│   ├── pages/            # Componentes de página (rutas)
│   ├── services/         # Lógica simulada de API
│   ├── types.ts          # Definiciones de TypeScript
│   ├── App.tsx           # Componente raíz y rutas
│   └── index.tsx         # Punto de entrada de React
├── .gitignore
├── index.html            # Plantilla HTML principal
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración de Tailwind CSS
├── tsconfig.json         # Configuración de TypeScript
└── vite.config.ts        # Configuración de Vite
```

## ⚙️ Cómo Funciona (Decisiones de Arquitectura)

### Backend Simulado (`src/services/mockApi.ts`)

Para demostrar una experiencia de usuario completa, este proyecto utiliza un "backend en el frontend". El archivo `src/services/mockApi.ts` contiene:
*   **Datos de ejemplo**: Arrays que actúan como tablas de una base de datos (clientes, citas, etc.).
*   **Funciones asíncronas**: Funciones como `getClients()`, `addAppointment()`, etc., que simulan llamadas a una API REST, incluyendo retardos artificiales (`simulateDelay`) para imitar la latencia de red.
*   **Lógica de negocio**: Toda la lógica (filtrado, paginación, creación de tokens) se realiza aquí. En un proyecto real, esto residiría en un servidor Node.js/Express.

### Simulación de Tareas Programadas (Cron Jobs)

Funcionalidades que normalmente requerirían tareas programadas en el backend (cron jobs) se han simulado mediante botones en la interfaz:
*   **Buscar Recordatorios**: En la cabecera del dashboard, este botón ejecuta la lógica para enviar recordatorios de confirmación de citas próximas.
*   **Revisar Recordatorios de Servicios**: En la pestaña de Automatización, este botón ejecuta la lógica de las reglas personalizadas para recordar a los clientes sobre sus servicios recurrentes.

En un entorno de producción, estas funciones serían ejecutadas automáticamente por un servidor a intervalos regulares.

---

**Credenciales de Acceso para el Demo:**
*   **Email**: `admin@gijonpro.com`
*   **Contraseña**: `password`

