import { Client, Appointment, Campaign, Plan, ReminderRule } from '../types';

// --- MOCK DATABASE ---

let clients: Client[] = [
  { id: '1', name: 'Ana García', email: 'ana.garcia@example.com', phone: '611223344', createdAt: '2023-10-15', tags: ['vip', 'frecuente'], notes: 'Prefiere café solo.' },
  { id: '2', name: 'Luis Rodríguez', email: 'luis.rodriguez@example.com', phone: '622334455', createdAt: '2023-11-01', tags: ['nuevo'], notes: '' },
  { id: '3', name: 'Carmen Pérez', email: 'carmen.perez@example.com', phone: '633445566', createdAt: '2023-09-20', tags: ['frecuente'], notes: 'Alérgica a los frutos secos.' },
  { id: '4', name: 'Javier Fernández', email: 'javier.fernandez@example.com', phone: '644556677', createdAt: '2024-01-10', tags: ['frecuente'], notes: ''},
  { id: '5', name: 'Laura Martinez', email: 'laura.martinez@example.com', phone: '655667788', createdAt: '2024-02-22', tags: ['nuevo', 'vip'], notes: 'Interesada en tratamientos capilares.'},
  { id: '6', name: 'Marcos Alonso', email: 'marcos.alonso@example.com', phone: '666778899', createdAt: '2024-03-05', tags: [], notes: ''},
  { id: '7', name: 'Sofía Romero', email: 'sofia.romero@example.com', phone: '677889900', createdAt: '2024-04-18', tags: ['frecuente'], notes: 'Viene cada 3 semanas.'},
];

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const twoDaysFromNow = new Date();
twoDaysFromNow.setDate(today.getDate() + 2);
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);
const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(today.getMonth() - 2);

let appointments: Appointment[] = [
  // Today's appointments for testing the agenda view
  { id: 'a1', clientId: '1', clientName: 'Ana García', service: 'Corte y Peinado', start: new Date(new Date(today).setHours(10, 0, 0, 0)), end: new Date(new Date(today).setHours(11, 0, 0, 0)), estimatedDuration: 60, status: 'confirmed' },
  { id: 'a3', clientId: '3', clientName: 'Carmen Pérez', service: 'Tinte', start: new Date(new Date(today).setHours(10, 0, 0, 0)), end: new Date(new Date(today).setHours(11, 30, 0, 0)), estimatedDuration: 90, status: 'confirmed' },
  { id: 'a6', clientId: '2', clientName: 'Luis Rodríguez', service: 'Corte Caballero', start: new Date(new Date(today).setHours(16, 0, 0, 0)), end: new Date(new Date(today).setHours(16, 30, 0, 0)), estimatedDuration: 30, status: 'cancelled' },
  // Future appointments
  { id: 'a2', clientId: '2', clientName: 'Luis Rodríguez', service: 'Asesoramiento', start: new Date(new Date(tomorrow).setHours(12, 0, 0, 0)), end: new Date(new Date(tomorrow).setHours(12, 30, 0, 0)), estimatedDuration: 30, status: 'pending_confirmation' },
  { id: 'a5', clientId: '3', clientName: 'Carmen Pérez', service: 'Tinte', start: new Date(new Date(twoDaysFromNow).setHours(11, 0, 0, 0)), end: new Date(new Date(twoDaysFromNow).setHours(12, 30, 0, 0)), estimatedDuration: 90, status: 'pending_confirmation' },
  // Past appointment
  { id: 'a4', clientId: '1', clientName: 'Ana García', service: 'Manicura', start: new Date(new Date(lastWeek).setHours(11, 0, 0, 0)), end: new Date(new Date(lastWeek).setHours(11, 45, 0, 0)), estimatedDuration: 45, status: 'confirmed' },
  // Old appointment for reminder testing
  { id: 'a7', clientId: '3', clientName: 'Carmen Pérez', service: 'Tinte', start: twoMonthsAgo, end: new Date(twoMonthsAgo.getTime() + 90 * 60000), estimatedDuration: 90, status: 'confirmed' },
];

