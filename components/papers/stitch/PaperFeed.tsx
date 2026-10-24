'use client';
import React, { useState, useEffect } from 'react';
import { Paper } from './types';
import { PaperCard } from './PaperCard';
import { Loading } from '../primitives';
import { Sparkles, Crown, ArrowRight, UploadCloud, RefreshCw } from 'lucide-react';

interface PaperFeedProps {
  loading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onReport: (paper: Paper) => void;
  recommendationLabel: string;
  papers: Paper[];
  bookmarkedIds: string[];
  onToggleBookmark: (paperId: string) => void;
  onViewPaper: (paper: Paper) => void;
  onDownloadPdf: (paper: Paper) => void;
  onShare: (paper: Paper) => void;
  onCopyCitation: (paper: Paper) => void;
  onOpenUpload: () => void;
  onBrowseAll: () => void;
  totalAvailableCount?: number;
}

export const PaperFeed: React.FC<PaperFeedProps> = ({
  papers,
  bookmarkedIds,
  onToggleBookmark,
  onViewPaper,
  onDownloadPdf,
  onShare,
  onCopyCitation,
  onOpenUpload,
  onBrowseAll,
  loading,
  activeTab,
  onTabChange,
  onReport,
  recommendationLabel,
  totalAvailableCount = papers.length
}) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => setVisibleCount(6), [activeTab]);

  const tabs = [
    { id: 'popular', label: 'Popular This Week' },
    { id: 'recent', label: 'Recently Uploaded' },
    { id: 'downloads', label: 'Most Downloaded' },
    { id: 'rated', label: 'Highly Rated' },
    { id: 'recommended', label: recommendationLabel, isSpecial: true }
  ];

  const displayedPapers = papers.slice(0, visibleCount);
  const handleLoadMore = () => setVisibleCount((prev) => prev + 4);

  return (
    <div className="flex flex-col gap-7" id="feed-anchor">
      {/* Feed Header & Tabs */}
      <section className="flex flex-col gap-3.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Academic Question Paper Feed
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-0.5">
              Verified papers with topper handwritten solutions, official marking schemes &amp; AI checking
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 bg-[#0C1222] border-2 border-amber-500/40 px-3.5 py-1.5 rounded-full self-start sm:self-auto shadow-sm">
            <Crown size={14} className="text-amber-400" />
            <span>
              Showing {displayedPapers.length} of {totalAvailableCount.toLocaleString()} available papers
            </span>
          </div>
        </div>

        {/* Feed Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto bg-[#0C1222] p-2 rounded-2xl border-2 border-slate-800 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            if (tab.isSpecial) {
              return (
                <button
                  key={tab.id}
                  aria-pressed={isActive}
                  onClick={() => onTabChange(tab.id)}
                  className={`feed-tab shrink-0 px-4 py-2.5 text-xs md:text-sm rounded-xl transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer font-bold ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-lg shadow-orange-500/30'
                      : 'text-amber-300 bg-[#131B2E] hover:bg-[#1E293B] border border-amber-500/30'
                  }`}
                >
                  <Sparkles size={16} className="text-amber-400" />
                  <span>{tab.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                aria-pressed={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`feed-tab shrink-0 px-4 py-2.5 text-xs md:text-sm rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'active font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'font-bold text-slate-300 hover:text-white hover:bg-[#131B2E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Question Paper Grid */}
      {loading ? (
        <Loading />
      ) : displayedPapers.length === 0 ? (
        <div className="bg-[#0C1222] p-12 rounded-3xl border-2 border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-3 shadow-md">
          <span className="material-symbols-outlined text-4xl text-slate-600">search_off</span>
          <h3 className="text-base font-black text-white">No question papers match your query</h3>
          <p className="text-xs text-slate-400 max-w-sm font-semibold">
            Try adjusting your search terms, grade filter, or clear filters to see all available papers.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="paper-cards-grid">
          {displayedPapers.map((paper, idx) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              index={idx}
              isBookmarked={bookmarkedIds.includes(paper.id)}
              onToggleBookmark={onToggleBookmark}
              onViewPaper={onViewPaper}
              onDownloadPdf={onDownloadPdf}
              onShare={onShare}
              onCopyCitation={onCopyCitation}
              onReport={onReport}
            />
          ))}
        </section>
      )}

      {/* Pagination & Load More */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <span className="text-xs text-slate-400 font-bold">
          Showing {displayedPapers.length} of {totalAvailableCount.toLocaleString()} question papers
        </span>
        <div className="flex items-center gap-2.5">
          {displayedPapers.length < papers.length && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2.5 bg-[#0C1222] hover:bg-[#131B2E] active:scale-95 text-slate-200 font-extrabold text-xs rounded-xl border-2 border-slate-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <RefreshCw size={15} className={loadingMore ? 'animate-spin' : ''} />
              <span>{loadingMore ? 'Fetching papers...' : 'Load More Question Sets'}</span>
            </button>
          )}

          <button
            onClick={onBrowseAll}
            className="px-4.5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-black text-xs rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            Browse Full Catalog
          </button>
        </div>
      </div>

      {/* Contribution Banner with Cyber-Obsidian & Athletic Orange */}
      <section className="bg-gradient-to-r from-[#0C1222] via-[#131B2E] to-[#0C1222] border-2 border-orange-500/40 text-white rounded-3xl p-6 sm:p-9 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-88 h-88 bg-orange-600/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

        <div className="flex items-start gap-4.5 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-xl shadow-orange-500/30 border border-white/20 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud size={28} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Have your school&apos;s recent test paper?
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-black uppercase tracking-wider hidden sm:inline-block">
                Share &amp; Help
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1.5 leading-relaxed font-medium">
              Scan and upload it in PDF format. Earn contributor points and unlock PRO mock sets for your class.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto z-10">
          <button
            onClick={onOpenUpload}
            className="btn-cta-glow shimmer-badge w-full md:w-auto text-center px-7 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all duration-200 border-2 border-orange-400/50 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          >
            Contribute a Paper
          </button>
        </div>
      </section>
    </div>
  );
};
