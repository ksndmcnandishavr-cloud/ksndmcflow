
import React, { useState, useEffect } from 'react';
import { User, Attendance, LeaveRequest, LeaveBalance, AppState, Role, Language } from './types.ts';
import { INITIAL_USERS, DEFAULT_LEAVE_BALANCE, GOK_HOLIDAYS_2026 } from './constants.ts';
import AdminDashboard from './components/AdminDashboard.tsx';
import EmployeeDashboard from './components/EmployeeDashboard.tsx';
import LoginPage from './components/LoginPage.tsx';
import { LogOut, Activity, Languages, Database, Cloud } from 'lucide-react';
import { translations } from './services/translationService.ts';
import { db } from './services/firebaseService.ts';
import { ref, onValue, set, update, remove } from 'firebase/database';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    attendance: [],
    leaveRequests: [],
    leaveBalances: {},
    language: 'EN'
  });

  const t = translations[state.language];

  // Cloud Sync Effect (Realtime Database)
  useEffect(() => {
    setIsLoading(true);

    const usersRef = ref(db, 'users');
    const attendanceRef = ref(db, 'attendance');
    const leaveRequestsRef = ref(db, 'leaveRequests');
    const leaveBalancesRef = ref(db, 'leaveBalances');

    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const users: User[] = data ? Object.values(data) : [];
      setState(prev => ({ ...prev, users }));
      
      // Seed if empty
      if (users.length === 0 && !isSeeding) {
        seedDatabase();
      }
    });

    const unsubAttendance = onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      const attendance: Attendance[] = data ? Object.values(data) : [];
      setState(prev => ({ ...prev, attendance }));
    });

    const unsubLeaveRequests = onValue(leaveRequestsRef, (snapshot) => {
      const data = snapshot.val();
      const leaveRequests: LeaveRequest[] = data ? Object.values(data) : [];
      setState(prev => ({ ...prev, leaveRequests }));
    });

    const unsubLeaveBalances = onValue(leaveBalancesRef, (snapshot) => {
      const data = snapshot.val();
      const leaveBalances: Record<string, LeaveBalance> = data || {};
      setState(prev => ({ ...prev, leaveBalances }));
      setIsLoading(false);
    });

    return () => {
      unsubUsers();
      unsubAttendance();
      unsubLeaveRequests();
      unsubLeaveBalances();
    };
  }, []);

  const seedDatabase = async () => {
    try {
      setIsSeeding(true);
      console.log("Seeding database with initial records...");
      
      const updates: any = {};
      
      INITIAL_USERS.forEach(user => {
        updates[`users/${user.id}`] = user;
        updates[`leaveBalances/${user.id}`] = { ...DEFAULT_LEAVE_BALANCE, userId: user.id };
      });

      await update(ref(db), updates);
      console.log("Database seeded successfully.");
    } catch (e) {
      console.error("Error seeding database:", e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogin = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const toggleLanguage = () => {
    setState(prev => ({ 
      ...prev, 
      language: prev.language === 'EN' ? 'KN' : 'EN' 
    }));
  };

  // Realtime Database Write Operations

  const updateAttendance = async (newAttendance: Attendance[]) => {
    try {
      const updates: any = {};
      newAttendance.forEach(att => {
        updates[`attendance/${att.id}`] = att;
      });
      await update(ref(db), updates);
    } catch (e) {
      console.error("Error updating attendance:", e);
    }
  };

  const submitLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const newRequest: LeaveRequest = {
        ...request,
        id,
        status: 'PENDING',
        appliedDate: new Date().toISOString(),
      };
      await set(ref(db, `leaveRequests/${id}`), newRequest);
    } catch (e) {
      console.error("Error submitting leave request:", e);
    }
  };

  const updateLeaveStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const req = state.leaveRequests.find(r => r.id === id);
      if (!req) return;

      const updates: any = {};
      
      // Update the request status
      updates[`leaveRequests/${id}/status`] = status;

      if (status === 'APPROVED') {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        
        const currentBalance = state.leaveBalances[req.userId] || { ...DEFAULT_LEAVE_BALANCE, userId: req.userId };
        const updatedBalance = { ...currentBalance };

        switch (req.type) {
          case 'AL': updatedBalance.al -= days; break;
          case 'ML': updatedBalance.ml -= days; break;
          case 'CL': updatedBalance.cl -= days; break;
          case 'RH': updatedBalance.rh -= days; break;
          case 'COMOFF': updatedBalance.comoff -= days; break;
        }
        updatedBalance.used += days;

        // Update balance
        updates[`leaveBalances/${req.userId}`] = updatedBalance;

        // Add attendance records
        for (let i = 0; i < days; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const isHoliday = GOK_HOLIDAYS_2026.some(h => h.date === dateStr);
          
          const attId = Math.random().toString(36).substr(2, 9);
          updates[`attendance/${attId}`] = {
            id: attId,
            userId: req.userId,
            date: dateStr,
            status: isHoliday ? 'HOLIDAY' : 'ON_LEAVE'
          };
        }
      }

      await update(ref(db), updates);
    } catch (e) {
      console.error("Error processing leave request:", e);
    }
  };

  const addUser = async (user: User, initialBalance?: Partial<LeaveBalance>) => {
    try {
      const updates: any = {};
      
      // Add user
      updates[`users/${user.id}`] = user;

      // Add balance
      updates[`leaveBalances/${user.id}`] = {
        userId: user.id,
        al: initialBalance?.al ?? 15,
        ml: initialBalance?.ml ?? 10,
        cl: initialBalance?.cl ?? 8,
        rh: initialBalance?.rh ?? 2,
        comoff: initialBalance?.comoff ?? 0,
        used: 0
      };

      await update(ref(db), updates);
    } catch (e) {
      console.error("Error adding user:", e);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>, balanceUpdates: Partial<LeaveBalance>) => {
    try {
      const dbUpdates: any = {};
      
      // User updates
      Object.entries(updates).forEach(([key, value]) => {
        dbUpdates[`users/${userId}/${key}`] = value;
      });

      // Balance updates
      Object.entries(balanceUpdates).forEach(([key, value]) => {
        dbUpdates[`leaveBalances/${userId}/${key}`] = value;
      });

      await update(ref(db), dbUpdates);
    } catch (e) {
      console.error("Error updating user:", e);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === '1') return; // Protect admin
    try {
      const dbUpdates: any = {};
      dbUpdates[`users/${userId}`] = null;
      dbUpdates[`leaveBalances/${userId}`] = null;
      // We could also delete attendance and leave requests if we wanted deep cleanup
      
      await update(ref(db), dbUpdates);
    } catch (e) {
      console.error("Error deleting user:", e);
    }
  };

  const updateBalance = async (userId: string, balance: Partial<LeaveBalance>) => {
    try {
      const dbUpdates: any = {};
      Object.entries(balance).forEach(([key, value]) => {
        dbUpdates[`leaveBalances/${userId}/${key}`] = value;
      });
      await update(ref(db), dbUpdates);
    } catch (e) {
      console.error("Error updating balance:", e);
    }
  };

  if (isLoading || isSeeding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl animate-pulse">
            <Activity className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">KsndmcFlow</h2>
          <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
            <span>{isSeeding ? "Seeding Realtime Database..." : "Syncing to Firebase..."}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <LoginPage users={state.users} onLogin={handleLogin} language={state.language} onLanguageToggle={toggleLanguage} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-100 selection:text-brand-900">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-100 transition-all group-hover:rotate-6">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-brand-600 tracking-tighter">{t.systemName}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-white hover:shadow-md transition-all uppercase tracking-widest"
            >
              <Languages size={14} className="text-brand-500" />
              <span>{state.language === 'EN' ? 'KN' : 'EN'}</span>
            </button>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 leading-none">{state.currentUser.name}</span>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider mt-1">{state.currentUser.position}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title={t.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {state.currentUser.role === 'ADMIN' ? (
          <AdminDashboard 
            state={state} 
            updateAttendance={updateAttendance} 
            updateLeaveStatus={updateLeaveStatus}
            addUser={addUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
            updateBalance={updateBalance}
          />
        ) : (
          <EmployeeDashboard 
            state={state} 
            submitLeaveRequest={submitLeaveRequest}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 opacity-60">
                <Activity size={18} className="text-brand-600" />
                <span className="text-sm font-black tracking-tight text-slate-900">KsndmcFlow</span>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <Cloud size={10} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">RTDB Connected</span>
               </div>
               <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  &copy; 2026 Ksndmc. Precision workforce governance.
               </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
