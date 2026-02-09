
import React, { useState, useEffect } from 'react';
import { Activity, ActivityStatus, Process, Task } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface PlanningFormProps {
  onAddActivity: (activity: Activity) => void;
  processes: Process[];
  tasks: Task[];
}

export const PlanningForm: React.FC<PlanningFormProps> = ({ onAddActivity, processes, tasks }) => {
  const [formData, setFormData] = useState<Partial<Activity>>({
    fecha: new Date().toISOString().split('T')[0],
    procesoId: '',
    tareaId: '',
    recursos: '',
    numPersonas: 1,
    personalAsignado: '',
    estado: ActivityStatus.PLANEADO
  });

  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);

  // Filter tasks based on selected process
  useEffect(() => {
    if (formData.procesoId) {
      const filtered = tasks.filter(t => t.procesoId === formData.procesoId);
      setAvailableTasks(filtered);
      if (!filtered.some(t => t.id === formData.tareaId)) {
        setFormData(prev => ({ ...prev, tareaId: '' }));
      }
    } else {
      setAvailableTasks([]);
      setFormData(prev => ({ ...prev, tareaId: '' }));
    }
  }, [formData.procesoId, tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.procesoId || !formData.tareaId || !formData.fecha) {
      alert('Por favor complete los campos obligatorios (Fecha, Proceso y Actividad)');
      return;
    }

    const newActivity: Activity = {
      ...formData as Activity,
      id: crypto.randomUUID()
    };

    onAddActivity(newActivity);
    
    setFormData(prev => ({
      ...prev,
      recursos: '',
      numPersonas: 1,
      personalAsignado: '',
      estado: ActivityStatus.PLANEADO
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-800">Planificación Diaria</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</label>
          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.fecha}
            onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seleccione un Proceso</label>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.procesoId}
            onChange={(e) => setFormData(prev => ({ ...prev, procesoId: e.target.value }))}
          >
            <option value="">Seleccionar...</option>
            {processes.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seleccione Actividad a Ejecutar</label>
          <select
            className={`px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${!formData.procesoId && 'bg-gray-50 cursor-not-allowed'}`}
            disabled={!formData.procesoId}
            value={formData.tareaId}
            onChange={(e) => setFormData(prev => ({ ...prev, tareaId: e.target.value }))}
          >
            <option value="">{formData.procesoId ? 'Seleccionar...' : 'Elija un proceso primero'}</option>
            {availableTasks.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 lg:col-span-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recursos (Equipos/Maquinaria)</label>
          <input
            type="text"
            placeholder="Ej: Camión 01, Palas, EPP"
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.recursos}
            onChange={(e) => setFormData(prev => ({ ...prev, recursos: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nº Personas</label>
          <input
            type="number"
            min="1"
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.numPersonas}
            onChange={(e) => setFormData(prev => ({ ...prev, numPersonas: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Asignado</label>
          <input
            type="text"
            placeholder="Nombres del equipo..."
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.personalAsignado}
            onChange={(e) => setFormData(prev => ({ ...prev, personalAsignado: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</label>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={formData.estado}
            onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as ActivityStatus }))}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t mt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            AGREGAR NUEVA ACTIVIDAD
          </button>
        </div>
      </form>
    </div>
  );
};
