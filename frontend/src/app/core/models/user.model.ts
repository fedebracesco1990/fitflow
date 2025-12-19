export enum Role {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  USER = 'user',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberships?: Membership[];
}

interface Membership {
  id: string;
  status: string;
  endDate: string;
  membershipType?: {
    name: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}
