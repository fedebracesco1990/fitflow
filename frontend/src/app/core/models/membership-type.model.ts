export interface MembershipType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  gracePeriodDays: number;
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
}

export interface UpdateMembershipTypeRequest extends Partial<CreateMembershipTypeRequest> {
  isActive?: boolean;
}
