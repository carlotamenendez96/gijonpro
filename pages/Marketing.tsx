import React, { useState, useEffect, useCallback } from 'react';
import { Campaign, ReminderRule } from '../types';
import { getCampaigns, sendCampaign, getSegments, addSegment, deleteSegment, getReminderRules, addReminderRule, deleteReminderRule, triggerServiceReminders } from '../services/mockApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MegaphoneIcon, XIcon, PlusIcon } from '../components/Icons';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Pagination } from '../components/common/Pagination';

const ITEMS_PER_PAGE = 5; // Low for demo. Can be set to 20.

const AutomationView: React.FC<{
    segments: string[];
    refreshSegments: () => void;
}> = ({ segments, refreshSegments }) => {
    const [rules, setRules] = useState<ReminderRule[]>([]);
    const [loadingRules, setLoadingRules] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    // Form state
    const [newRuleService, setNewRuleService] = useState('');
    const [newRuleFrequency, setNewRuleFrequency] = useState(30);
    const [newRuleTemplate, setNewRuleTemplate] = useState('Hola {clientName}, te recordamos que pronto te toca tu servicio de {serviceName}. ¡Pide cita!');

    // Modal state
    const [isConfirmDeleteRuleOpen, setIsConfirmDeleteRuleOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<ReminderRule | null>(null);

    const fetchRules = useCallback(async () => {
        setLoadingRules(true);
        const rulesData = await getReminderRules();
        setRules(rulesData);
        setLoadingRules(false);
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRuleService || !newRuleFrequency) {
            alert("Por favor, completa el nombre del servicio y la frecuencia.");
            return;
        }
        try {
            await addReminderRule({ serviceName: newRuleService, frequencyDays: newRuleFrequency, messageTemplate: newRuleTemplate });
            setNewRuleService('');
            setNewRuleFrequency(30);
            await fetchRules();
        } catch (error) {
            console.error("Failed to add rule:", error);
            alert("Error al añadir la regla.");
        }
    };

    const handleDeleteRule = (rule: ReminderRule) => {
        setRuleToDelete(rule);
        setIsConfirmDeleteRuleOpen(true);
    };

    const handleConfirmDeleteRule = async () => {
        if (!ruleToDelete) return;
        try {
            await deleteReminderRule(ruleToDelete.id);
            await fetchRules();
        } catch (error) {
            console.error("Failed to delete rule:", error);
            alert("Error al eliminar la regla.");
        } finally {
            setIsConfirmDeleteRuleOpen(false);
            setRuleToDelete(null);
        }
    };
    
    const handleCheckServiceReminders = async () => {
        setIsChecking(true);
        const count = await triggerServiceReminders();
        alert(`${count} recordatorios de servicio enviados. Revisa la consola para ver los detalles.`);
        setIsChecking(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Nueva Regla de Automatización</h2>
                    <form onSubmit={handleAddRule} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nombre del Servicio</label>
                            <input type="text" placeholder="Ej: Tinte" value={newRuleService} onChange={e => setNewRuleService(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
                            <p className="text-xs text-slate-500 mt-1">Debe coincidir exactamente con el nombre del servicio en las citas.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Recordar cada (días)</label>
                            <input type="number" min="1" value={newRuleFrequency} onChange={e => setNewRuleFrequency(Number(e.target.value))} className="mt-1 block w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Plantilla del Mensaje SMS</label>
                            <textarea rows={4} value={newRuleTemplate} onChange={e => setNewRuleTemplate(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
                            <p className="text-xs text-slate-500 mt-1">Usa <code className="bg-slate-200 text-xs px-1 rounded">{`{clientName}`}</code> y <code className="bg-slate-200 text-xs px-1 rounded">{`{serviceName}`}</code> como marcadores.</p>
                        </div>
                        <Button type="submit" className="w-full">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Añadir Regla
                        </Button>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <div className="p-6 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-xl font-semibold">Reglas Activas</h2>
                        <Button onClick={handleCheckServiceReminders} variant="secondary" isLoading={isChecking}>
                            {isChecking ? 'Revisando...' : 'Revisar Recordatorios de Servicios'}
                        </Button>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {loadingRules ? (
                             <p className="p-4 text-center text-slate-500">Cargando reglas...</p>
                        ) : rules.length > 0 ? (
                            rules.map(rule => (
                                <div key={rule.id} className="p-4 flex justify-between items-start hover:bg-slate-50">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800">Recordar <span className="text-sky-600">"{rule.serviceName}"</span> cada <span className="text-sky-600">{rule.frequencyDays}</span> días</p>
                                        <p className="text-sm text-slate-500 mt-1 italic">"{rule.messageTemplate}"</p>
                                    </div>
                                    <button onClick={() => handleDeleteRule(rule)} className="text-red-500 hover:text-red-700 p-1 ml-4 rounded-full hover:bg-red-100 transition-colors flex-shrink-0">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-slate-500">No hay reglas de automatización creadas.</p>
                        )}
                    </div>
                </Card>
            </div>
            <ConfirmationModal
                isOpen={isConfirmDeleteRuleOpen}
                onClose={() => setIsConfirmDeleteRuleOpen(false)}
                onConfirm={handleConfirmDeleteRule}
                title="Confirmar Eliminación de Regla"
            >
                <p>
                    ¿Estás seguro de que quieres eliminar esta regla de automatización?
                </p>
                 <p className="mt-2 text-sm text-slate-500">
                    Esta acción es permanente y no se puede deshacer.
                </p>
            </ConfirmationModal>
        </div>
    );
};


export const MarketingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'automation'>('campaigns');
  
  // --- STATE FOR SEGMENTS ---
  const [segments, setSegments] = useState<string[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [isConfirmSegmentModalOpen, setIsConfirmSegmentModalOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<string | null>(null);
  
  // --- STATE FOR CAMPAIGNS ---
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Campaign Pagination State
  const [campaignCurrentPage, setCampaignCurrentPage] = useState(1);
  const [campaignTotalPages, setCampaignTotalPages] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('');
  const [targetSegment, setTargetSegment] = useState('todos');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  
  // --- DATA FETCHING ---
  const fetchSegments = useCallback(async () => {
    setLoadingSegments(true);
    const segmentsData = await getSegments();
    setSegments(segmentsData);
    setLoadingSegments(false);
  }, []);

  const fetchCampaigns = useCallback(async (page: number, search: string) => {
      setLoadingCampaigns(true);
      try {
        const response = await getCampaigns(page, ITEMS_PER_PAGE, search);
        setCampaigns(response.data);
        setCampaignTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
        setTotalCampaigns(response.total);
        setCampaignCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoadingCampaigns(false);
      }
  }, []);
  
  useEffect(() => {
    fetchSegments();
    if(activeTab === 'campaigns') {
      fetchCampaigns(1, '');
    }
  }, [activeTab, fetchCampaigns, fetchSegments]);

  // --- HANDLERS FOR SEGMENTS ---
  const handleAddSegment = async (segmentName: string) => {
    try {
      await addSegment(segmentName);
      await fetchSegments();
    } catch(error) {
        console.error("Failed to add segment", error);
        alert("Error al añadir el segmento");
    }
  };

  const handleDeleteSegment = (segment: string) => {
    setSegmentToDelete(segment);
    setIsConfirmSegmentModalOpen(true);
  };
  
  const handleConfirmDeleteSegment = async () => {
    if (!segmentToDelete) return;
    try {
        await deleteSegment(segmentToDelete);
        await fetchSegments();
        // Reset dropdown if the deleted segment was selected
        if(targetSegment === segmentToDelete) {
            setTargetSegment('todos');
        }
    } catch (error) {
        console.error("Failed to delete segment:", error);
        alert("Error al eliminar el segmento.");
    } finally {
        setIsConfirmSegmentModalOpen(false);
        setSegmentToDelete(null);
    }
  };
  
  // --- HANDLERS FOR CAMPAIGNS ---
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !message) {
        alert("Por favor, rellena el nombre de la campaña y el mensaje.");
        return;
    }
    setIsSending(true);
    try {
      await sendCampaign({ name: campaignName, targetSegment, message, channel });
      setCampaignName('');
      setTargetSegment('todos');
      setMessage('');
      setChannel('email');
      fetchCampaigns(1, '');
    } catch (error) {
      console.error("Failed to send campaign:", error);
      alert("Error al enviar la campaña.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCampaignSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setCampaignSearchQuery(newQuery);
    fetchCampaigns(1, newQuery);
  };

  const handleCampaignPageChange = (page: number) => {
    fetchCampaigns(page, campaignSearchQuery);
  };
  
  const SegmentsManager: React.FC = () => {
    const [newSegment, setNewSegment] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const segmentToAdd = newSegment.trim();
        if(segmentToAdd) {
            handleAddSegment(segmentToAdd);
            setNewSegment('');
        }
    };
    
    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Gestionar Segmentos</h2>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input type="text" value={newSegment} onChange={e => setNewSegment(e.target.value)} placeholder="Nombre del segmento" className="flex-grow p-2 border rounded-md shadow-sm"/>
                <Button type="submit" size="md">Añadir</Button>
            </form>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {loadingSegments ? (
                    <p className="text-slate-500 text-center text-sm py-4">Cargando segmentos...</p>
                ) : segments.length > 0 ? segments.map(segment => (
                    <div key={segment} className="flex justify-between items-center p-2 bg-slate-100 rounded-md">
                        <span className="font-medium text-slate-700 capitalize">{segment}</span>
                        <button onClick={() => handleDeleteSegment(segment)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )) : <p className="text-slate-500 text-center text-sm py-4">No hay segmentos creados.</p>}
            </div>
        </Card>
    );
  };

  const CampaignsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><MegaphoneIcon className="w-6 h-6 mr-2" />Crear Campaña</h2>
                <form onSubmit={handleCampaignSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre de la Campaña</label>
                        <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Canal de Envío</label>
                        <div className="mt-2 flex gap-4 bg-slate-100 p-2 rounded-md">
                            <label className="flex items-center flex-1 justify-center p-2 rounded-md cursor-pointer" style={{backgroundColor: channel === 'email' ? 'white' : 'transparent', border: channel === 'email' ? '1px solid #0ea5e9' : '1px solid transparent', transition: 'all 0.2s'}}>
                                <input type="radio" value="email" checked={channel === 'email'} onChange={() => setChannel('email')} className="sr-only"/>
                                <span className="text-sm font-medium text-slate-700">Email</span>
                            </label>
                            <label className="flex items-center flex-1 justify-center p-2 rounded-md cursor-pointer" style={{backgroundColor: channel === 'sms' ? 'white' : 'transparent', border: channel === 'sms' ? '1px solid #0ea5e9' : '1px solid transparent', transition: 'all 0.2s'}}>
                                <input type="radio" value="sms" checked={channel === 'sms'} onChange={() => setChannel('sms')} className="sr-only"/>
                                <span className="text-sm font-medium text-slate-700">SMS</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Segmento de Clientes</label>
                        <select value={targetSegment} onChange={e => setTargetSegment(e.target.value)} className="mt-1 block w-full p-2 border bg-white rounded-md capitalize">
                            <option value="todos">Todos los Clientes</option>
                            {segments.map(segment => (
                                <option key={segment} value={segment}>{segment}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            {channel === 'email' ? 'Contenido del Email' : 'Texto del SMS'}
                        </label>
                        <textarea 
                          rows={5} 
                          value={message} 
                          onChange={e => setMessage(e.target.value)} 
                          className="mt-1 block w-full p-2 border rounded-md" 
                          required 
                          maxLength={channel === 'sms' ? 160 : undefined}
                        />
                        {channel === 'sms' && (
                            <p className="text-xs text-right text-slate-500 mt-1">{message.length} / 160</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" isLoading={isSending}>
                        {isSending ? 'Enviando...' : 'Enviar Campaña'}
                    </Button>
                </form>
            </Card>
            <SegmentsManager />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Campañas Enviadas</h2>
                <input
                    type="text"
                    placeholder="Buscar por nombre o segmento..."
                    value={campaignSearchQuery}
                    onChange={handleCampaignSearchChange}
                    className="w-full sm:w-auto sm:max-w-xs p-2 border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Canal</th>
                            <th scope="col" className="px-6 py-3">Segmento</th>
                            <th scope="col" className="px-6 py-3">Fecha Envío</th>
                            <th scope="col" className="px-6 py-3 text-center">Enviados</th>
                            <th scope="col" className="px-6 py-3 text-center">Aperturas</th>
                            <th scope="col" className="px-6 py-3 text-center">Clics</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingCampaigns ? (
                            <tr><td colSpan={7} className="text-center p-8 text-slate-500">Cargando...</td></tr>
                        ) : campaigns.map(campaign => (
                            <tr key={campaign.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{campaign.name}</td>
                                <td className="px-6 py-4">
                                  <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${campaign.channel === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{campaign.channel}</span>
                                </td>
                                <td className="px-6 py-4"><span className="bg-sky-100 text-sky-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded capitalize">{campaign.targetSegment}</span></td>
                                <td className="px-6 py-4">{new Date(campaign.sentDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-center">{campaign.stats.sent}</td>
                                <td className="px-6 py-4 text-center">{campaign.stats.opened}</td>
                                <td className="px-6 py-4 text-center">{campaign.stats.clicks}</td>
                            </tr>
                        ))}
                         {campaigns.length === 0 && !loadingCampaigns && (
                            <tr>
                                <td colSpan={7} className="text-center p-8 text-slate-500">
                                    No se encontraron campañas.
                                </td>
                            </tr>
                            )}
                    </tbody>
                </table>
            </div>
             <div className="p-4 border-t">
                <Pagination
                    currentPage={campaignCurrentPage}
                    totalPages={campaignTotalPages}
                    totalItems={totalCampaigns}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handleCampaignPageChange}
                    isLoading={loadingCampaigns}
                />
            </div>
          </Card>
        </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Marketing y Comunicación</h1>
      
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'campaigns' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
                Campañas
            </button>
            <button
                onClick={() => setActiveTab('automation')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'automation' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
                Automatización
            </button>
        </nav>
      </div>

      <div className={`${activeTab === 'campaigns' ? 'block' : 'hidden'}`}>
        <CampaignsView />
      </div>
      
       <div className={`${activeTab === 'automation' ? 'block' : 'hidden'}`}>
            <AutomationView segments={segments} refreshSegments={fetchSegments} />
       </div>
      
      <ConfirmationModal
        isOpen={isConfirmSegmentModalOpen}
        onClose={() => setIsConfirmSegmentModalOpen(false)}
        onConfirm={handleConfirmDeleteSegment}
        title="Confirmar Eliminación de Segmento"
      >
        <p>
            ¿Estás seguro de que quieres eliminar el segmento <strong className="capitalize">"{segmentToDelete}"</strong>?
        </p>
        <p className="mt-2 text-sm text-slate-500">
            Esta acción también eliminará la etiqueta de todos los clientes asociados y no se puede deshacer.
        </p>
      </ConfirmationModal>
    </div>
  );
};