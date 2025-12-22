import { MembershipType } from './membership-type.model';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  OTHER = 'other',
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.CARD]: 'Tarjeta',
  [PaymentMethod.TRANSFER]: 'Transferencia',
  [PaymentMethod.OTHER]: 'Otro',
};

export interface Payment {
  id: string;
  membershipId: string;
  membership?: {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    status: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    membershipType?: MembershipType;
  };
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  coverageStart: string;
  coverageEnd: string;
  reference: string | null;
  notes: string | null;
  registeredById: string;
  registeredBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  membershipId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  coverageStartDate: string;
  coverageEndDate: string;
  reference?: string;
  notes?: string;
}

export type UpdatePaymentDto = Partial<CreatePaymentDto>;
