
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ClientsPage } from './pages/Clients';
import { MarketingPage } from './pages/Marketing';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { BookingPage } from './pages/Booking';
import { ConfirmationPage } from './pages/ConfirmationPage';

// Un componente de layout para proteger las rutas autenticadas.
// Comprueba si el usuario está autenticado. Si no, redirige a la página de login.
// Si está autenticado, renderiza el layout principal del dashboard, que a su vez
// renderizará la página correspondiente a través de su <Outlet>.
const ProtectedLayout: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout />;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Rutas públicas accesibles para todos */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/confirm/:token" element={<ConfirmationPage />} />

            {/* Rutas protegidas que requieren autenticación */}
            {/* Todas las rutas anidadas aquí usarán el ProtectedLayout */}
            <Route element={<ProtectedLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/marketing" element={<MarketingPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Una ruta de fallback global. Si ninguna ruta anterior coincide, redirige al inicio. */}
            {/* Esto es más seguro y maneja tanto rutas desconocidas como intentos de acceso directo
                a páginas protegidas (que serán redirigidos a /login por el ProtectedLayout). */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
