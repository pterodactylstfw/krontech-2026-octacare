import { UserRole } from '../../core/enums/user-role.enum';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  department?: string;
}
