'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShieldCheck, UserCheck, ArrowRight, Sparkles, Check, Lock, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultEmail?: string;
  initialMode?: 'student' | 'admin';
}

export function GoogleAuthModal({
  open,
  onOpenChange,
  onSuccess,
  defaultEmail = '',
  initialMode = 'student',
}: GoogleAuthModalProps) {
  const [mode, setMode] = useState<'student' | 'admin'>(initialMode);
  const [studentEmail, setStudentEmail] = useState(defaultEmail === 'vihan.agrawal4@gmail.com' ? '' : defaultEmail);
  const [studentName, setStudentName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset modal state whenever opened
  React.useEffect(() => {
    if (open) {
      if (defaultEmail === 'vihan.agrawal4@gmail.com' || initialMode === 'admin') {
        setMode('admin');
      } else {
        setMode('student');
      }
      setAdminPassword('');
    }
  }, [open, defaultEmail, initialMode]);

  async function handleStudentSignIn(email: string, name?: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid Google email address.');
      return;
    }
    if (cleanEmail === 'vihan.agrawal4@gmail.com') {
      toast.error('vihan.agrawal4@gmail.com is the restricted Administrator account. Please enter your Admin Password below.');
      setMode('admin');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: name || cleanEmail.split('@')[0] }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authentication failed.');

      toast.success(`Signed in as ${data.user.display_name} (${cleanEmail})`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not complete Google sign-in.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSignIn() {
    if (!adminPassword.trim()) {
      toast.error('Please enter the administrator password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vihan.agrawal4@gmail.com',
          name: 'Vihan Agrawal',
          password: adminPassword.trim(),
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || 'Administrator authentication failed.');

      toast.success('Signed in as Administrator (vihan.agrawal4@gmail.com)');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Incorrect administrator password. Access denied.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0C1222] border-2 border-slate-800 text-white rounded-2xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{mode === 'admin' ? 'Administrator Login' : 'Sign in with Google'}</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5 font-medium">
                {mode === 'admin'
                  ? 'Secure authentication for vihan.agrawal4@gmail.com'
                  : 'Access question papers, verified topper solutions & study decks'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#131B2E] p-1 border border-slate-800 my-2">
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'student'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={13} />
            <span>Student Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Admin Portal</span>
          </button>
        </div>

        {mode === 'student' ? (
          <div className="flex flex-col gap-3 my-2">
            {/* 1-Click Demo Student Option */}
            <div
              onClick={() => handleStudentSignIn('student.demo@gmail.com', 'Demo Student')}
              role="button"
              tabIndex={0}
              className="group p-3.5 rounded-xl border-2 border-slate-800 bg-[#131B2E] hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 font-black flex items-center justify-center shrink-0 text-sm">
                  ST
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Demo Student Account</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                      1-Click
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    student.demo@gmail.com
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Browse catalog, practice papers &amp; test questions
                  </span>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Custom Student Email Input */}
            <div className="p-3.5 rounded-xl border-2 border-slate-800/80 bg-[#0C1222] flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-300">
                Or sign in with your Google email:
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-[#131B2E] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
                />
                <button
                  disabled={loading || !studentEmail.includes('@')}
                  onClick={() => handleStudentSignIn(studentEmail, studentName)}
                  className="w-full sm:w-auto shrink-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Sign In</span>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Secure Administrator Login Form */
          <div className="flex flex-col gap-3.5 my-2">
            <div className="p-4 rounded-xl border-2 border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-[#131B2E] to-[#131B2E] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs shadow-md">
                  VA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Vihan Agrawal</span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/50 flex items-center gap-1">
                      <ShieldCheck size={11} /> Sole Administrator
                    </span>
                  </div>
                  <div className="text-xs text-orange-400/90 font-mono">
                    vihan.agrawal4@gmail.com
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-orange-400" />
                  <span>Admin Security Password:</span>
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdminSignIn();
                  }}
                  placeholder="Enter administrator password..."
                  className="w-full bg-[#0C1222] border border-orange-500/40 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                disabled={loading || !adminPassword.trim()}
                onClick={handleAdminSignIn}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Unlock Administrator Section</span>}
              </button>
            </div>
          </div>
        )}

        {/* Security Policy Notice */}
        <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
          <Lock size={14} className="text-orange-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Strict Security:</strong> Only <strong className="text-orange-300">vihan.agrawal4@gmail.com</strong> with the verified administrator security password can access site analytics and moderation. All students and other users are restricted to the student section.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
