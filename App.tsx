import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { PlanningForm } from './components/PlanningForm';
import { PlanningTable } from './components/PlanningTable';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ConfigModal } from './components/ConfigModal';
import { Activity, User, Process, Task, ActivityStatus, UserRole, AuditStatus, ActivityAudit } from './types';
import { PROCESSES as DEFAULT_PROCESSES, TASKS as DEFAULT_TASKS } from './constants';
import { isCloudEnabled, fetchFromCloud, syncToCloud } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'planning' | 'dashboard'>('planning');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      // Cargar Usuario
      const savedUser = localStorage.getItem('pa_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      // Cargar Catálogos
      const savedProcs = localStorage.getItem('pa_processes');
      const savedTks = localStorage.getItem('pa_tasks');
      setProcesses(savedProcs ? JSON.parse(savedProcs) : DEFAULT_PROCESSES);
      setTasks(savedTks ? JSON.parse(savedTks) : DEFAULT_TASKS);

      // Cargar Actividades
      if (isCloudEnabled()) {
        const cloudData = await fetchFromCloud('activities');
        if (cloudData) {
          setActivities(cloudData.map((row: any) => row.data));
        }
      } else {
        const localData = localStorage.getItem('pa_activities');
        if (localData) setActivities(JSON.parse(localData));
      }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleLogin = (username: string, role: UserRole) => {
    const newUser = { username, role, isAuthenticated: true };
    setUser(newUser);
    localStorage.setItem('pa_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pa_user');
  };

  const saveActivities = (updated: Activity[]) => {
    setActivities(updated);
    localStorage.setItem('pa_activities', JSON.stringify(updated));
    if (isCloudEnabled()) {
      updated.forEach(a => syncToCloud('activities', a.id, a));
    }
  };

  const addActivity = (activity: Activity) => saveActivities([activity, ...activities]);
  const deleteActivity = (id: string) => {
    if(confirm('¿Seguro que desea eliminar este registro?')) {
      saveActivities(activities.filter(a => a.id !== id));
    }
  };
  
  const updateActivityStatus = (id: string, newStatus: ActivityStatus) => {
    saveActivities(activities.map(a => a.id === id ? { ...a, estado: newStatus } : a));
  };

  const updateActivityEvidence = (id: string, base64: string) => {
    saveActivities(activities.map(a => a.id === id ? { 
      ...a, 
      evidencia: base64, 
      estado: ActivityStatus.EJECUTADO,
      audit: { status: AuditStatus.PENDIENTE }
    } : a));
  };

  const updateActivityAudit = (id: string, audit: ActivityAudit) => {
    saveActivities(activities.map(a => a.id === id ? { 
      ...a, 
      audit: { ...audit, auditedBy: user?.username, auditedAt: new Date().toLocaleString() } 
    } : a));
  };

  if (!user) return <Auth onLogin={handleLogin} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-40 no-print shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-xl text-white font-black text-xl shadow-lg shadow-blue-200">E</div>
          <div>
            <h1 className="font-black text-slate-800 tracking-tighter leading-none">ENVIROPLAN</h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Control Operativo</span>
          </div>
        </div>
        
        <nav className="hidden md:flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setView('planning')} className={`px-6 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'planning' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>AGENDA</button>
          <button onClick={() => setView('dashboard')} className={`px-6 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>DASHBOARD IA</button>
        </nav>

        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <button onClick={() => setIsConfigOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          )}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{user.role}</span>
            <span className="text-xs font-bold text-slate-800">{user.username}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden flex bg-white border-b p-1 justify-center gap-2 no-print">
        <button onClick={() => setView('planning')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg ${view === 'planning' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Agenda</button>
        <button onClick={() => setView('dashboard')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Dashboard IA</button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 pb-20">
        {view === 'planning' ? (
          <>
            {user.role !== 'OPERADOR' && <PlanningForm onAddActivity={addActivity} processes={processes} tasks={tasks} />}
            <PlanningTable 
              activities={activities} 
              onDeleteActivity={deleteActivity} 
              onUpdateStatus={updateActivityStatus} 
              onUpdateEvidence={updateActivityEvidence}
              onUpdateAudit={updateActivityAudit}
              processes={processes} 
              tasks={tasks} 
              userRole={user.role} 
            />
          </>
        ) : (
          <ResultsDashboard activities={activities} processes={processes} tasks={tasks} />
        )}
      </main>

      <ConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        processes={processes} 
        tasks={tasks} 
        onUpdateProcesses={(p) => { setProcesses(p); localStorage.setItem('pa_processes', JSON.stringify(p)); }} 
        onUpdateTasks={(t) => { setTasks(t); localStorage.setItem('pa_tasks', JSON.stringify(t)); }} 
      />
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 text-center no-print">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">EnviroPlan Pro v2.1 • {isCloudEnabled() ? 'Cloud Sync Activo' : 'Local Storage'}</p>
      </footer>
    </div>
  );
};

export default App;