
import { User, LeaveBalance, AttendanceStatus, Holiday, EmployeeType } from './types';

const today = new Date();
const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

export const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    name: 'System Admin', 
    email: 'admin@ksndmcflow.com', 
    role: 'ADMIN', 
    employeeType: 'REGULAR',
    position: 'Operations Manager', 
    joinDate: '2025-01-01',
    password: 'admin123',
    birthday: '1985-05-15'
  },
  { 
    id: '2', 
    name: 'Jane Doe', 
    email: 'jane.doe@ksndmcflow.com', 
    role: 'EMPLOYEE', 
    employeeType: 'REGULAR',
    position: 'Software Engineer', 
    joinDate: '2025-06-15',
    password: 'pass123',
    birthday: todayFormatted
  },
  { 
    id: '3', 
    name: 'John Smith', 
    email: 'john.smith@ksndmcflow.com', 
    role: 'EMPLOYEE', 
    employeeType: 'REGULAR',
    position: 'Product Designer', 
    joinDate: '2025-03-10',
    password: 'pass123',
    birthday: '1992-11-20'
  },
  { 
    id: '4', 
    name: 'Alice Wong', 
    email: 'alice.w@ksndmcflow.com', 
    role: 'EMPLOYEE', 
    employeeType: 'OUTSOURCED', 
    position: 'HR Specialist', 
    joinDate: '2025-08-20',
    password: 'pass123',
    birthday: '1995-02-14'
  },
];

export const GOK_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day", type: 'PUBLIC' },
  { date: '2026-01-14', name: 'Makara Sankranti', type: 'PUBLIC' },
  { date: '2026-01-26', name: 'Republic Day', type: 'PUBLIC' },
  { date: '2026-02-15', name: 'Maha Shivaratri', type: 'PUBLIC' },
  { date: '2026-03-19', name: 'Ugadi', type: 'PUBLIC' },
  { date: '2026-04-01', name: 'Ambedkar Jayanti', type: 'PUBLIC' },
  { date: '2026-04-05', name: 'Good Friday', type: 'PUBLIC' },
  { date: '2026-05-01', name: 'May Day', type: 'PUBLIC' },
  { date: '2026-08-15', name: 'Independence Day', type: 'PUBLIC' },
  { date: '2026-08-27', name: 'Ganesh Chaturthi', type: 'PUBLIC' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'PUBLIC' },
  { date: '2026-10-21', name: 'Ayudha Pooja', type: 'PUBLIC' },
  { date: '2026-10-22', name: 'Vijayadashami', type: 'PUBLIC' },
  { date: '2026-11-01', name: 'Kannada Rajyotsava', type: 'PUBLIC' },
  { date: '2026-11-08', name: 'Deepavali', type: 'PUBLIC' },
  { date: '2026-12-25', name: 'Christmas', type: 'PUBLIC' },
];

/**
 * Detects if a date is a special leave day.
 * Rules:
 * - Regular (Insource): Sun, 2nd Sat, 4th Sat, GOK Holidays = Auto Label.
 * - Outsource: Manual for everything.
 */
export const getSpecialDayInfo = (dateStr: string, employeeType: EmployeeType) => {
  // Outsource employees have manual entry for everything (no auto-holidays)
  if (employeeType === 'OUTSOURCED') return null;

  const date = new Date(dateStr);
  const day = date.getDay(); // 0: Sun, 6: Sat
  const dateOfMonth = date.getDate();
  const weekNum = Math.ceil(dateOfMonth / 7);

  // Check GOK Holidays
  const holiday = GOK_HOLIDAYS_2026.find(h => h.date === dateStr);
  if (holiday) return { type: 'HOLIDAY', name: holiday.name };

  // Check Sunday
  if (day === 0) return { type: 'WEEKEND', name: 'Sunday' };

  // Check 2nd and 4th Saturday
  if (day === 6) {
    if (weekNum === 2) return { type: 'WEEKEND', name: '2nd Saturday' };
    if (weekNum === 4) return { type: 'WEEKEND', name: '4th Saturday' };
  }

  return null;
};

export const DEFAULT_LEAVE_BALANCE: Omit<LeaveBalance, 'userId'> = {
  al: 15, // Earned Leave
  ml: 10, // Sick Leave
  cl: 8,
  rh: 2,
  comoff: 0,
  used: 0,
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  ON_LEAVE: 'On Leave',
  HOLIDAY: 'Holiday',
  WEEKEND: 'Weekend Off',
};

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ABSENT: 'bg-rose-100 text-rose-700 border-rose-200',
  LATE: 'bg-amber-100 text-amber-700 border-amber-200',
  ON_LEAVE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  HOLIDAY: 'bg-slate-100 text-slate-700 border-slate-200',
  WEEKEND: 'bg-slate-50 text-slate-500 border-slate-100',
};
