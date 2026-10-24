'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShieldCheck, UserCheck, ArrowRight, Sparkles, Check, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultEmail?: string;
}

export function GoogleAuthModal({ open, onOpenChange, onSuccess, defaultEmail = '' }: GoogleAuthModalProps) {
  const [customEmail, setCustomEmail] = useState(defaultEmail);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'student' | 'custom'>('admin');

  async function handleGoogleSignIn(email: string, name?: string) {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid Google email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || (email === 'vihan.agrawal4@gmail.com' ? 'Vihan Agrawal' : email.split('@')[0]) }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authentication failed.');

      const isAdmin = email.toLowerCase() === 'vihan.agrawal4@gmail.com';
      if (isAdmin) {
        toast.success('Signed in as Administrator (vihan.agrawal4@gmail.com)');
      } else {
        toast.success(`Signed in as ${data.user.display_name} (${email})`);
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        if (isAdmin && window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not complete Google sign-in.');
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
                <span>Sign in with Google</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5 font-medium">
                Choose your Google account to access your section
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 my-3">
          {/* Admin Account Option */}
          <div
            onClick={() => handleGoogleSignIn('vihan.agrawal4@gmail.com', 'Vihan Agrawal')}
            role="button"
            tabIndex={0}
            className="group p-3.5 rounded-xl border-2 border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-[#131B2E] to-[#131B2E] hover:border-orange-500 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm shadow-md">
                VA
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">Vihan Agrawal</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/50 flex items-center gap-1">
                    <ShieldCheck size={11} /> Admin Only
                  </span>
                </div>
                <span className="text-xs text-orange-400/90 font-mono font-medium">
                  vihan.agrawal4@gmail.com
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Full Analytics Dashboard, Traffic &amp; Moderation
                </span>
              </div>
            </div>
            <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          {/* Normal Student Account Option */}
          <div
            onClick={() => handleGoogleSignIn('student.demo@gmail.com', 'Demo Student')}
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
                  <span className="font-extrabold text-white text-sm">Demo Student</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    Normal User
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  student.demo@gmail.com
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Question papers, topper solutions &amp; study deck
                </span>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          {/* Custom Google Email Option */}
          <div className="p-3.5 rounded-xl border-2 border-slate-800/80 bg-[#0C1222] flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-300">
              Or enter any Google account:
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full bg-[#131B2E] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
              />
              <button
                disabled={loading || !customEmail.includes('@')}
                onClick={() => handleGoogleSignIn(customEmail, customName)}
                className="w-full sm:w-auto shrink-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Continue</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-[#131B2E] border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
          <Lock size={14} className="text-orange-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Role Policy:</strong> Only <strong className="text-orange-300">vihan.agrawal4@gmail.com</strong> is granted Administrator privileges and access to site analytics. All other Google accounts access the normal student section.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
