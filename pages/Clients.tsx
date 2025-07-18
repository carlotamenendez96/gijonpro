import React, { useState, useEffect, useCallback } from 'react';
import { getClients, addClient, getClientById, getAppointmentsByClientId, addAppointment, updateAppointment, deleteAppointment, getSegments } from '../services/mockApi';
import { Client, Appointment } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PlusIcon } from '../components/Icons';
import { AppointmentFormModal } from '../components/AppointmentFormModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Pagination } from '../components/common/Pagination';

const ITEMS_PER_PAGE = 5; // Low for demo. Can be set to 20.

const ClientForm: React.FC<{ 
    onSave: (client: Omit<Client, 'id' | 'createdAt'>) => void; 
    onCancel: () => void;
    segments: string[];
}> = ({ onSave, onCancel, segments }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    const handleTagChange = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, phone, tags: selectedTags, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded"/>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded"/>
            <input type="tel" placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded"/>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Etiquetas</label>
                {segments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2">
                        {segments.map(segment => (
                            <label key={segment} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    checked={selectedTags.includes(segment)}
                                    onChange={() => handleTagChange(segment)}
                                />
                                <span className="text-sm text-slate-700 capitalize">{segment}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md text-center">
                        No hay segmentos definidos. <br/>
                        Puedes crearlos en la página de <span className="font-semibold">Marketing</span>.
                    </div>
                )}
            </div>

            <textarea placeholder="Notas" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded"></textarea>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Cliente</Button>
            </div>
        </form>
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
        pending_confirmation: 'Pendiente Conf.',
        confirmation_sent: 'Conf. Enviada',
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
    };
    return <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${styles[status]}`}>{text[status]}</span>;
};


export const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [segments, setSegments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
    const [detailsTab, setDetailsTab] = useState<'details' | 'appointments'>('details');
    
    const [isApptFormOpen, setIsApptFormOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalClients, setTotalClients] = useState(0);

    const fetchClientsData = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const clientsResponse = await getClients(page, ITEMS_PER_PAGE, search);
            setClients(clientsResponse.data);
            setTotalPages(Math.ceil(clientsResponse.total / ITEMS_PER_PAGE));
            setTotalClients(clientsResponse.total);
            setCurrentPage(page);
        } catch (error) {
            console.error("Fallo al obtener los clientes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchSegmentsData = async () => {
            const segmentsData = await getSegments();
            setSegments(segmentsData);
        };
        fetchSegmentsData();
        fetchClientsData(1, '');
    }, [fetchClientsData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchQuery = e.target.value;
        setSearchQuery(newSearchQuery);
        fetchClientsData(1, newSearchQuery);
    };

    const handlePageChange = (page: number) => {
        fetchClientsData(page, searchQuery);
    };
    
    const refreshClientAppointments = async () => {
        if (selectedClient) {
            const appointments = await getAppointmentsByClientId(selectedClient.id);
            setClientAppointments(appointments.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()));
        }
    };

    const handleSaveClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
        try {
            await addClient(clientData);
            setIsAddModalOpen(false);
            fetchClientsData(1, '');
        } catch (error) {
            console.error("Fallo al guardar cliente:", error);
            alert("Error al guardar el cliente.");
        }
    };

    const handleViewDetails = async (clientId: string) => {
        setDetailsTab('details');
        const client = await getClientById(clientId);
        setSelectedClient(client || null);
        if (client) {
            const appointments = await getAppointmentsByClientId(client.id);
            setClientAppointments(appointments.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()));
        }
        setIsDetailsModalOpen(true);
    };
    
    const handleAddAppointment = () => {
        setEditingAppointment(null);
        setIsApptFormOpen(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setIsApptFormOpen(true);
    };

    const handleDeleteAppointment = (appointmentId: string) => {
        setAppointmentToDeleteId(appointmentId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!appointmentToDeleteId) return;
        try {
            await deleteAppointment(appointmentToDeleteId);
            refreshClientAppointments();
        } catch (error) {
            console.error("Fallo al eliminar cita:", error);
            alert("Error al eliminar la cita.");
        } finally {
            setIsConfirmModalOpen(false);
            setAppointmentToDeleteId(null);
        }
    };
    
    const handleSaveAppointmentSuccess = () => {
        setIsApptFormOpen(false);
        setEditingAppointment(null);
        refreshClientAppointments();
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Añadir Cliente
                </Button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o etiqueta..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full max-w-sm p-2 border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                />
            </div>
            
            <Card>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Contacto</th>
                                <th scope="col" className="px-6 py-3">Etiquetas</th>
                                <th scope="col" className="px-6 py-3">Miembro Desde</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">Cargando clientes...</td></tr>
                            )}
                            {!loading && clients.map(client => (
                                <tr key={client.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                                    <td className="px-6 py-4">
                                        <div>{client.email}</div>
                                        <div className="text-slate-400">{client.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {client.tags.map(tag => (
                                                <span key={tag} className="bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(client.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(client.id)}>Ver Detalles</Button>
                                    </td>
                                </tr>
                            ))}
                             {clients.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-500">
                                        No se encontraron clientes que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalClients}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                    />
                </div>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Añadir Nuevo Cliente">
                <ClientForm 
                    onSave={handleSaveClient} 
                    onCancel={() => setIsAddModalOpen(false)} 
                    segments={segments}
                />
            </Modal>

            {selectedClient && (
                 <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Detalles de ${selectedClient.name}`}>
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setDetailsTab('details')} className={`py-3 px-1 border-b-2 font-medium text-sm ${detailsTab === 'details' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                                Detalles
                            </button>
                            <button onClick={() => setDetailsTab('appointments')} className={`py-3 px-1 border-b-2 font-medium text-sm ${detailsTab === 'appointments' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                                Citas
                            </button>
                        </nav>
                    </div>

                    {detailsTab === 'details' && (
                        <div className="py-4 space-y-4">
                            <div><strong>Email:</strong> {selectedClient.email}</div>
                            <div><strong>Teléfono:</strong> {selectedClient.phone}</div>
                            <div><strong>Miembro desde:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</div>
                            <div>
                                <strong>Etiquetas:</strong> 
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedClient.tags.length > 0 ? selectedClient.tags.map(tag => (
                                        <span key={tag} className="bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">{tag}</span>
                                    )) : <span className="text-slate-500 text-sm">Sin etiquetas</span>}
                                </div>
                            </div>
                            <div>
                                <strong>Notas:</strong>
                                <p className="mt-1 text-slate-600 p-2 bg-slate-50 rounded-md border">{selectedClient.notes || 'No hay notas.'}</p>
                            </div>
                        </div>
                    )}
                    {detailsTab === 'appointments' && (
                        <div className="py-4">
                            <Button onClick={handleAddAppointment} className="mb-4">
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Añadir Cita
                            </Button>
                            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {clientAppointments.length > 0 ? clientAppointments.map(app => (
                                    <li key={app.id} className="py-2 border-b flex justify-between items-center gap-4">
                                        <div>
                                            <p className="font-semibold">{app.service} - <span className="font-normal text-slate-600">{new Date(app.start).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric'})}</span></p>
                                            <p className="text-sm text-slate-500">{new Date(app.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {getStatusPill(app.status)}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button size="sm" variant="secondary" onClick={() => handleEditAppointment(app)}>Editar</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteAppointment(app.id)}>Borrar</Button>
                                        </div>
                                    </li>
                                )) : <p className="text-slate-500 text-center py-4">Este cliente no tiene citas.</p>}
                            </ul>
                        </div>
                    )}
                 </Modal>
            )}

            {isApptFormOpen && selectedClient && (
                <AppointmentFormModal
                    isOpen={isApptFormOpen}
                    onClose={() => { setIsApptFormOpen(false); setEditingAppointment(null); }}
                    onSaveSuccess={handleSaveAppointmentSuccess}
                    clients={[selectedClient]}
                    appointmentToEdit={editingAppointment}
                    fixedClient={selectedClient}
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