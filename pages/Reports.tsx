import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/common/Card';
import { Campaign } from '../types';
import { getFilteredReportData } from '../services/mockApi';

const occupancyData = [
  { name: 'Enero', ocupacion: 65 },
  { name: 'Febrero', ocupacion: 72 },
  { name: 'Marzo', ocupacion: 80 },
  { name: 'Abril', ocupacion: 75 },
  { name: 'Mayo', ocupacion: 82 },
  { name: 'Junio', ocupacion: 88 },
];

const COLORS = ['#0ea5e9', '#f43f5e', '#f59e0b']; // sky-500, red-500, amber-500

interface ReportData {
  appointmentStatusData: { name: string; value: number }[];
  marketingCampaigns: Campaign[];
  reminderCampaigns: Campaign[];
}

export const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('3_months');

  useEffect(() => {
      const fetchReportData = async () => {
          setLoading(true);
          try {
              const data = await getFilteredReportData(dateRange);
              setReportData(data);
          } catch (error) {
              console.error("Error fetching report data:", error);
              setReportData(null); // Clear data on error
          } finally {
              setLoading(false);
          }
      };
      fetchReportData();
  }, [dateRange]); // Re-fetch when dateRange changes

  const renderLoader = (text: string) => (
    <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-center text-slate-500">{text}</p>
    </div>
  );

  const renderEmptyState = (text: string) => (
    <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-center text-slate-500">{text}</p>
    </div>
  );

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Informes y Estadísticas</h1>
            <div className="flex items-center gap-2">
                <label htmlFor="date-range" className="text-sm font-medium text-slate-700">Mostrar:</label>
                <select 
                    id="date-range"
                    value={dateRange} 
                    onChange={e => setDateRange(e.target.value)}
                    className="p-2 border bg-white rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                    disabled={loading}
                >
                    <option value="1_week">Última semana</option>
                    <option value="2_weeks">Últimas 2 semanas</option>
                    <option value="1_month">Último mes</option>
                    <option value="2_months">Últimos 2 meses</option>
                    <option value="3_months">Últimos 3 meses</option>
                    <option value="6_months">Últimos 6 meses</option>
                    <option value="1_year">Último año</option>
                    <option value="2_years">Últimos 2 años</option>
                </select>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tasa de Ocupación Mensual</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="ocupacion" fill="#0284c7" name="Ocupación" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Estado de las Citas</h2>
           <div style={{ width: '100%', height: 300 }}>
            {loading ? renderLoader("Cargando datos de citas...") : 
             !reportData || reportData.appointmentStatusData.length === 0 ? renderEmptyState("No hay datos de citas para este período.") : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={reportData.appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
             )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados de Campañas de Marketing</h2>
          <div style={{ width: '100%', height: 400 }}>
            {loading ? renderLoader("Cargando informe de campañas...") : 
             !reportData || reportData.marketingCampaigns.length === 0 ? renderEmptyState("No hay campañas de marketing para este período.") : (
              <ResponsiveContainer>
                <BarChart data={reportData.marketingCampaigns} margin={{ top: 5, right: 20, left: 0, bottom: 85 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="stats.sent" name="Enviados" fill="#38bdf8" />
                  <Bar dataKey="stats.opened" name="Aperturas" fill="#34d399" />
                  <Bar dataKey="stats.clicks" name="Clics" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados de Recordatorios</h2>
          <div style={{ width: '100%', height: 400 }}>
            {loading ? renderLoader("Cargando informe de recordatorios...") : 
             !reportData || reportData.reminderCampaigns.length === 0 ? renderEmptyState("No hay datos de recordatorios para este período.") : (
              <ResponsiveContainer>
                <BarChart data={reportData.reminderCampaigns} margin={{ top: 5, right: 20, left: 0, bottom: 85 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="stats.sent" name="Enviados" fill="#38bdf8" />
                  <Bar dataKey="stats.clicks" name="Clics" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};