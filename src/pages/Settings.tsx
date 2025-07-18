
import React, { useState, useEffect } from 'react';
import { Plan } from '@/types';
import { getPlans } from '@/services/mockApi';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export const SettingsPage: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            const data = await getPlans();
            setPlans(data);
            setLoading(false);
        };
        fetchPlans();
    }, []);

    const handleUpgrade = (planName: string) => {
        alert(`Simulando actualización al plan ${planName}. Serás redirigido a Stripe.`);
    }

    if (loading) return <div>Cargando planes...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Ajustes y Suscripción</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`flex flex-col ${user?.plan === plan.name ? 'border-2 border-sky-500' : ''}`}>
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-center">{plan.name}</h2>
                            <p className="text-4xl font-bold text-center mt-2">
                                {plan.price > 0 ? `$${plan.price}` : 'Gratis'}
                                {plan.price > 0 && <span className="text-lg font-normal text-slate-500">/mes</span>}
                            </p>
                        </div>
                        <div className="p-6 flex-grow">
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6">
                            {user?.plan === plan.name ? (
                                <Button className="w-full" disabled>Plan Actual</Button>
                            ) : (
                                <Button className="w-full" onClick={() => handleUpgrade(plan.name)}>
                                    {user?.plan === 'Gratis' || (user?.plan === 'Básico' && plan.name === 'Pro') ? 'Actualizar' : 'Elegir Plan'}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
