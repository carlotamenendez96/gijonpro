
import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const BookingPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const availableTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-sky-600 mb-4">¡Reserva Confirmada!</h1>
                    <p className="text-slate-600">Gracias, {name}. Hemos recibido tu reserva para un {service} el {date} a las {time}.</p>
                    <p className="mt-2 text-slate-600">Recibirás un email de confirmación en {email}.</p>
                    <Button onClick={() => window.location.reload()} className="mt-6">Hacer otra reserva</Button>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8">
                <h1 className="text-2xl font-bold text-center text-sky-600 mb-6">Reservar una Cita</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div>
                            <h2 className="font-semibold mb-3">1. Elige un servicio</h2>
                            <select value={service} onChange={e => setService(e.target.value)} required className="w-full p-2 border bg-white rounded-md">
                                <option value="" disabled>Selecciona un servicio</option>
                                <option value="Corte y Peinado">Corte y Peinado</option>
                                <option value="Tinte">Tinte</option>
                                <option value="Asesoramiento">Asesoramiento</option>
                            </select>
                            <Button onClick={() => setStep(2)} disabled={!service} className="w-full mt-4">Siguiente</Button>
                        </div>
                    )}
                    {step === 2 && (
                         <div>
                            <h2 className="font-semibold mb-3">2. Elige fecha y hora</h2>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded-md mb-3" />
                            <div className="grid grid-cols-3 gap-2">
                                {availableTimes.map(t => (
                                    <button type="button" key={t} onClick={() => setTime(t)} className={`p-2 rounded-md text-center ${time === t ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4">
                               <Button onClick={() => setStep(1)} variant="secondary">Anterior</Button>
                               <Button onClick={() => setStep(3)} disabled={!date || !time}>Siguiente</Button>
                            </div>
                        </div>
                    )}
                     {step === 3 && (
                         <div>
                            <h2 className="font-semibold mb-3">3. Tus datos</h2>
                            <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded-md mb-3" />
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded-md" />
                             <div className="flex justify-between mt-4">
                               <Button onClick={() => setStep(2)} variant="secondary">Anterior</Button>
                               <Button type="submit" disabled={!name || !email}>Confirmar Reserva</Button>
                            </div>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
};
