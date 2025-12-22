import { AccessType } from './access-type.enum';

export interface MembershipType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  gracePeriodDays: number;
  accessType: AccessType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipTypeRequest {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  gracePeriodDays?: number;
  accessType: AccessType;
}

export interface UpdateMembershipTypeRequest extends Partial<CreateMembershipTypeRequest> {
  isActive?: boolean;
}