let campaigns: Campaign[] = [
    { id: 'c1', name: 'Promoción Verano', targetSegment: 'frecuente', channel: 'email', message: '¡Disfruta de un 20% de descuento en todos los tintes este verano!', sentDate: '2024-06-15', status: 'sent', stats: { sent: 2, opened: 2, clicks: 1 } },
    { id: 'c2', name: 'Descuento Nuevos Clientes', targetSegment: 'nuevo', channel: 'sms', message: 'Tu primera visita con un 15% de descuento. ¡Te esperamos!', sentDate: '2024-07-01', status: 'sent', stats: { sent: 1, opened: 0, clicks: 0 } },
    { id: 'c3', name: 'Oferta VIP Julio', targetSegment: 'vip', channel: 'email', message: 'Acceso exclusivo a nuestra nueva línea de productos.', sentDate: '2024-07-05', status: 'sent', stats: { sent: 1, opened: 1, clicks: 1 } },
    { id: 'c4', name: 'Recordatorio Cita Previa', targetSegment: 'todos', channel: 'sms', message: 'No te olvides de reservar tu próxima cita para mantener tu look.', sentDate: '2024-05-20', status: 'sent', stats: { sent: 7, opened: 0, clicks: 0 } },
    { id: 'c5', name: 'Especial Otoño', targetSegment: 'frecuente', channel: 'email', message: 'Prepara tu cabello para el otoño con nuestros tratamientos nutritivos.', sentDate: new Date(new Date().setDate(today.getDate() - 40)).toISOString(), status: 'sent', stats: { sent: 4, opened: 3, clicks: 1 } },
    { id: 'c6', name: 'Bienvenida 2024', targetSegment: 'todos', channel: 'email', message: '¡Feliz año nuevo! Te deseamos lo mejor para este 2024.', sentDate: '2024-01-01', status: 'sent', stats: { sent: 6, opened: 5, clicks: 2 } },
];

let reminderRules: ReminderRule[] = [
    { id: 'r1', serviceName: 'Tinte', frequencyDays: 30, messageTemplate: 'Hola {clientName}, ya hace casi un mes desde tu último {serviceName}. ¡Pide cita para mantener tu look perfecto!' }
];

const plans: Plan[] = [
    { name: 'Gratis', price: 0, features: ['10 Citas/mes', '25 Clientes', 'Recordatorios básicos'], limits: { appointments: 10, clients: 25, emails: 50 } },
    { name: 'Básico', price: 29, features: ['100 Citas/mes', '500 Clientes', 'Email Marketing'], limits: { appointments: 100, clients: 500, emails: 1000 } },
    { name: 'Pro', price: 79, features: ['Citas ilimitadas', 'Clientes ilimitados', 'Marketing avanzado', 'Informes detallados'], limits: { appointments: 'unlimited', clients: 'unlimited', emails: 'unlimited' } },
];

let segments: string[] = ['vip', 'frecuente', 'nuevo'];

// --- MOCK API FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Simulates fetching a paginated list of clients.
 * In a real backend, this would correspond to an API endpoint like:
 * GET /api/clients?page=1&limit=5&search=ana
 * The 'search' query parameter would be handled by the backend to filter results before pagination.
 * @param page - The page number to fetch.
 * @param limit - The number of items per page.
 * @param searchQuery - An optional string to filter clients by name, email or tag.
 * @returns A promise that resolves to an object with the clients for the page and the total number of filtered clients.
 */
export const getClients = async (page: number = 1, limit: number = 5, searchQuery: string = ''): Promise<{ data: Client[]; total: number }> => {
  await simulateDelay(500);

  const lowercasedQuery = searchQuery.toLowerCase();
  const filteredClients = searchQuery
      ? clients.filter(client =>
          client.name.toLowerCase().includes(lowercasedQuery) ||
          client.email.toLowerCase().includes(lowercasedQuery) ||
          client.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
      )
      : clients;
  
  const total = filteredClients.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedClients = filteredClients.slice(start, end);
  
  return { data: paginatedClients, total: total };
};


export const getClientById = async (id: string): Promise<Client | undefined> => {
    await simulateDelay(300);
    return clients.find(c => c.id === id);
};

