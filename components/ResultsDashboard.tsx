import React, { useMemo, useState } from 'react';
import { Activity, ActivityStatus, Process, Task } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ResultsDashboardProps {
  activities: Activity[];
  processes: Process[];
  tasks: Task[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ activities, processes }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (activities.length === 0) return null;
    const total = activities.length;
    const executed = activities.filter(a => a.estado === ActivityStatus.EJECUTADO).length;
    const compliance = (executed / total) * 100;
    
    const processPerformance = processes.map(p => {
      const pActs = activities.filter(a => a.procesoId === p.id);
      const pExec = pActs.filter(a => a.estado === ActivityStatus.EJECUTADO).length;
      return { name: p.name, rate: pActs.length > 0 ? (pExec / pActs.length) * 100 : 0 };
    });

    return { total, executed, compliance, processPerformance };
  }, [activities, processes]);

  const generateAIReport = async () => {
    if (!stats) return;
    setAiLoading(true);
    setAiReport(null);
    try {
      // Inicialización siguiendo estrictamente el nuevo SDK
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Analiza estos indicadores de planta: 
        Cumplimiento: ${stats.compliance.toFixed(1)}%. 
        Ejecución: ${stats.executed} de ${stats.total} tareas. 
        Rendimiento: ${stats.processPerformance.map(p => `${p.name} (${p.rate.toFixed(0)}%)`).join(', ')}.
        Proporciona un diagnóstico breve y 2 acciones de mejora.`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      
      setAiReport(response.text || 'Análisis generado con éxito.');
    } catch (e) {
      console.error(e);
      setAiReport('Para activar el consultor IA, asegúrate de añadir tu API_KEY en la configuración de Netlify.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!stats) return (
    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100">
      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Esperando datos para análisis de rendimiento</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-sm">Consultor Estratégico IA</h3>
              <p className="text-[10px] text-slate-400 font-bold">Optimización de Procesos en Tiempo Real</p>
            </div>
          </div>
          <button 
            onClick={generateAIReport} 
            disabled={aiLoading} 
            className="bg-white text-slate-900 hover:bg-blue-50 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {aiLoading ? 'Procesando Datos...' : 'Generar Informe Ejecutivo'}
          </button>
        </div>
        
        {aiReport && (
          <div className="mt-6 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm italic text-slate-300 leading-relaxed font-medium">"{aiReport}"</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cumplimiento</p>
          <h4 className="text-5xl font-black text-blue-600">{stats.compliance.toFixed(1)}%</h4>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ejecutadas</p>
          <h4 className="text-5xl font-black text-emerald-600">{stats.executed}</h4>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Total</p>
          <h4 className="text-5xl font-black text-slate-800">{stats.total}</h4>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-black uppercase tracking-widest text-xs text-slate-800 mb-8">Rendimiento por Línea de Proceso</h3>
        <div className="grid grid-cols-1 gap-6">
          {stats.processPerformance.map((p, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span>{p.name}</span>
                <span className="text-blue-600">{p.rate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className={`h-full transition-all duration-1000 ${p.rate > 80 ? 'bg-emerald-500' : p.rate > 40 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                  style={{ width: `${p.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};