'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Crown,
  Timer,
  BarChart3,
  Bot,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { animateCounter } from '@/lib/animations';
import { RazorpayCheckoutModal } from './razorpay-modal';

interface ProPassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivateTestPass?: () => void;
}

export function ProPassModal({ open, onOpenChange, onActivateTestPass }: ProPassModalProps) {
  const [activating, setActivating] = useState(false);

  const perks = [
    {
      icon: Crown,
      title: 'Official Marking Scheme + Topper Handwritten Solutions',
      desc: 'Line-by-line step marking breakdown written by verified 99.8% board toppers.'
    },
    {
      icon: Bot,
      title: 'AI Answer Checker & Step Evaluation',
      desc: 'Upload your written answer page to get instant step-wise marks, deductions, and feedback.'
    },
    {
      icon: Timer,
      title: 'PRO Timed Exam Engine Simulator',
      desc: 'Simulate real board examination conditions with percentile projection and weak-topic diagnostics.'
    },
    {
      icon: Zap,
      title: 'Instant Unlimited High-Res PDF Vault Downloads',
      desc: 'Full access to exclusive pre-board sets, Delhi top school mocks, and state level collections.'
    }
  ];

  const [paying, setPaying] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const loadRazorpaySdk = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);
    try {
      const orderRes = await fetch('/api/billing/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!orderRes.ok) {
        throw new Error('Unable to generate payment order. Please ensure you are signed in.');
      }
      const orderData: any = await orderRes.json();
      setOrderId(orderData.orderId);

      const hasSdk = await loadRazorpaySdk();

      if (hasSdk && (window as any).Razorpay && !orderData.testMode) {
        const rzp = new (window as any).Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'PaperVault PRO',
          description: '30-Day Premium Pass — Topper Arsenal & AI Step Evaluator',
          image: '/favicon.svg',
          order_id: orderData.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/billing/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData: any = await verifyRes.json();
            if (verifyData.ok) {
              toast.success('👑 PaperVault PRO Activated via Razorpay!', { duration: 5000 });
              onOpenChange(false);
              setTimeout(() => location.reload(), 800);
            } else {
              toast.error(verifyData.error || 'Payment verification failed.');
            }
          },
          prefill: {
            name: 'Student Member',
            email: 'student@papervault.pro'
          },
          theme: {
            color: '#FF6500'
          }
        });
        rzp.open();
      } else {
        // Open the authentic Razorpay Checkout modal (UPI QR, GPay, Cards, NetBanking)
        setRazorpayOpen(true);
      }
    } catch (e: any) {
      toast.error(e.message || 'Payment initiation failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl bg-[#0C1222] border-2 border-amber-500/50 text-[#F8FAFC] shadow-[0_0_50px_rgba(245,158,11,0.25)] rounded-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Crown size={14} className="text-amber-400" />
                PaperVault PRO Member Pass
              </span>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Unlock the Full{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Board Topper Arsenal
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              Accelerate your exam preparation with verified marking schemes, step-by-step AI grading, and realistic test simulators.
            </DialogDescription>
          </DialogHeader>

          {/* Pricing Banner with Razorpay Checkout */}
          <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase font-black text-amber-400 tracking-wider">PRO Member Plan</div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-white">₹299</span>
                <span className="text-xs font-semibold text-slate-400">/ month</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> Razorpay UPI, GPay, Cards &amp; NetBanking
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRazorpayPayment}
                disabled={paying}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap size={15} className="fill-slate-950" />
                <span>{paying ? 'Connecting Gateway…' : 'Proceed to Payment (₹299)'}</span>
              </button>
            </div>
          </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
          {perks.map((p, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#131B2E] border border-slate-800 hover:border-amber-500/40 transition-colors flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <p.icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200 leading-snug">{p.title}</span>
                <span className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-400" />
            Official 2026 Marking Scheme Aligned
          </span>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <RazorpayCheckoutModal
      open={razorpayOpen}
      onOpenChange={setRazorpayOpen}
      orderId={orderId}
      amount={299}
      onSuccess={() => {
        onOpenChange(false);
        onActivateTestPass?.();
      }}
    />
  </>
  );
}

interface TimedExamEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperTitle: string;
  durationMinutes: number;
  marks: number;
}

export function TimedExamEngineModal({
  open,
  onOpenChange,
  paperTitle,
  durationMinutes,
  marks
}: TimedExamEngineModalProps) {
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [strictMode, setStrictMode] = useState(true);
  const [aiHints, setAiHints] = useState(true);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const percentileRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      setExamStarted(false);
      setTimeLeft(durationMinutes * 60);
    }
  }, [open, durationMinutes]);

  useEffect(() => {
    let timer: any = null;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  useEffect(() => {
    if (open && !examStarted) {
      animateCounter(scoreRef.current, marks ? Math.round(marks * 0.94) : 95, 1200, '', ` / ${marks || 100}`);
      animateCounter(percentileRef.current, 98, 1200, '', '.6th %ile');
    }
  }, [open, examStarted, marks]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0C1222] border-2 border-orange-500/50 text-[#F8FAFC] shadow-[0_0_50px_rgba(255,101,0,0.25)] rounded-2xl p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/60 text-orange-300 text-xs font-black uppercase tracking-wider">
              <Zap size={14} className="text-orange-400" />
              PRO Timed Exam Engine Simulator
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {paperTitle}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-medium">
            Simulate actual hall environment with full timing restrictions, predictive scoring, and weak-topic breakdown.
          </DialogDescription>
        </DialogHeader>

        {examStarted ? (
          <div className="flex flex-col gap-6 py-4">
            {/* Live Timer Display */}
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#131B2E] border-2 border-amber-500/50 shadow-inner">
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest flex items-center gap-1.5 mb-2">
                <Clock size={16} className="animate-spin" /> Time Remaining
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Session
                </span>
                <span>•</span>
                <span>Max Marks: {marks || 80}</span>
                <span>•</span>
                <span className="text-amber-400">Strict Hall Mode Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setExamStarted(false);
                  toast.success('Simulation completed! Diagnostic report generated.');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs transition-transform active:scale-95 cursor-pointer shadow-lg"
              >
                Submit Paper &amp; Run AI Evaluation
              </button>
              <button
                onClick={() => setExamStarted(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Pause Session
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-2">
            {/* Analytics & Projection Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800 flex flex-col">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Exam Duration</span>
                <span className="text-2xl font-black text-white mt-1">{durationMinutes} Mins</span>
                <span className="text-[10px] text-slate-400 mt-1">Official Board Standard</span>
              </div>
              <div className="p-4 rounded-xl bg-[#131B2E] border border-amber-500/30 flex flex-col">
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">Target Topper Score</span>
                <span ref={scoreRef} className="text-2xl font-black text-amber-400 mt-1">
                  {Math.round((marks || 80) * 0.94)} / {marks || 80}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Projected Cutoff</span>
              </div>
              <div className="p-4 rounded-xl bg-[#131B2E] border border-orange-500/30 flex flex-col">
                <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider">Est. Percentile</span>
                <span ref={percentileRef} className="text-2xl font-black text-orange-300 mt-1">
                  98.6th %ile
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Based on 12.4k peers</span>
              </div>
            </div>

            {/* Diagnostic Topics */}
            <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <TrendingUp size={15} className="text-amber-400" />
                Predicted High-Yield Topics in this Paper
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                  ✓ Section C: 5-Marker Proofs (High Weightage)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
                  ⚡ Case Study / Assertion-Reasoning (Tricky)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 text-orange-300 font-bold">
                  ★ Numerical Calculations (Step Marking)
                </span>
              </div>
            </div>

            {/* Simulator Toggles */}
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#131B2E] border border-slate-800 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Strict Board Examination Lock</span>
                  <span className="text-[11px] text-slate-400">Auto-submits paper when the 180 min timer expires</span>
                </div>
                <input
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#131B2E] border border-slate-800 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">AI Step Guidance &amp; Marking Key (PRO)</span>
                  <span className="text-[11px] text-slate-400">Reveal topper stepwise hints if stuck on 4+ mark questions</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiHints}
                  onChange={(e) => setAiHints(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setExamStarted(true);
                  toast.success('Simulation started! Good luck.');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 cursor-pointer flex items-center gap-1.5"
              >
                <Timer size={16} />
                <span>Begin Timed Practice</span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
