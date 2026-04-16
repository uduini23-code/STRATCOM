export interface Update {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  category?: EventType;
}

export type EventType = 'ADMIN COVERAGE' | 'STUDENT COVERAGE' | 'PROJECT' | 'CAPACITY BUILDING';
export type DepartmentType = 'Multimedia' | 'Graphics';
export type RequestType = 'Design Request' | 'Pubmat Checking' | 'Approval';

export interface ClientRequest {
  id: string;
  title: string;
  department: DepartmentType;
  eventType?: EventType;
  requestType?: RequestType;
  date: string;
  time: string;
  venue: string;
  description: string;
  clientName: string;
  clientEmail: string;
  status: 'pending_scosec' | 'submitted_to_scodir' | 'rejected_by_scosec';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  time: string;
  venue: string;
  description: string;
  createdAt: string;
  department?: DepartmentType;
  eventType?: EventType;
  requestType?: RequestType;
  assignedTo?: string[];
  attachments?: { name: string; data: string }[];
  status?: 'pending' | 'approved' | 'rejected';
}

export type UserRole = 'admin' | 'viewer' | null;

export interface AppNotification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
  username?: string;
  canManageEvents?: boolean;
  canManageUpdates?: boolean;
  canApproveEvents?: boolean;
}
