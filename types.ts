
export type Role = 'ADMIN' | 'EMPLOYEE';
export type EmployeeType = 'REGULAR' | 'OUTSOURCED';
export type Language = 'EN' | 'KN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  employeeType: EmployeeType;
  position: string;
  joinDate: string;
  password?: string;
  birthday?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND';

export interface Attendance {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: AttendanceStatus;
  checkIn?: string; // Time string (HH:mm)
  checkOut?: string; // Time string (HH:mm)
}

export interface Holiday {
  date: string;
  name: string;
  type: 'PUBLIC' | 'RESTRICTED';
}

export type LeaveType = 'AL' | 'ML' | 'CL' | 'RH' | 'COMOFF' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveBalance {
  userId: string;
  al: number;
  ml: number;
  cl: number;
  rh: number;
  comoff: number;
  used: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  language: Language;
}
