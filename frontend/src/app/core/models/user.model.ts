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
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}