export const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    await simulateDelay(500);
    const newClient: Client = {
        ...clientData,
        id: String(clients.length + 1 + Math.random()),
        createdAt: new Date().toISOString().split('T')[0],
    };
    clients.push(newClient);
    return newClient;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  await simulateDelay(500);
  return [...appointments];
};

export const getAppointmentsByClientId = async (clientId: string): Promise<Appointment[]> => {
    await simulateDelay(400);
    return appointments.filter(a => a.clientId === clientId);
};

export const addAppointment = async (apptData: Omit<Appointment, 'id' | 'status' | 'end' | 'confirmationToken'>): Promise<Appointment> => {
    await simulateDelay(500);
    const end = new Date(apptData.start.getTime() + apptData.estimatedDuration * 60000);
    const newAppointment: Appointment = {
        ...apptData,
        id: 'a' + (appointments.length + 1 + Math.random()),
        status: 'pending_confirmation',
        end: end,
    };
    appointments.push(newAppointment);
    return newAppointment;
};

export const updateAppointment = async (apptId: string, apptData: Partial<Omit<Appointment, 'id'>>): Promise<Appointment> => {
    await simulateDelay(500);
    const index = appointments.findIndex(a => a.id === apptId);
    if (index === -1) {
        throw new Error("Appointment not found");
    }

    const originalAppointment = appointments[index];
    // Recalculate end time if start or duration changes
    const newStart = apptData.start || originalAppointment.start;
    const newDuration = apptData.estimatedDuration || originalAppointment.estimatedDuration;
    const newEnd = new Date(newStart.getTime() + newDuration * 60000);

    const updatedAppointment = { ...originalAppointment, ...apptData, end: newEnd, id: apptId };
    appointments[index] = updatedAppointment as Appointment;
    return updatedAppointment as Appointment;
};


export const deleteAppointment = async (apptId: string): Promise<void> => {
    await simulateDelay(500);
    const index = appointments.findIndex(a => a.id === apptId);
    if (index > -1) {
        appointments.splice(index, 1);
    } else {
        throw new Error("Appointment not found");
    }
};

export const triggerConfirmationReminders = async (): Promise<number> => {
    await simulateDelay(1500);
    console.log("--- BUSCANDO RECORDATORIOS PARA ENVIAR ---");
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    let remindersSent = 0;

    appointments.forEach(app => {
        if (app.status === 'pending_confirmation' && app.start > now && app.start <= twoDaysFromNow) {
            const token = `${app.id}-${Math.random().toString(36).substring(2, 10)}`;
            app.confirmationToken = token;
            app.status = 'confirmation_sent';
            remindersSent++;
            
            const confirmationUrl = `${window.location.origin}${window.location.pathname}#/confirm/${token}`;
            
            console.log(`%c[SMS SIMULADO] Enviando a ${app.clientName}:`, 'color: #0ea5e9; font-weight: bold;');
            console.log(`Hola ${app.clientName.split(' ')[0]}, te recordamos tu cita para "${app.service}" el ${app.start.toLocaleDateString()} a las ${app.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Por favor, confirma tu asistencia aquí: ${confirmationUrl}`);
        }
    });

    console.log(`--- ${remindersSent} RECORDATORIOS ENVIADOS ---`);
    return remindersSent;
}

export const confirmAppointmentByToken = async (token: string): Promise<Appointment> => {
    await simulateDelay(1000);
    const appIndex = appointments.findIndex(app => app.confirmationToken === token);

    if (appIndex === -1) {
        throw new Error("Token de confirmación no válido o expirado.");
    }
    
    if (appointments[appIndex].status === 'confirmed') {
        return appointments[appIndex];
    }

    appointments[appIndex].status = 'confirmed';
    return appointments[appIndex];
};


/**
 * Simulates fetching a paginated list of campaigns.
 * In a real backend, this would correspond to an API endpoint like:
 * GET /api/campaigns?page=1&limit=5&search=verano
 * @param page - The page number to fetch.
 * @param limit - The number of items per page.
 * @param searchQuery - An optional string to filter campaigns by name or segment.
 * @returns A promise that resolves to an object with the campaigns for the page and the total number of filtered campaigns.
 */
