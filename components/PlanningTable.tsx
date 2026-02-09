
import React, { useState, useRef } from 'react';
import { Activity, Process, Task, ActivityStatus, UserRole, AuditStatus, ActivityAudit } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface PlanningTableProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ActivityStatus) => void;
  onUpdateEvidence: (id: string, base64: string) => void;
  onUpdateAudit: (id: string, audit: ActivityAudit) => void;
  processes: Process[];
  tasks: Task[];
  userRole: UserRole;
}

export const PlanningTable: React.FC<PlanningTableProps> = ({ 
  activities, 
  onDeleteActivity, 
  onUpdateStatus,
  onUpdateEvidence,
  onUpdateAudit,
  processes, 
  tasks,
  userRole
}) => {
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [auditComment, setAuditComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  const isAdmin = userRole === 'ADMIN';
  const isSupervisor = userRole === 'SUPERVISOR';
  const canAudit = isAdmin || isSupervisor;

  const getProcessName = (id: string) => processes.find(p => p.id === id)?.name || id;
  const getTaskName = (id: string) => tasks.find(t => t.id === id)?.name || id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planeado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ejecutado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      case 'Reprogramado': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAuditStatusColor = (status?: AuditStatus) => {
    switch (status) {
      case AuditStatus.APROBADO: return 'bg-emerald-500';
      case AuditStatus.OBSERVADO: return 'bg-orange-500';
      case AuditStatus.PENDIENTE: return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeActivityId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateEvidence(activeActivityId, reader.result as string);
        setActiveActivityId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (id: string) => {
    setActiveActivityId(id);
    fileInputRef.current?.click();
  };

  const handleAudit = (status: AuditStatus) => {
    if (!viewingActivity) return;
    onUpdateAudit(viewingActivity.id, {
      status,
      comment: auditComment
    });
    setViewingActivity(null);
    setAuditComment('');
  };

  const openViewer = (activity: Activity) => {
    setViewingActivity(activity);
    setAuditComment(activity.audit?.comment || '');
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
        <p className="text-gray-500 font-medium text-lg">No hay actividades planificadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-12">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
      
      {/* Enhanced Photo Viewer & Audit Modal */}
      {viewingActivity && viewingActivity.evidencia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md no-print" onClick={() => setViewingActivity(null)}>
          <div className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
              <img src={viewingActivity.evidencia} className="max-w-full max-h-full object-contain" alt="Evidencia fotográfica" />
            </div>
            
            <div className="w-full md:w-80 bg-white p-6 flex flex-col border-l">
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Auditoría Técnica</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{getTaskName(viewingActivity.tareaId)}</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Observaciones / Feedback</label>
                <textarea 
                  className={`w-full h-32 p-3 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${!canAudit ? 'bg-slate-50 text-slate-500 italic' : ''}`}
                  placeholder={canAudit ? "Escriba aquí los detalles de la revisión..." : "Sin comentarios del supervisor"}
                  value={auditComment}
                  onChange={(e) => setAuditComment(e.target.value)}
                  readOnly={!canAudit}
                />

                {viewingActivity.audit?.auditedBy && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Última Revisión:</p>
                    <p className="text-[10px] text-slate-700 font-bold">{viewingActivity.audit.auditedBy} - {viewingActivity.audit.auditedAt}</p>
                    <div className={`inline-block mt-2 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase ${getAuditStatusColor(viewingActivity.audit.status)}`}>
                      {viewingActivity.audit.status}
                    </div>
                  </div>
                )}
              </div>

              {canAudit ? (
                <div className="mt-6 flex flex-col gap-2">
                  <button 
                    onClick={() => handleAudit(AuditStatus.APROBADO)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    APROBAR EVIDENCIA
                  </button>
                  <button 
                    onClick={() => handleAudit(AuditStatus.OBSERVADO)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    NOTIFICAR OBSERVACIÓN
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setViewingActivity(null)}
                  className="mt-6 w-full bg-slate-800 text-white font-bold py-3 rounded-xl"
                >
                  CERRAR VISOR
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Proceso / Actividad</th>
              <th className="px-6 py-4">Asignado</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Evidencia</th>
              <th className="px-6 py-4 text-right no-print">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-700">{activity.fecha}</td>
                <td className="px-6 py-4">
                  <p className="text-[10px] text-blue-600 font-black uppercase mb-1">{getProcessName(activity.procesoId)}</p>
                  <p className="text-sm font-bold text-gray-800">{getTaskName(activity.tareaId)}</p>
                  {activity.audit?.comment && (
                    <p className="mt-1 text-[9px] font-medium bg-orange-50 text-orange-700 py-1 px-2 rounded-md border border-orange-100 inline-block">
                      <span className="font-black uppercase mr-1">Nota:</span> {activity.audit.comment}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                   <p className="text-xs font-bold text-gray-700">{activity.personalAsignado || 'Sin asignar'}</p>
                   <p className="text-[10px] text-gray-400">{activity.numPersonas} personas</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={activity.estado}
                    onChange={(e) => onUpdateStatus(activity.id, e.target.value as ActivityStatus)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border cursor-pointer outline-none transition-all ${getStatusColor(activity.estado)}`}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status} className="bg-white text-gray-800 normal-case">
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                   {activity.evidencia ? (
                     <div className="relative inline-block">
                       <button 
                         onClick={() => openViewer(activity)}
                         className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden shadow-sm hover:scale-110 transition-transform no-print ${activity.audit?.status === AuditStatus.APROBADO ? 'border-emerald-400' : activity.audit?.status === AuditStatus.OBSERVADO ? 'border-orange-400' : 'border-blue-300 animate-pulse'}`}
                       >
                         <img src={activity.evidencia} className="w-full h-full object-cover" />
                         <div className={`absolute inset-0 flex items-center justify-center bg-black/10`}>
                            {activity.audit?.status === AuditStatus.APROBADO ? (
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 filter drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                               </svg>
                            ) : activity.audit?.status === AuditStatus.OBSERVADO ? (
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 filter drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                               </svg>
                            ) : (
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               </svg>
                            )}
                         </div>
                       </button>
                       {/* Floating Indicator for Mobile */}
                       {activity.audit?.status === AuditStatus.PENDIENTE && (
                         <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>
                       )}
                     </div>
                   ) : (
                     <button 
                       onClick={() => triggerUpload(activity.id)}
                       className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center no-print"
                       title="Subir Foto de Evidencia"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                     </button>
                   )}
                </td>
                <td className="px-6 py-4 text-right no-print">
                  {userRole !== 'OPERADOR' && (
                    <button 
                      onClick={() => onDeleteActivity(activity.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Eliminar Registro"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
