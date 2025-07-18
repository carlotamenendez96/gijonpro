
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, UsersIcon, ChartBarIcon, MegaphoneIcon, CogIcon, LogoutIcon } from './Icons';
import { Button } from './common/Button';
import { triggerConfirmationReminders } from '../services/mockApi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: CalendarIcon },
  { name: 'Clientes', href: '/clients', icon: UsersIcon },
  { name: 'Marketing', href: '/marketing', icon: MegaphoneIcon },
  { name: 'Informes', href: '/reports', icon: ChartBarIcon },
  { name: 'Ajustes', href: '/settings', icon: CogIcon },
];

const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <div className="flex flex-col w-64 bg-white border-r border-slate-200">
            <div className="flex items-center justify-center h-16 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-sky-600">GijónPro</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                ? 'bg-sky-100 text-sky-700'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [isChecking, setIsChecking] = useState(false);
    
    const handleCheckReminders = async () => {
        setIsChecking(true);
        const count = await triggerConfirmationReminders();
        alert(`${count} recordatorios de confirmación enviados. Revisa la consola para ver los detalles.`);
        setIsChecking(false);
        // In a real app, you might want a more subtle notification
        // and a way to refresh the dashboard data.
    };

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
            <div className="flex items-center gap-8">
                 <div>
                    <h2 className="text-xl font-semibold">Bienvenido, {user?.name.split(' ')[0]}</h2>
                    <p className="text-sm text-slate-500">{user?.businessName}</p>
                 </div>
                 <Button onClick={handleCheckReminders} variant="secondary" isLoading={isChecking}>
                    {isChecking ? 'Buscando...' : 'Buscar Recordatorios'}
                 </Button>
            </div>
            <button onClick={logout} className="flex items-center text-slate-600 hover:text-sky-600 transition-colors">
                <LogoutIcon className="w-6 h-6 mr-2" />
                Cerrar Sesión
            </button>
        </header>
    );
};

export const DashboardLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                    <div className="container px-6 py-8 mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};