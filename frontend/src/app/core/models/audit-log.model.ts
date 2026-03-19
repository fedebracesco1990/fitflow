export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export const AuditActionLabels: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Creación',
  [AuditAction.UPDATE]: 'Modificación',
  [AuditAction.DELETE]: 'Eliminación',
};

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  performedById: string | null;
  performedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}
