
import React, { useState } from 'react';
import { User, Language } from '../types.ts';
import { ShieldCheck, User as UserIcon, AlertCircle, ArrowRight, Activity, Sparkles, Languages } from 'lucide-react';
import { translations } from '../services/translationService.ts';

interface Props {
  users: User[];
  onLogin: (userId: string) => void;
  language: Language;
  onLanguageToggle: () => void;
}

const LoginPage: React.FC<Props> = ({ users, onLogin, language, onLanguageToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
        onLogin(user.id);
      } else {
        setError(language === 'EN' ? 'Invalid credentials. Access denied.' : 'ತಪ್ಪಾದ ರುಜುವಾತುಗಳು. ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-slate-50">
      <div className="max-w-6xl w-full flex bg-white rounded-[64px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative z-10 min-h-[780px]">
        {/* Left Branding Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] p-20 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
          <div className="absolute -bottom-24 -left-24 w-full h-full bg-indigo-600/5 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-20">
              <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-600/30 ring-8 ring-indigo-600/10">
                <Activity className="text-white" size={36} />
              </div>
              <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{t.systemName}</span>
            </div>
            <h1 className="text-7xl xl:text-8xl font-black leading-[0.95] mb-10 tracking-tighter">
              Precision for <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">the Future.</span>
            </h1>
            <p className="text-slate-400 text-2xl font-medium leading-relaxed max-w-md">
              A high-aesthetic, intelligent workforce operating system designed for enterprise-grade agility at Ksndmc.
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-4 opacity-50">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Core Node Active</span>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full lg:w-1/2 p-10 md:p-24 flex flex-col justify-center bg-white relative">
          <button 
            onClick={onLanguageToggle} 
            className="absolute top-12 right-12 flex items-center space-x-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-white hover:shadow-2xl transition-all uppercase tracking-widest"
          >
            <Languages size={18} className="text-indigo-600" />
            <span>{language === 'EN' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          <div className="mb-16 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100/50 shadow-sm">
              <Sparkles size={14} className="animate-pulse" />
              <span>Governance v2.0 Jan 2026</span>
            </div>
            <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">
              {t.systemGateway}
            </h2>
            <p className="text-slate-400 font-bold text-xl">{t.identityVerification}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-5">
              <label className="text-[11px] font-black text-slate-500 ml-2 uppercase tracking-[0.2em]">{t.identityLabel}</label>
              <div className="relative group">
                <UserIcon size={22} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@ksndmc.com" 
                  className="w-full pl-16 pr-8 py-7 bg-slate-50 border border-slate-100 rounded-[40px] text-lg font-bold focus:ring-[12px] focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.accessKey}</label>
                <button type="button" className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">{t.resetSecret}</button>
              </div>
              <div className="relative group">
                <ShieldCheck size={22} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full pl-16 pr-8 py-7 bg-slate-50 border border-slate-100 rounded-[40px] text-lg font-bold focus:ring-[12px] focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-sm" 
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-5 p-7 bg-rose-50 text-rose-600 border border-rose-100 rounded-[40px] text-base font-bold animate-in fade-in slide-in-from-top-4">
                <div className="bg-rose-100 p-3 rounded-2xl shadow-sm"><AlertCircle size={24} className="flex-shrink-0" /></div>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-black py-8 rounded-[40px] shadow-2xl shadow-indigo-100/50 flex items-center justify-center space-x-5 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin relative z-10"></div>
              ) : (
                <div className="flex items-center space-x-5 relative z-10">
                  <span className="text-3xl tracking-tighter">{t.authenticate}</span>
                  <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
