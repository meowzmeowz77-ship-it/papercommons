'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
  Crown,
  Bot
} from 'lucide-react';
import { User } from '@/lib/types';
import { api, date } from '@/lib/client';
import { track } from '@/lib/analytics-client';
import { toast } from 'sonner';
import { ProPassModal } from './pro-modals';

export function PremiumPage({ user }: { user?: User }) {
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [proModal, setProModal] = useState(false);

  useEffect(() => {
    let live = true;
    api('premium')
      .then((d) => {
        if (live) setInfo(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [user?.id, user?.plan, user?.premium_until]);

  async function handleInstantPass() {
    setBusy(true);
    try {
      const res = await fetch('/api/billing/instant-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data: any = await res.json();
      if (data.ok) {
        toast.success('👑 30-Day PaperVault PRO Pass Activated! Enjoy full access.', { duration: 5000 });
        setTimeout(() => location.reload(), 800);
      } else {
        toast.error(data.error || 'Activation failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Activation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="premium-page max-w-5xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="premium-hero bg-gradient-to-br from-[#0C1222] via-[#131B2E] to-[#070B14] p-6 sm:p-10 rounded-3xl border-2 border-amber-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider mb-3">
            <Crown size={14} className="text-amber-400" /> PaperVault PRO Membership
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            The Topper Practice Vault &amp; AI Examiner
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-xl font-medium">
            Unlock official CBSE &amp; Board marking schemes, handwritten topper answer copies, and automated AVK step-by-step answer sheet checking.
          </p>
        </div>

        <div className="premium-price bg-[#070B14] p-5 rounded-2xl border border-amber-500/50 flex flex-col items-center justify-center shrink-0 text-center">
          <div className="text-4xl font-black text-white tracking-tight">
            ₹299<small className="text-xs text-slate-400 font-semibold"> / month</small>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1">
            <CheckCircle2 size={12} /> Razorpay UPI &amp; Cards Enabled
          </span>
          <button
            onClick={() => setProModal(true)}
            className="mt-3 w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap size={14} className="fill-slate-950" />
            <span>{info?.active ? 'Manage Plan' : 'Upgrade to PRO'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="status-banner mb-6" role="alert">
          We couldn’t load your access status.{' '}
          <button className="text-btn" onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      )}

      {/* Access Status Card */}
      <section
        className={`premium-status panel bg-[#0C1222] border-2 ${
          info?.active ? 'border-emerald-500/60 bg-[#0c1a17]' : 'border-slate-800'
        } p-6 rounded-2xl shadow-xl flex items-start gap-4 mb-8`}
        aria-live="polite"
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            info?.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {info?.active ? <CheckCircle2 size={26} /> : <LockKeyhole size={26} />}
        </div>
        <div className="premium-status-copy flex-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
            {info?.admin_preview ? 'ADMINISTRATOR PRIVILEGES' : info?.active ? 'PRO MEMBERSHIP ACTIVE' : 'FREE STUDENT TIER'}
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">
            {info?.admin_preview
              ? 'Administrator Lifetime Access Granted'
              : info?.active
              ? 'Your PaperVault PRO Pass is Active!'
              : 'Upgrade to PRO to unlock topper papers & AI checker.'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {info?.admin_preview
              ? 'Full unlimited privileges to all topper papers, marking schemes, AVK AI checking engine, and moderation controls.'
              : info?.active
              ? `PRO access active until ${date(info.premium_until)}. Enjoy unrestricted topper solutions and AVK answer sheet checking.`
              : 'Free community papers and practice question sheets remain 100% free forever for all students.'}
          </p>
          {!info?.active && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setProModal(true)}
                className="btn primary text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Crown size={14} /> Pay ₹299 (Razorpay Checkout)
              </button>
              <button
                onClick={handleInstantPass}
                disabled={busy}
                className="btn text-xs font-black py-2 px-4 rounded-xl bg-[#131B2E] border border-amber-500/40 text-amber-300 hover:bg-[#1E293B] flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} /> {busy ? 'Activating…' : 'Activate 30-Day Instant Pass'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid: Member Papers & AVK AI Step Evaluator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <section className="panel bg-[#0C1222] border-2 border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen size={20} className="text-orange-400" />
              <span>Topper Model Solutions</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Verified line-by-step marking schemes and handwritten answer scripts prepared by 99.8% state board toppers.
            </p>
            <div className="my-4 p-4 rounded-xl bg-[#131B2E] border border-slate-800 flex items-center justify-between">
              <div>
                <b className="text-2xl font-black text-white">{info?.papers_count ?? '12+'}</b>
                <span className="block text-xs text-slate-400">Exclusive PRO Papers &amp; Solution Decks</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs">
                Verified
              </span>
            </div>
          </div>
          <a className="btn primary text-xs font-black py-2.5 px-4 rounded-xl inline-flex items-center justify-center gap-2" href="/explore?access=premium">
            <span>Browse Topper Papers</span>
            <ArrowRight size={15} />
          </a>
        </section>

        <section className="panel bg-[#0C1222] border-2 border-cyan-500/40 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bot size={20} className="text-cyan-400" />
                <span>AVK AI Step Evaluator</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Upload photos or text of your handwritten answer sheet. The AVK evaluation engine validates formula statements, sign conventions, and S.I. units against official board keys.
            </p>
            <div className="my-4 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200">
              <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                <Sparkles size={13} /> Features Included with PRO:
              </div>
              <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-300 text-[11px]">
                <li>Step-by-step mark breakdown (Formula, Substitution, Final unit)</li>
                <li>Instant deduction warnings for negative signs and missing steps</li>
                <li>Direct comparison with the 100/100 Topper answer copy</li>
              </ul>
            </div>
          </div>
          <a className="btn text-xs font-black py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white inline-flex items-center justify-center gap-2" href="/explore">
            <span>Try AVK on Any Paper</span>
            <ArrowRight size={15} />
          </a>
        </section>
      </div>

      {/* Clear Rules & Free Library Guarantee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="panel bg-[#0C1222] border-2 border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Server-Protected Content</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            All PRO materials are secured with server-side authorization. Active members receive instant unthrottled streaming and high-resolution PDF downloads.
          </p>
        </section>

        <section className="panel bg-[#0C1222] border-2 border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <span>Community Papers Remain 100% Free</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            All user-contributed question papers, discussions, bookmarks, and search features will always remain free for every student.
          </p>
        </section>
      </div>

      <ProPassModal open={proModal} onOpenChange={setProModal} />
    </div>
  );
}
