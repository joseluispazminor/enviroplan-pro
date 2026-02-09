export enum ActivityStatus {
  PLANEADO = 'Planeado',
  EJECUTADO = 'Ejecutado',
  CANCELADO = 'Cancelado',
  REPROGRAMADO = 'Reprogramado'
}

export enum AuditStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  OBSERVADO = 'Observado'
}

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';

export interface User {
  username: string;
  role: UserRole;
  isAuthenticated: boolean;
}

export interface Process {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  procesoId: string;
  name: string;
}

export interface ActivityAudit {
  status: AuditStatus;
  comment?: string;
  auditedBy?: string;
  auditedAt?: string;
}

export interface Activity {
  id: string;
  fecha: string;
  procesoId: string;
  tareaId: string;
  recursos: string;
  numPersonas: number;
  personalAsignado: string;
  estado: ActivityStatus;
  evidencia?: string;
  audit?: ActivityAudit;
}

export interface AppNotification {
  id: string;
  activityId: string;
  activityName: string;
  timestamp: string;
  status: ActivityStatus;
  read: boolean;
  user: string;
}