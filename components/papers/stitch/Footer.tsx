'use client';
import React from 'react';
import { Crown, Sparkles, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full bg-[#070B14] text-slate-400 border-t border-slate-800 mt-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                PV
              </div>
              <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                PaperVault <span className="text-amber-400 font-black text-xs px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">PRO</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier student-powered question paper vault for secondary and senior secondary examinations, featuring verified topper handwritten solutions and automated AI step evaluation.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <Crown size={14} />
              <span>Official 2026 Marking Scheme Aligned</span>
            </div>
          </div>

          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Board Syllabi &amp; Archives
            </span>
            <button
              onClick={() => onSelectTab('subjects')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              CBSE Class 10 &amp; 12 Papers
            </button>
            <button
              onClick={() => onSelectTab('subjects')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              ICSE / ISC Model Question Papers
            </button>
            <button
              onClick={() => onSelectTab('subjects')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              State Boards (Maharashtra, TN, UP)
            </button>
            <button
              onClick={() => onSelectTab('explore')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              Question Paper Catalogue
            </button>
            <button
              onClick={() => onSelectTab('explore')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              Practice &amp; Pre-Board Mock Tests
            </button>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              PRO Tools &amp; Features
            </span>
            <button
              onClick={() => onSelectTab('premium')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors text-left cursor-pointer flex items-center gap-1"
            >
              <Crown size={13} />
              <span>PaperVault PRO Pass (₹299/mo)</span>
            </button>
            <button
              onClick={() => onSelectTab('explore')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              Topper Handwritten Model Answers
            </button>
            <button
              onClick={() => onSelectTab('explore')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              AI Answer Checker Simulator
            </button>
            <button
              onClick={() => onSelectTab('community')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              Community Discussions &amp; Doubt Clearing
            </button>
            <button
              onClick={() => onSelectTab('saved')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer"
            >
              Saved Revision Decks
            </button>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Academic Disclaimer
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              PaperVault PRO is an educational archive created for student practice and revision. Board names and curriculum specifications are acknowledged as properties of respective examination councils (CBSE, CISCE, State Boards).
            </p>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500 font-medium">
            © 2026 PaperVault PRO Academic Exchange. Crafted for focused, zero-distraction board prep.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => onSelectTab('community')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Privacy Promise
            </button>
            <button
              onClick={() => onSelectTab('community')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Student Code of Conduct
            </button>
            <button
              onClick={() => onSelectTab('community')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Report Infringement
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
