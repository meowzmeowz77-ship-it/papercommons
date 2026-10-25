'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Crown, Sparkles, Search, SlidersHorizontal, BookOpen, ShieldCheck } from 'lucide-react';

interface HeroSearchProps {
  onSearch: () => void;
  counts: Record<string, number>;
  matches: { title: string; meta: string; tag: string }[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onOpenUpload: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onOpenUpload,
  counts,
  matches,
  onSearch
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filterChips: { id: string; label: string; count?: number; isPro?: boolean }[] = [
    { id: 'all', label: 'All Papers', count: counts.all },
    { id: 'pro-sets', label: '⭐ PRO Sets', isPro: true },
    { id: 'class-10', label: 'Class 10', count: undefined },
    { id: 'class-12', label: 'Class 12', count: undefined },
    { id: 'pre-board-2026', label: 'Pre-Board 2026', count: undefined },
    { id: 'mathematics', label: 'Mathematics', count: counts.mathematics },
    { id: 'science', label: 'Science', count: counts.science }
  ];

  const quickMatches = matches;

  return (
    <section className="flex flex-col gap-6 relative">
      {/* Ambient decorative glowing orbs */}
      <div className="absolute -top-16 left-1/4 w-96 h-80 bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-orange-600/10 blur-3xl rounded-full pointer-events-none -z-10 animate-float-orb1"></div>
      <div className="absolute -top-10 right-1/4 w-88 h-72 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-slate-700/20 blur-3xl rounded-full pointer-events-none -z-10 animate-float-orb2"></div>

      {/* Breadcrumb & Academic Notice Tag */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="inline-flex items-center gap-2 bg-[#131B2E] border-2 border-orange-500/40 text-orange-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400 animate-gentle-pulse"></span>
          <BookOpen size={14} className="text-orange-400" />
          Exam Archive 2025-2026
        </span>
        <span className="text-slate-600 font-bold">•</span>
        <span className="text-amber-300 text-xs font-black bg-[#131B2E] px-3 py-1.5 rounded-full border-2 border-amber-500/40 shadow-sm flex items-center gap-1.5">
          <Crown size={14} className="text-amber-400" />
          Topper Solutions &amp; AI Evaluation Desk
        </span>
      </div>

      {/* Hero Headline & Direct Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
        <div className="flex flex-col max-w-3xl">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.14]">
            Find real question papers.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 drop-shadow-md">
              Practice smarter.
            </span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-base md:text-lg mt-2 sm:mt-3 leading-relaxed font-semibold">
            The student-led repository for CBSE, ICSE &amp; State Board pre-boards, unit tests, and verified topper solutions.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="btn-cta-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 border-2 border-orange-400/50 hover:scale-105 active:scale-95 shimmer-badge shadow-xl cursor-pointer"
          >
            <Sparkles size={16} />
            <span>+ Upload Paper</span>
          </button>
        </div>
      </div>

      {/* Live Search & Filter Bar with Rotating Conic Gradient Focus */}
      <div className="search-conic-wrapper">
        <div className="bg-[#0C1222] p-4 sm:p-5 rounded-[22px] border border-slate-800 flex flex-col gap-4 relative">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full relative">
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 text-orange-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                aria-label="Search question papers"
                maxLength={160}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsDropdownOpen(false);
                    onSearch();
                  }
                }}
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(e.target.value.length > 0);
                }}
                onFocus={() => setIsDropdownOpen(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                placeholder="Search Maths pre-board, Science Class 10, CBSE papers, school names..."
                className="w-full bg-[#131B2E] text-white placeholder:text-slate-500 rounded-xl pl-12 pr-16 py-3.5 text-sm sm:text-base border-2 border-slate-800 focus:border-amber-400 focus:outline-none transition-all font-bold"
              />
              <div className="absolute right-3.5 top-3 hidden sm:flex items-center gap-1 pointer-events-none">
                <kbd className="text-[11px] font-mono font-black text-slate-400 bg-[#0C1222] border border-slate-700 px-2 py-1 rounded-lg">
                  ⌘K
                </kbd>
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1222] rounded-2xl shadow-2xl border-2 border-slate-800 p-2.5 z-40 transition-all">
                  <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider px-3 py-1">
                    Quick Matches
                  </div>
                  <div className="flex flex-col text-xs font-bold text-slate-300">
                    {quickMatches.slice(0, 4).map((item, idx) => (
                      <button
                        key={idx}
                        onMouseDown={() => {
                          onSearchChange(item.title);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-[#131B2E] hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <span className="font-extrabold text-white">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.meta}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onSearch();
                if (searchQuery.trim()) {
                  setIsDropdownOpen(false);
                } else {
                  inputRef.current?.focus();
                }
              }}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Search Papers</span>
              <Search size={18} />
            </button>
          </div>

          {/* Quick Filters including ⭐ PRO Sets */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 font-black shrink-0 pr-1 flex items-center gap-1.5">
              <SlidersHorizontal size={15} className="text-orange-400" />
              Quick Filter:
            </span>

            {filterChips.map((chip) => {
              const isActive = activeFilter === chip.id;
              if (chip.isPro) {
                return (
                  <button
                    key={chip.id}
                    onClick={() => onFilterChange(chip.id)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl font-black text-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-2 border-amber-400 shadow-lg shadow-amber-500/25'
                        : 'bg-[#131B2E] text-amber-300 border-2 border-amber-500/40 hover:bg-[#1E293B]'
                    }`}
                  >
                    <span>{chip.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={chip.id}
                  onClick={() => onFilterChange(chip.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-slate-950 font-black shadow-md border-2 border-orange-400'
                      : 'bg-[#131B2E] hover:bg-[#1E293B] text-slate-300 hover:text-white border-2 border-slate-800'
                  }`}
                >
                  {chip.label}{' '}
                  {chip.count !== undefined && (
                    <span className={`ml-1 text-[11px] font-black ${isActive ? 'text-slate-950' : 'text-slate-500'}`}>
                      {chip.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Contrast Trust Strip Banner */}
      <div className="bg-[#0C1222] border-2 border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 shadow-md">
            <ShieldCheck size={16} />
          </span>
          <div>
            <span className="text-white font-black">Student &amp; Topper Powered Library: </span>
            <span className="text-slate-400 font-medium">
              Real school pre-boards, official answer keys, and AI-assisted practice.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-bold">
          <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-[#131B2E] px-3 py-1 rounded-full border border-emerald-500/30 font-black text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Community Driven
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300 bg-[#131B2E] px-3 py-1 rounded-full border border-amber-500/40 font-black text-[11px]">
            <Crown size={11} className="text-amber-400" />
            PRO Marking Schemes
          </span>
        </div>
      </div>
    </section>
  );
};
