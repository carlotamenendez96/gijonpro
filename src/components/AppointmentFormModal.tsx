
import React, { useState, useEffect } from 'react';
import { Appointment, Client } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface AppointmentFormProps {
    onSave: (data: Partial<Appointment>) => void;
    onCancel: () => void;
    clients: Client[];
    appointment?: Appointment | null;
    initialDate?: Date;
    fixedClient?: Client;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSave, onCancel, clients, appointment, initialDate, fixedClient }) => {
    const [clientId, setClientId] = useState(fixedClient?.id || appointment?.clientId || (clients.length > 0 ? clients[0].id : ''));
    const [service, setService] = useState(appointment?.service || '');
    const [estimatedDuration, setEstimatedDuration] = useState(appointment?.estimatedDuration || 60);

    const getInitialTime = () => {
        if (appointment?.start) return new Date(appointment.start).toTimeString().substring(0, 5);
        return '09:00';
    };
    const [time, setTime] = useState(getInitialTime());
    
    const getInitialDate = () => {
        const dateToUse = appointment?.start || initialDate || new Date();
        const yyyy = dateToUse.getFullYear();
        const mm = String(dateToUse.getMonth() + 1).padStart(2, '0');
        const dd = String(dateToUse.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const [date, setDate] = useState(getInitialDate());

    const [status, setStatus] = useState<Appointment['status']>(appointment?.status || 'pending_confirmation');

    const isEditing = !!appointment;

    useEffect(() => {
        if (fixedClient) {
            setClientId(fixedClient.id);
        }
    }, [fixedClient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [hours, minutes] = time.split(':').map(Number);
        
        const start = new Date(date);
        start.setHours(hours, minutes, 0, 0);

        const client = clients.find(c => c.id === clientId);
        if (!client) {
            alert("Por favor, selecciona un cliente.");
            return;
        }

        const appointmentData: Partial<Appointment> = {
            clientId,
            clientName: client.name,
            service,
            start,
            estimatedDuration,
            status: isEditing ? status : 'pending_confirmation',
        };

        if (appointment?.id) {
            appointmentData.id = appointment.id;
        }

        onSave(appointmentData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fixedClient ? (
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Cliente</label>
                    <input type="text" value={fixedClient.name} disabled className="w-full p-2 border rounded bg-slate-100 mt-1"/>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-slate-700">Cliente</label>
                    <select value={clientId} onChange={e => setClientId(e.target.value)} required className="w-full p-2 border rounded bg-white mt-1">
                        <option value="" disabled>Selecciona un cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700">Servicio</label>
                <input type="text" placeholder="Ej: Corte y Peinado" value={service} onChange={e => setService(e.target.value)} required className="w-full p-2 border rounded mt-1"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded mt-1"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Hora</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-2 border rounded mt-1"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Duración (minutos)</label>
                <input 
                    type="number" 
                    value={estimatedDuration} 
                    onChange={e => setEstimatedDuration(Number(e.target.value))} 
                    required 
                    min="15" 
                    step="5"
                    className="w-full p-2 border rounded mt-1"
                />
            </div>
            {isEditing && (
                <div>
                    <label className="block text-sm font-medium text-slate-700">Estado</label>
                    <select value={status} onChange={e => setStatus(e.target.value as Appointment['status'])} required className="w-full p-2 border rounded bg-white mt-1">
                        <option value="pending_confirmation">Pendiente de Confirmación</option>
                        <option value="confirmation_sent">Confirmación Enviada</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Cita</Button>
            </div>
        </form>
    );
};


interface AppointmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    clients: Client[];
    appointmentToEdit?: Appointment | null;
    initialDate?: Date;
    fixedClient?: Client;
    addAppointment: (data: Omit<Appointment, 'id' | 'status' | 'end' | 'confirmationToken'>) => Promise<any>;
    updateAppointment: (id: string, data: Partial<Appointment>) => Promise<any>;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
    isOpen,
    onClose,
    onSaveSuccess,
    clients,
    appointmentToEdit,
    initialDate,
    fixedClient,
    addAppointment,
    updateAppointment,
}) => {
    const handleSave = async (data: Partial<Appointment>) => {
        try {
            if (appointmentToEdit) {
                await updateAppointment(appointmentToEdit.id, data);
            } else {
                await addAppointment(data as Omit<Appointment, 'id' | 'status' | 'end' | 'confirmationToken'>);
            }
            onSaveSuccess();
        } catch (error) {
            console.error("Fallo al guardar la cita", error);
            alert("Error al guardar la cita.");
        }
    };
    
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={appointmentToEdit ? 'Editar Cita' : (fixedClient ? `Nueva cita para ${fixedClient.name}` : 'Nueva Cita')}>
            <AppointmentForm
                clients={clients}
                appointment={appointmentToEdit}
                initialDate={initialDate}
                fixedClient={fixedClient}
                onSave={handleSave}
                onCancel={onClose}
            />
        </Modal>
    );
};
