
import React from 'react';
import { AppNotification, ActivityStatus } from '../types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll,
  onClose 
}) => {
  return (
    <div className="absolute top-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in slide-in-from-top-4 duration-200">
      <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alertas de Supervisión</h3>
        <button onClick={onClearAll} className="text-[10px] font-bold text-blue-600 hover:text-blue-800">Limpiar Todo</button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sin alertas pendientes</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 hover:bg-slate-50 transition-colors relative cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => onMarkAsRead(notif.id)}
              >
                {!notif.read && <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full"></div>}
                <div className="flex gap-3">
                  <div className={`mt-1 p-1.5 rounded-lg shrink-0 ${notif.status === ActivityStatus.REPROGRAMADO ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                    {notif.status === ActivityStatus.REPROGRAMADO ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight mb-1">{notif.activityName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Fue <span className="font-bold uppercase">{notif.status}</span> por <span className="text-blue-600">{notif.user}</span></p>
                    <p className="text-[9px] text-slate-400 mt-2 font-mono uppercase">{notif.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-white border-t text-center">
        <button onClick={onClose} className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-tighter">Cerrar Panel</button>
      </div>
    </div>
  );
};
