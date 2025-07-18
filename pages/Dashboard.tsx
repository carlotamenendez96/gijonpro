import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { getDashboardStats, getAppointments, getClients, addAppointment, updateAppointment, deleteAppointment } from '../services/mockApi';
import { Appointment, Client } from '../types';
import { UsersIcon, CalendarIcon, ChartBarIcon, PlusIcon } from '../components/Icons';
import { Button } from '../components/common/Button';
import { AppointmentFormModal } from '../components/AppointmentFormModal';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card className="p-4 flex items-center">
    <div className="p-3 mr-4 text-sky-500 bg-sky-100 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  </Card>
);

const Calendar: React.FC<{ appointments: Appointment[]; onDayClick: (date: Date) => void; }> = ({ appointments, onDayClick }) => {
    const [date, setDate] = useState(new Date());

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();
    
    const normalizedStartDay = startDay === 0 ? 6 : startDay - 1;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const prefixDays = Array.from({ length: normalizedStartDay }, (_, i) => null);

    return (
        <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold capitalize">{new Date(date).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                <div>
                    <Button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} variant="secondary" className="mr-2">{'<'}</Button>
                    <Button onClick={() => setDate(new Date())} variant="secondary" className="mr-2">Hoy</Button>
                    <Button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} variant="secondary">{'>'}</Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-slate-500 mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {prefixDays.map((_, i) => <div key={`empty-${i}`} className="border rounded-md border-slate-100 h-24"></div>)}
                {days.map(day => {
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
                    const dayAppointmentsCount = appointments.filter(a => new Date(a.start).toDateString() === currentDate.toDateString()).length;
                    const isToday = new Date().toDateString() === currentDate.toDateString();
                    return (
                        <div key={day} onClick={() => onDayClick(currentDate)} className="border rounded-md p-2 h-24 flex flex-col justify-start cursor-pointer hover:bg-slate-50 transition-colors">
                           <span className={`self-end font-medium ${isToday ? 'bg-sky-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-slate-600'}`}>{day}</span>
                           {dayAppointmentsCount > 0 && <span className="text-xs bg-sky-100 text-sky-700 rounded px-1.5 py-0.5 mt-1 self-start font-medium">{dayAppointmentsCount} cita(s)</span>}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

const getStatusPill = (status: Appointment['status']) => {
    const styles = {
        pending_confirmation: 'bg-yellow-100 text-yellow-800',
        confirmation_sent: 'bg-blue-100 text-blue-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    const text = {
        pending_confirmation: 'Pendiente',
        confirmation_sent: 'Enviada',
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
    };
    return <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const getCardStatusStyles = (status: Appointment['status']) => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-50 border-l-4 border-green-500';
        case 'cancelled':
            return 'bg-red-50 border-l-4 border-red-500';
        case 'pending_confirmation':
        case 'confirmation_sent':
            return 'bg-blue-50 border-l-4 border-blue-500';
        default:
            return 'bg-slate-50 border-l-4 border-slate-500';
    }
};


export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState({ upcomingAppointments: 0, newClientsThisMonth: 0, occupancyRate: 0 });
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<string | null>(null);

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsData, appointmentsData, clientsData] = await Promise.all([
                getDashboardStats(),
                getAppointments(),
                getClients(),
            ]);
            setStats(statsData);
            setAppointments(appointmentsData);
            setClients(clientsData.data);
        } catch (error) {
            console.error("Error fetching page data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);
    
    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setEditingAppointment(null);
    };
    
    const handleSaveSuccess = async () => {
        handleCloseForm();
        await fetchPageData();
        if (isDetailsModalOpen) {
            setIsDetailsModalOpen(false);
            setViewingAppointment(null);
        }
    };

    const handleDeleteAppointment = (id: string) => {
        setAppointmentToDeleteId(id);
        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!appointmentToDeleteId) return;
        try {
            await deleteAppointment(appointmentToDeleteId);
            await fetchPageData();
            setIsConfirmModalOpen(false);
            setAppointmentToDeleteId(null);
            // Also close other modals that might be open for this appointment
            if (isDetailsModalOpen) setIsDetailsModalOpen(false);
            if (isDailyModalOpen) setIsDailyModalOpen(false);
        } catch (error) {
            console.error("Fallo al eliminar la cita", error);
            alert("Error al eliminar la cita.");
        }
    };

    const handleOpenFormForNew = (date: Date) => {
        setEditingAppointment(null);
        setSelectedDate(date);
        setIsDailyModalOpen(false);
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleOpenFormForEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setSelectedDate(new Date(appointment.start));
        setIsDailyModalOpen(false);
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleCalendarDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsDailyModalOpen(true);
    };

    const handleViewDetails = (appointment: Appointment) => {
        setViewingAppointment(appointment);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsModalOpen(false);
        setViewingAppointment(null);
    };
    
    const today = new Date();
    const todaysAppointments = appointments
        .filter(a => new Date(a.start).toDateString() === today.toDateString())
        .sort((a,b) => a.start.getTime() - b.start.getTime());
    
    const selectedDayAppointments = appointments
        .filter(a => selectedDate && new Date(a.start).toDateString() === selectedDate.toDateString())
        .sort((a,b) => a.start.getTime() - b.start.getTime());

    const workDayStartHour = 8;
    const workDayEndHour = 20;
    const workHours = Array.from({ length: workDayEndHour - workDayStartHour }, (_, i) => i + workDayStartHour);
    const hourHeight = 80;

    const layoutAppointments = useMemo(() => {
        const appointmentsWithLayout: (Appointment & { layout: { column: number; totalColumns: number }})[] = [];
        const sortedApps = [...todaysAppointments].sort((a, b) => a.start.getTime() - b.start.getTime());
    
        const groups: Appointment[][] = [];
        if (sortedApps.length > 0) {
            let currentGroup = [sortedApps[0]];
            let groupEndTime = sortedApps[0].end.getTime();
    
            for (let i = 1; i < sortedApps.length; i++) {
                const app = sortedApps[i];
                if (app.start.getTime() < groupEndTime) {
                    currentGroup.push(app);
                    if (app.end.getTime() > groupEndTime) {
                        groupEndTime = app.end.getTime();
                    }
                } else {
                    groups.push(currentGroup);
                    currentGroup = [app];
                    groupEndTime = app.end.getTime();
                }
            }
            groups.push(currentGroup);
        }
        
        for (const group of groups) {
            const columns: Appointment[][] = [];
            group.sort((a, b) => a.start.getTime() - b.start.getTime());
            for (const app of group) {
                let placed = false;
                for (const column of columns) {
                    if (column.length === 0 || column[column.length - 1].end.getTime() <= app.start.getTime()) {
                        column.push(app);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    columns.push([app]);
                }
            }
            
            const totalColumns = columns.length;
            for (let i = 0; i < columns.length; i++) {
                for (const app of columns[i]) {
                    const existing = appointmentsWithLayout.find(a => a.id === app.id);
                    if(!existing) {
                         appointmentsWithLayout.push({
                            ...app,
                            layout: { column: i, totalColumns: totalColumns }
                        });
                    }
                }
            }
        }
        
        return appointmentsWithLayout;
    }, [todaysAppointments]);

    if (loading) return <div className="text-center p-8">Cargando dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard title="Próximas Citas" value={stats.upcomingAppointments} icon={<CalendarIcon className="w-6 h-6"/>} />
                <StatCard title="Nuevos Clientes (Mes)" value={stats.newClientsThisMonth} icon={<UsersIcon className="w-6 h-6"/>} />
                <StatCard title="Tasa de Ocupación" value={`${stats.occupancyRate}%`} icon={<ChartBarIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                <div className="lg:col-span-2">
                     <Card className="h-full">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Agenda de Hoy</h2>
                            <Button onClick={() => handleOpenFormForNew(new Date())} size="sm">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Añadir Cita
                            </Button>
                        </div>
                        <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)'}}>
                            {todaysAppointments.length === 0 ? (
                                <p className="text-slate-500 text-center py-16">No hay citas programadas para hoy.</p>
                            ) : (
                                <div className="flex">
                                    <div className="w-16 flex-shrink-0">
                                        {workHours.map(hour => (
                                            <div key={hour} className="h-full relative" style={{ height: `${hourHeight}px` }}>
                                                <div className="text-right pr-2 absolute -top-2.5">
                                                    <span className="text-xs text-slate-400 font-mono">{String(hour).padStart(2, '0')}:00</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative flex-1">
                                        {workHours.map(hour => (
                                            <div key={`line-${hour}`} className="absolute w-full border-t border-slate-200" style={{ top: `${(hour - workDayStartHour) * hourHeight}px`, zIndex: 1 }}></div>
                                        ))}
                                        {layoutAppointments.map(app => {
                                            const startOffsetMinutes = (app.start.getHours() * 60 + app.start.getMinutes()) - (workDayStartHour * 60);
                                            if (startOffsetMinutes < 0) return null;

                                            const topPx = (startOffsetMinutes / 60) * hourHeight;
                                            const heightPx = (app.estimatedDuration / 60) * hourHeight;

                                            const widthPercent = 100 / app.layout.totalColumns;
                                            const leftPercent = app.layout.column * widthPercent;

                                            const style = {
                                                top: `${topPx}px`,
                                                height: `${heightPx}px`,
                                                left: `${leftPercent}%`,
                                                width: `calc(${widthPercent}% - 4px)`,
                                                marginLeft: '2px'
                                            };
                                            
                                            const cardStatusStyles = getCardStatusStyles(app.status);

                                            return (
                                                <div
                                                    key={app.id}
                                                    style={style}
                                                    className="absolute p-0.5 z-10 group cursor-pointer"
                                                    onClick={() => handleViewDetails(app)}
                                                >
                                                    <div className={`${cardStatusStyles} rounded-md h-full p-2 flex justify-between items-start shadow-md hover:shadow-lg hover:z-20 transition-all duration-200 overflow-hidden text-clip`}>
                                                        <div className="flex-1 overflow-hidden pr-1">
                                                            <p className="font-semibold text-sm text-slate-800 truncate">{app.clientName}</p>
                                                            <p className="text-xs text-slate-600 truncate">{app.service}</p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-xs font-semibold text-slate-700">{app.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            <p className="text-xs text-slate-500">({app.estimatedDuration} min)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Calendar 
                        appointments={appointments} 
                        onDayClick={handleCalendarDayClick}
                    />
                </div>
            </div>

            <Modal isOpen={isDailyModalOpen} onClose={() => setIsDailyModalOpen(false)} title={`Citas del ${selectedDate?.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long' })}`}>
                {selectedDayAppointments.length > 0 ? (
                    <ul className="space-y-3">
                    {selectedDayAppointments.map(app => (
                        <li key={app.id} className="py-2 border-b flex justify-between items-center gap-4">
                            <div>
                                <p className="font-semibold">{app.clientName} - <span className="font-normal text-slate-600">{app.service}</span></p>
                                <p className="text-sm text-slate-500">{new Date(app.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(app.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {getStatusPill(app.status)}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <Button size="sm" variant="secondary" onClick={() => handleOpenFormForEdit(app)}>Editar</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteAppointment(app.id)}>Borrar</Button>
                            </div>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-center py-4">No hay citas para este día.</p>
                )}
                 <div className="mt-6 flex justify-end">
                    <Button onClick={() => handleOpenFormForNew(selectedDate!)}>
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Añadir Cita
                    </Button>
                </div>
            </Modal>
            
            <Modal isOpen={isDetailsModalOpen} onClose={handleCloseDetails} title="Detalles de la Cita">
                {viewingAppointment && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-800">{viewingAppointment.clientName}</h3>
                            <p className="text-md text-slate-600">{viewingAppointment.service}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                            <div>
                                <p className="font-medium text-slate-500">Fecha</p>
                                <p className="text-slate-800">{new Date(viewingAppointment.start).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-500">Hora</p>
                                <p className="text-slate-800">{new Date(viewingAppointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(viewingAppointment.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-500">Duración</p>
                                <p className="text-slate-800">{viewingAppointment.estimatedDuration} minutos</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-500">Estado</p>
                                <div>{getStatusPill(viewingAppointment.status)}</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                            <Button variant="secondary" onClick={() => { handleOpenFormForEdit(viewingAppointment); }}>Editar</Button>
                            <Button variant="danger" onClick={() => handleDeleteAppointment(viewingAppointment.id)}>Borrar</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {isFormModalOpen && (
                <AppointmentFormModal
                    isOpen={isFormModalOpen}
                    onClose={handleCloseForm}
                    onSaveSuccess={handleSaveSuccess}
                    clients={clients}
                    appointmentToEdit={editingAppointment}
                    initialDate={selectedDate!}
                    addAppointment={addAppointment}
                    updateAppointment={updateAppointment}
                />
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
            >
                <p>¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.</p>
            </ConfirmationModal>
        </div>
    );
};