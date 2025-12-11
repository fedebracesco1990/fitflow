export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  GRACE_PERIOD = 'grace_period',
}

export const MembershipStatusLabels: Record<MembershipStatus, string> = {
  [MembershipStatus.ACTIVE]: 'Activa',
  [MembershipStatus.EXPIRED]: 'Vencida',
  [MembershipStatus.CANCELLED]: 'Cancelada',
  [MembershipStatus.GRACE_PERIOD]: 'En gracia',
};

export interface Membership {
  id: string;
  userId: string;
  membershipTypeId: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  notes: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  membershipType?: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipRequest {
  userId: string;
  membershipTypeId: string;
  startDate?: string;
  notes?: string;
}

export interface UpdateMembershipRequest {
  startDate?: string;
  endDate?: string;
  status?: MembershipStatus;
  notes?: string;
}
