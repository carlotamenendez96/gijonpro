import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { confirmAppointmentByToken } from '../services/mockApi';
import { Appointment } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ConfirmationPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        const confirm = async () => {
            if (!token) {
                setError('No se ha proporcionado un código de confirmación.');
                setLoading(false);
                return;
            }

            try {
                const appointment = await confirmAppointmentByToken(token);
                setConfirmedAppointment(appointment);
            } catch (err: any) {
                setError(err.message || 'Ha ocurrido un error al confirmar la cita.');
            } finally {
                setLoading(false);
            }
        };

        confirm();
    }, [token]);

    const renderContent = () => {
        if (loading) {
            return <div className="text-center text-slate-600">Confirmando tu cita...</div>;
        }

        if (error) {
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error de Confirmación</h2>
                    <p className="text-slate-600">{error}</p>
                </div>
            );
        }

        if (confirmedAppointment) {
            return (
                 <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h1 className="text-2xl font-bold text-sky-600 mb-4">¡Cita Confirmada!</h1>
                    <p className="text-slate-600">
                        Gracias, <strong>{confirmedAppointment.clientName}</strong>.
                    </p>
                     <p className="mt-2 text-slate-600">
                        Tu cita para <strong>{confirmedAppointment.service}</strong> el día{' '}
                        <strong>{new Date(confirmedAppointment.start).toLocaleDateString('es-ES')}</strong> a las{' '}
                        <strong>{new Date(confirmedAppointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>{' '}
                        ha sido confirmada con éxito.
                    </p>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8">
                {renderContent()}
            </Card>
        </div>
    );
};