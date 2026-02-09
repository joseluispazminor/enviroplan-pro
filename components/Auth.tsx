import React, { useState } from 'react';
import { UserRole } from '../types';
import { isCloudEnabled, signIn, signUp } from '../supabase';

interface AuthProps {
  onLogin: (username: string, role: UserRole) => void;
}

type AuthMode = 'login' | 'register' | 'recover';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('OPERADOR');
  const [loading, setLoading] = useState(false);

  const isCloud = isCloudEnabled();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isCloud) {
      if (mode === 'login' || mode === 'register') {
        onLogin(username || email.split('@')[0] || 'Usuario Local', role);
      } else {
        alert('Se ha enviado un correo de recuperación (Simulado).');
        setMode('login');
      }
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        
        // Comprobación explícita para satisfacer a TypeScript estricto
        if (data && data.user) {
          const metadata = data.user.user_metadata;
          onLogin(
            metadata?.display_name || email.split('@')[0], 
            (metadata?.role as UserRole) || 'OPERADOR'
          );
        } else {
          throw new Error("No se pudieron obtener los datos del usuario.");
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, role, username);
        if (error) throw error;
        alert('¡Cuenta creada! Revisa tu email para confirmar y luego inicia sesión.');
        setMode('login');
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Ocurrió un problema'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-800 mb-1 uppercase tracking-tighter">EnviroPlan</h2>
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
            {isCloud ? 'Acceso Cloud Seguro' : 'Acceso Local (Sin Nube)'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Ej: Juan Pérez"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Email / Usuario</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {mode !== 'recover' && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {(mode === 'register' || (!isCloud && mode === 'login')) && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Rol de Acceso</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ADMIN', 'SUPERVISOR', 'OPERADOR'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 text-[9px] font-black rounded-lg border transition-all ${role === r ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 hover:bg-black text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-95 mt-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : 'Enviar Instrucciones'
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col space-y-3 text-center">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('register')} className="text-[10px] font-bold text-blue-600 hover:underline uppercase">¿No tienes cuenta? Regístrate aquí</button>
                <button onClick={() => setMode('recover')} className="text-[10px] font-bold text-slate-400 hover:underline uppercase tracking-tighter">¿Olvidaste tu contraseña?</button>
              </>
            ) : (
              <button onClick={() => setMode('login')} className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Ya tengo cuenta. Volver al inicio</button>
            )}
          </div>
        </div>
        
        {isCloud && (
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servidor EnviroPlan Conectado</span>
          </div>
        )}
      </div>
    </div>
  );
};