export const getCampaigns = async (page: number = 1, limit: number = 5, searchQuery: string = ''): Promise<{ data: Campaign[], total: number }> => {
    await simulateDelay(600);
    
    const lowercasedQuery = searchQuery.toLowerCase();
    const filteredCampaigns = searchQuery
        ? campaigns.filter(campaign =>
            campaign.name.toLowerCase().includes(lowercasedQuery) ||
            campaign.targetSegment.toLowerCase().includes(lowercasedQuery)
        ) : campaigns;
        
    const total = filteredCampaigns.length;
    
    // Sort before paginating to ensure consistent order across pages
    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCampaigns = sortedCampaigns.slice(start, end);
    
    return { data: paginatedCampaigns, total: total };
};

/**
 * Simulates fetching campaigns for reporting purposes.
 * In a real backend, this might be a separate endpoint.
 * GET /api/reports/campaigns
 * This mock will return the 10 most recent campaigns.
 * @returns A promise that resolves to an array of campaigns.
 */
export const getAllCampaignsForReport = async (): Promise<Campaign[]> => {
    await simulateDelay(700);
    // Sort by date descending to get the most recent ones
    const sortedCampaigns = [...campaigns].sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
    // Return up to the top 10 for the report
    return sortedCampaigns.slice(0, 10);
};

export const sendCampaign = async (campaignData: Omit<Campaign, 'id' | 'sentDate' | 'status' | 'stats'>): Promise<Campaign> => {
    await simulateDelay(1000);
    
    const payload = {
        campaignName: campaignData.name,
        deliveryChannel: campaignData.channel,
        audienceSegment: campaignData.targetSegment,
        content: campaignData.message,
    };

    console.log("--- SIMULANDO ENVÍO A BACKEND ---");
    console.log("Payload a enviar:", payload);
    alert(`Campaña preparada para enviar por ${payload.deliveryChannel.toUpperCase()}.\n\nPayload (ver consola para detalles):\n${JSON.stringify(payload, null, 2)}`);

    const newCampaign: Campaign = {
        ...campaignData,
        id: 'c' + (campaigns.length + 1 + Math.random()),
        sentDate: new Date().toISOString(),
        status: 'sent',
        stats: { sent: 0, opened: 0, clicks: 0 } 
    };
    campaigns.push(newCampaign);
    return newCampaign;
};

export const getPlans = async (): Promise<Plan[]> => {
    await simulateDelay(200);
    return [...plans];
};

export const getDashboardStats = async () => {
    await simulateDelay(400);
    const upcomingAppointments = appointments.filter(a => a.start > new Date()).length;
    const newClientsThisMonth = clients.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length;
    const occupancyRate = 78; // Mock data
    return { upcomingAppointments, newClientsThisMonth, occupancyRate };
};

// --- SEGMENT FUNCTIONS ---
export const getSegments = async (): Promise<string[]> => {
    await simulateDelay(200);
    return [...new Set(segments)].sort();
};

export const addSegment = async (segmentName: string): Promise<string> => {
    await simulateDelay(300);
    const formattedName = segmentName.toLowerCase().trim();
    if (formattedName && !segments.includes(formattedName)) {
        segments.push(formattedName);
    }
    return formattedName;
};

export const deleteSegment = async (segmentName: string): Promise<void> => {
    await simulateDelay(300);
    segments = segments.filter(s => s !== segmentName);
    clients.forEach(client => {
        client.tags = client.tags.filter(tag => tag !== segmentName);
    });
};

// --- REMINDER RULE FUNCTIONS ---
export const getReminderRules = async (): Promise<ReminderRule[]> => {
    await simulateDelay(300);
    return [...reminderRules];
};

export const addReminderRule = async (rule: Omit<ReminderRule, 'id'>): Promise<ReminderRule> => {
    await simulateDelay(400);
    const newRule: ReminderRule = { ...rule, id: `r${Date.now()}`};
    reminderRules.push(newRule);
    return newRule;
};

export const deleteReminderRule = async (ruleId: string): Promise<void> => {
    await simulateDelay(400);
    reminderRules = reminderRules.filter(r => r.id !== ruleId);
};

