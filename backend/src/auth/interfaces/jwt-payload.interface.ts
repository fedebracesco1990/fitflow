import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
