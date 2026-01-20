import { AdminDashboardDto } from './admin-dashboard.dto';
import { TrainerDashboardDto } from './trainer-dashboard.dto';

export type UnifiedDashboardDto = AdminDashboardDto | TrainerDashboardDto;