export const triggerServiceReminders = async (): Promise<number> => {
    await simulateDelay(2000);
    console.log("--- BUSCANDO RECORDATORIOS DE SERVICIOS ---");
    let remindersSent = 0;
    const today = new Date();

    const clientAppointmentsMap: { [clientId: string]: Appointment[] } = {};
    for (const app of appointments) {
        if (!clientAppointmentsMap[app.clientId]) {
            clientAppointmentsMap[app.clientId] = [];
        }
        clientAppointmentsMap[app.clientId].push(app);
    }

    for (const client of clients) {
        for (const rule of reminderRules) {
            const clientApps = clientAppointmentsMap[client.id] || [];
            const lastServiceAppointments = clientApps
                .filter(app => app.service.toLowerCase() === rule.serviceName.toLowerCase() && app.status === 'confirmed' && new Date(app.start) < today)
                .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

            if (lastServiceAppointments.length > 0) {
                const lastAppointment = lastServiceAppointments[0];
                const lastVisitDate = new Date(lastAppointment.start);
                const daysSinceLastVisit = Math.floor((today.getTime() - lastVisitDate.getTime()) / (1000 * 3600 * 24));

                if (daysSinceLastVisit >= rule.frequencyDays) {
                    remindersSent++;
                    const message = rule.messageTemplate
                        .replace('{clientName}', client.name.split(' ')[0])
                        .replace('{serviceName}', rule.serviceName);
                    
                    console.log(`%c[SMS RECORDATORIO DE SERVICIO] Enviando a ${client.name}:`, 'color: #f59e0b; font-weight: bold;');
                    console.log(message);
                    // To prevent re-sending immediately, we could add a flag to the client or rule, but for this mock, we will just log it.
                }
            }
        }
    }

    console.log(`--- ${remindersSent} RECORDATORIOS DE SERVICIO ENVIADOS ---`);
    return remindersSent;
};

/**
 * Simulates fetching filtered report data based on a date range.
 * In a real backend, this would be a single, optimized endpoint.
 * GET /api/reports?range=1_month
 * @param dateRange - A string key representing the desired period ('1_week', '1_month', etc.).
 * @returns A promise that resolves to an object with all the data needed for the reports page.
 */
export const getFilteredReportData = async (dateRange: string): Promise<{
    appointmentStatusData: { name: string; value: number }[];
    marketingCampaigns: Campaign[];
    reminderCampaigns: Campaign[];
}> => {
    await simulateDelay(800);

    const now = new Date();
    const startDate = new Date();

    switch (dateRange) {
        case '1_week':
            startDate.setDate(now.getDate() - 7);
            break;
        case '2_weeks':
            startDate.setDate(now.getDate() - 14);
            break;
        case '1_month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case '2_months':
            startDate.setMonth(now.getMonth() - 2);
            break;
        case '6_months':
            startDate.setMonth(now.getMonth() - 6);
            break;
        case '1_year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case '2_years':
            startDate.setFullYear(now.getFullYear() - 2);
            break;
        case '3_months':
        default:
            startDate.setMonth(now.getMonth() - 3);
            break;
    }

    // Filter appointments
    const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.start);
        return appDate >= startDate && appDate <= now;
    });

    // Calculate appointment status data from filtered appointments
    const appointmentStatusData = [
        { name: 'Confirmadas', value: filteredAppointments.filter(a => a.status === 'confirmed').length },
        { name: 'Canceladas', value: filteredAppointments.filter(a => a.status === 'cancelled').length },
        { name: 'Pendientes', value: filteredAppointments.filter(a => a.status === 'pending_confirmation' || a.status === 'confirmation_sent').length },
    ].filter(d => d.value > 0);

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(c => {
        const campaignDate = new Date(c.sentDate);
        return campaignDate >= startDate && campaignDate <= now;
    });

    const marketingCampaigns = filteredCampaigns
        .filter(c => !c.name.toLowerCase().includes('recordatorio'))
        .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())
        .slice(0, 10); // Limit to 10 most recent within the period for readability

    const reminderCampaigns = filteredCampaigns
        .filter(c => c.name.toLowerCase().includes('recordatorio'))
        .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime())
        .slice(0, 10);

    return {
        appointmentStatusData,
        marketingCampaigns,
        reminderCampaigns,
    };
};