
import { Process, Task, ActivityStatus } from './types';

export const PROCESSES: Process[] = [
  { id: 'P1', name: 'Gestión de Residuos' },
  { id: 'P2', name: 'Tratamiento de Aguas' },
  { id: 'P3', name: 'Logística' }
];

export const TASKS: Task[] = [
  { id: 'T1', procesoId: 'P1', name: 'Recolección de Residuos' },
  { id: 'T2', procesoId: 'P1', name: 'Clasificación de Plásticos' },
  { id: 'T3', procesoId: 'P2', name: 'Mantenimiento de PTAR' },
  { id: 'T4', procesoId: 'P3', name: 'Ruta Zona Norte' }
];

// Fix: Exporting STATUS_OPTIONS based on the ActivityStatus enum for use in UI select components
export const STATUS_OPTIONS = Object.values(ActivityStatus);
