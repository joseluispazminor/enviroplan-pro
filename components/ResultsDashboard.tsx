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
    
    // Obtenemos la API_KEY inyectada por Vite desde el entorno de Netlify
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      setAiReport("⚠️ Error de Configuración: No se detectó la API_KEY. Asegúrate de haberla agregado en las 'Environment Variables' de Netlify y haber realizado un 'Clear cache and deploy'.");
      return;
    }

    setAiLoading(true);
    setAiReport(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Actúa como un experto en ingeniería de procesos industriales y medio ambiente. Analiza los siguientes indicadores de cumplimiento de la planta: 
        - Cumplimiento General: ${stats.compliance.toFixed(1)}%. 
        - Tareas completadas: ${stats.executed} de ${stats.total}. 
        - Desglose por línea: ${stats.processPerformance.map(p => `${p.name} (${p.rate.toFixed(0)}%)`).join(', ')}.
        
        Proporciona un análisis ejecutivo muy breve (máximo 4 líneas) sobre la eficiencia operativa de hoy y una recomendación crítica para mejorar el cumplimiento mañana.`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      
      const text = response.text;
      setAiReport(text || 'El análisis se completó pero no se recibió una respuesta legible.');
    } catch (e: any) {
      console.error("Gemini API Error:", e);
      setAiReport("No se pudo conectar con el consultor IA. Verifica que la API_KEY de Google AI Studio sea correcta y tenga cuota disponible.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!stats) return (
    <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-slate-100">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Inicia el registro de actividades para activar el análisis inteligente</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-[0.2em] text-sm mb-1">Consultor Estratégico</h3>
                <p className="text-xs text-slate-400 font-bold">Diagnóstico Predictivo de Planta • IA</p>
              </div>
            </div>
            <button 
              onClick={generateAIReport} 
              disabled={aiLoading} 
              className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg"
            >
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Analizando Datos...
                </span>
              ) : 'Generar Informe Ejecutivo'}
            </button>
          </div>
          
          {aiReport && (
            <div className="mt-10 p-6 bg-white/10 rounded-2xl border border-white/20 animate-in slide-in-from-top-2 duration-500">
              <p className="text-sm italic text-blue-50 leading-relaxed font-medium">"{aiReport}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cumplimiento Global</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-6xl font-black text-blue-600 tracking-tighter">{stats.compliance.toFixed(1)}</h4>
            <span className="text-xl font-black text-blue-300">%</span>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ejecutadas</p>
          <h4 className="text-6xl font-black text-emerald-500 tracking-tighter">{stats.executed}</h4>
          <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Actividades con éxito</p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Programado</p>
          <h4 className="text-6xl font-black text-slate-800 tracking-tighter">{stats.total}</h4>
          <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Plan de hoy</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black uppercase tracking-[0.2em] text-xs text-slate-800 mb-10">Eficiencia por Línea de Proceso</h3>
        <div className="grid grid-cols-1 gap-8">
          {stats.processPerformance.map((p, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{p.name}</span>
                <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{p.rate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-50 h-4 rounded-full overflow-hidden border border-slate-100 p-1">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 shadow-sm ${p.rate > 80 ? 'bg-emerald-500' : p.rate > 40 ? 'bg-blue-500' : 'bg-orange-500'}`} 
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