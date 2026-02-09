
import React, { useState, useEffect } from 'react';
import { Process, Task } from '../types';
import { isCloudEnabled } from '../supabase';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  processes: Process[];
  tasks: Task[];
  onUpdateProcesses: (processes: Process[]) => void;
  onUpdateTasks: (tasks: Task[]) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  processes,
  tasks,
  onUpdateProcesses,
  onUpdateTasks
}) => {
  const [newProcessName, setNewProcessName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [activeTab, setActiveTab] = useState<'processes' | 'bulk' | 'cloud'>('processes');
  
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('pa_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('pa_supabase_key') || '');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(isCloudEnabled());
  }, []);

  if (!isOpen) return null;

  const saveCloudConfig = () => {
    if (!supabaseUrl.startsWith('https://')) {
      alert('La URL de Supabase debe empezar con https://');
      return;
    }
    localStorage.setItem('pa_supabase_url', supabaseUrl.trim());
    localStorage.setItem('pa_supabase_key', supabaseKey.trim());
    alert('¡Configuración guardada! La App se reiniciará para conectar con EnviroPlan Cloud.');
    window.location.reload();
  };

  const addProcess = () => {
    if (!newProcessName.trim()) return;
    const newProcess: Process = {
      id: `P-${Date.now()}`,
      name: newProcessName.trim()
    };
    onUpdateProcesses([...processes, newProcess]);
    setNewProcessName('');
  };

  const removeProcess = (id: string) => {
    if(confirm('¿Eliminar proceso y todas sus tareas asociadas?')) {
      onUpdateProcesses(processes.filter(p => p.id !== id));
      onUpdateTasks(tasks.filter(t => t.procesoId !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que deseas limpiar toda la configuración de catálogos locales?')) {
      onUpdateProcesses([]);
      onUpdateTasks([]);
    }
  };

  const handleBulkImport = () => {
    const lines = bulkText.split('\n');
    const newProcs: Process[] = [...processes];
    const newTks: Task[] = [...tasks];

    lines.forEach(line => {
      const parts = line.split(/[,\t]/);
      if (parts.length >= 2) {
        const procName = parts[0].trim();
        const taskName = parts[1].trim();
        if (!procName || !taskName) return;

        let proc = newProcs.find(p => p.name.toLowerCase() === procName.toLowerCase());
        if (!proc) {
          proc = { id: `P-${Math.random().toString(36).substr(2, 9)}`, name: procName };
          newProcs.push(proc);
        }

        const taskExists = newTks.find(t => t.name.toLowerCase() === taskName.toLowerCase() && t.procesoId === proc?.id);
        if (!taskExists && proc) {
          newTks.push({ id: `T-${Math.random().toString(36).substr(2, 9)}`, procesoId: proc.id, name: taskName });
        }
      }
    });

    onUpdateProcesses(newProcs);
    onUpdateTasks(newTks);
    setBulkText('');
    alert('Importación completada con éxito');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Configuración del Sistema
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b bg-slate-50">
          <button onClick={() => setActiveTab('processes')} className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === 'processes' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Catálogos</button>
          <button onClick={() => setActiveTab('bulk')} className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === 'bulk' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>Carga Masiva</button>
          <button onClick={() => setActiveTab('cloud')} className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === 'cloud' ? 'bg-white border-t-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
               EnviroPlan Cloud
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'processes' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Nombre del nuevo proceso (ej: Gestión de Residuos)..." 
                  value={newProcessName}
                  onChange={(e) => setNewProcessName(e.target.value)}
                />
                <button onClick={addProcess} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">Añadir</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processes.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border group hover:border-blue-200 hover:bg-white transition-all">
                    <div>
                      <span className="font-bold text-gray-700">{p.name}</span>
                      <p className="text-[10px] text-gray-400 font-mono">{p.id}</p>
                    </div>
                    <button onClick={() => removeProcess(p.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800 flex gap-3 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>Copia y pega desde Excel con este formato: <b>[Proceso] [Coma o Tab] [Tarea]</b>.</p>
              </div>
              <textarea 
                className="w-full h-64 p-4 font-mono text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50"
                placeholder="Ejemplo:&#10;Residuos Sólidos, Recolección Domiciliaria&#10;Residuos Sólidos, Clasificación"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button 
                onClick={handleBulkImport}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all"
              >
                IMPORTAR DESDE EXCEL
              </button>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* GUIA PASO A PASO PARA EL USUARIO */}
              {!isConnected && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
                  <div className="bg-amber-100 px-4 py-2 border-b border-amber-200">
                    <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Guía para encontrar tus llaves en Supabase</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3 items-start">
                      <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                      <p className="text-[11px] text-amber-900">En Supabase, haz clic en el icono del <b>Engranaje ⚙️ (Project Settings)</b> en la barra lateral izquierda.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                      <p className="text-[11px] text-amber-900">Busca la sección <b>"API"</b> (Debajo de Project Settings).</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                      <p className="text-[11px] text-amber-900">Copia la <b>Project URL</b> y en la tabla "API Keys", copia la que dice <b>"anon / public"</b>.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Project URL</label>
                      <span className="text-[9px] font-bold text-blue-500">Sección: Data API</span>
                    </div>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono bg-white"
                      placeholder="https://abc.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Anon Key (public)</label>
                      <span className="text-[9px] font-bold text-blue-500">Sección: API Keys</span>
                    </div>
                    <input 
                      type="password" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono bg-white"
                      placeholder="Pega aquí la llave anon public..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={saveCloudConfig}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Establecer Conexión Nube
                  </button>
                </div>
              </div>

              {isConnected && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  <p className="text-[10px] font-black text-emerald-700 uppercase">Sincronización en tiempo real activa</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-2 rounded-xl font-black text-xs uppercase hover:bg-slate-100 transition-all">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
