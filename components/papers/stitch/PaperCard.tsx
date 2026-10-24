'use client';
import React, { useState, useRef } from 'react';
import { Paper } from './types';
import { Crown, Sparkles, Bot, CheckCircle2, Lock, Share2, Bookmark, Star, FileText, ArrowUpRight } from 'lucide-react';
import { popSparkleEffect, handleCardTilt, resetCardTilt } from '@/lib/animations';

interface PaperCardProps {
  onReport?: (paper: Paper) => void;
  paper: Paper;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: (paperId: string) => void;
  onViewPaper: (paper: Paper) => void;
  onDownloadPdf: (paper: Paper) => void;
  onShare: (paper: Paper) => void;
  onCopyCitation: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  index,
  isBookmarked,
  onToggleBookmark,
  onViewPaper,
  onDownloadPdf,
  onShare,
  onCopyCitation,
  onReport
}) => {
  const [downloading, setDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const bookmarkRef = useRef<HTMLButtonElement>(null);

  const isExclusiveMock = paper.examType?.includes('Pre-Board') || paper.premiumOnly || index % 2 === 0;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadPdf(paper);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    popSparkleEffect(bookmarkRef.current);
    onToggleBookmark(paper.id);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
      case 'Easy-Medium':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSubjectBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'math':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'science':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'social':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'english':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'hindi':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'it':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    }
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={(e) => handleCardTilt(e, cardRef.current)}
      onMouseLeave={() => resetCardTilt(cardRef.current)}
      style={{ animationDelay: `${(index + 1) * 0.07}s` }}
      className="stitch-paper-card pro-card-perspective bg-[#0C1222] p-5 md:p-6 rounded-2xl border-2 border-slate-800 hover:border-amber-500/60 shadow-xl flex flex-col justify-between gap-4 relative group overflow-hidden"
    >
      {/* Exclusive Pre-Board Sets Top-Right Ribbon */}
      {isExclusiveMock && (
        <div className="corner-ribbon">
          PRO MOCK
        </div>
      )}

      {/* Subtle top indicator bar with athletic orange & amber gold gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent group-hover:h-1.5 group-hover:from-orange-500 group-hover:via-amber-400 group-hover:to-orange-400 transition-all duration-300"></div>

      <div className="flex flex-col gap-3">
        {/* Metadata Pill Strip with High-Contrast Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-slate-900 border border-slate-700 text-white px-3 py-1 rounded-lg font-black tracking-wider uppercase text-[11px] shadow-sm">
            {paper.board}
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border ${getSubjectBadgeStyle(
              paper.subjectCategory
            )}`}
          >
            {paper.subject}
          </span>
          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
            {paper.examType}
          </span>
          <span className="bg-[#131B2E] text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg font-semibold">
            {paper.grade} • {paper.year}
          </span>
          <span className="text-slate-300 bg-[#131B2E] border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold truncate max-w-xs">
            <span className="material-symbols-outlined text-[14px] text-amber-400 shrink-0">location_on</span>
            <span className="truncate">{paper.school}</span>
          </span>
        </div>

        {/* Title & 3-dot Menu */}
        <div className="flex items-start justify-between gap-3 mt-0.5 relative">
          <h3
            onClick={() => onViewPaper(paper)}
            tabIndex={0}
            role="link"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onViewPaper(paper);
            }}
            className="text-base sm:text-lg font-extrabold text-[#F8FAFC] group-hover:text-amber-400 cursor-pointer transition-colors leading-snug tracking-tight"
          >
            {paper.title}
          </h3>

          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="card-menu-btn text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all active:scale-90 cursor-pointer"
              title="Options"
              aria-label="Paper options"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-[#0C1222] border-2 border-slate-800 rounded-xl shadow-2xl p-1.5 z-30 text-xs text-slate-200">
                <button
                  onClick={() => {
                    onCopyCitation(paper);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#131B2E] hover:text-amber-400 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-orange-400">content_copy</span>
                  <span>Copy Paper Link</span>
                </button>
                <button
                  onClick={() => {
                    onViewPaper(paper);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#131B2E] hover:text-amber-400 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-orange-400">description</span>
                  <span>Open Paper</span>
                </button>
                <button
                  onClick={() => {
                    onReport?.(paper);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#131B2E] hover:text-rose-400 font-semibold text-slate-400 cursor-pointer"
                >
                  Report paper
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRO / Premium Highlight Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-bold text-xs">
          {/* PRO Topper Solutions Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/50 text-amber-300 font-black text-[11px] shadow-sm">
            <Crown size={13} className="text-amber-400" />
            <span>PRO Topper Solutions</span>
          </span>

          {/* AI Step Evaluation Tag */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/40 text-orange-300 font-bold text-[11px]">
            <Bot size={13} className="text-orange-400" />
            <span>AI Step Evaluation (PRO)</span>
          </span>

          {paper.locked && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 font-black text-[11px]">
              <Lock size={12} />
              <span>PRO Reserved</span>
            </span>
          )}
        </div>

        {/* Specs Badge Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5 font-bold">
          <span className="text-white bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg shadow-sm font-black">
            {paper.marks} Marks
          </span>
          <span className="flex items-center gap-1 text-slate-300 bg-[#131B2E] border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="material-symbols-outlined text-[15px] text-amber-400 font-normal">schedule</span>
            <span>
              {paper.durationHours} {paper.durationHours === 1 ? 'Hour' : 'Hours'}
            </span>
          </span>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getDifficultyColor(paper.difficulty)}`}>
            <span className="h-2 w-2 rounded-full bg-current animate-gentle-pulse"></span>
            <span>Difficulty: {paper.difficulty}</span>
          </span>

          {paper.specialBadge && (
            <span className="shimmer-badge inline-flex items-center gap-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-extrabold text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-cyan-400">bolt</span>
              <span>{paper.specialBadge}</span>
            </span>
          )}
        </div>

        {/* Snippet preview */}
        <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 mt-0.5 leading-relaxed font-normal">
          {paper.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
        {/* Community Stats & Contributor Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3 font-semibold">
            <span className="flex items-center gap-1 text-white font-black">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>{paper.rating}</span>{' '}
              <span className="text-slate-500 font-semibold">({paper.ratingCount})</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-500">visibility</span>
              <span>{paper.views >= 1000 ? `${(paper.views / 1000).toFixed(1)}K` : paper.views}</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-500">download</span>
              <span>{paper.downloads >= 1000 ? `${(paper.downloads / 1000).toFixed(1)}K` : paper.downloads}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-500 font-medium">By</span>
            <span className="text-slate-200">{paper.contributor.name}</span>
            {paper.contributor.isTrusted && (
              <span
                className="inline-flex items-center bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] text-emerald-300 font-black uppercase tracking-wider"
                title="Verified academic contributor"
              >
                Trusted
              </span>
            )}
            <span className="text-slate-500 text-[11px] font-normal">{paper.timeAgo}</span>
          </div>
        </div>

        {/* Action Buttons with High-Contrast Glow */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewPaper(paper)}
              className="view-paper-trigger inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-500/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">visibility</span>
              <span>{paper.locked ? 'View Details' : 'View Paper'}</span>
            </button>

            <button
              onClick={paper.locked ? () => onViewPaper(paper) : handleDownload}
              className="download-action-btn inline-flex items-center gap-1.5 bg-[#131B2E] hover:bg-[#1E293B] text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all duration-200 border border-slate-700 hover:border-slate-500 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {downloading ? (
                <>
                  <span className="material-symbols-outlined text-[17px] animate-spin text-amber-400">
                    progress_activity
                  </span>
                  <span>PDF...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[17px]">file_download</span>
                  <span>{paper.locked ? 'Locked' : 'PDF'}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              ref={bookmarkRef}
              onClick={handleBookmarkClick}
              className={`bookmark-btn p-2 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer border ${
                isBookmarked
                  ? 'text-amber-400 bg-amber-500/15 border-amber-500/50 shadow-sm'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800 border-transparent'
              }`}
              title={isBookmarked ? 'Remove from saved papers' : 'Save to deck'}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={() => onShare(paper)}
              className="share-btn p-2 text-slate-500 hover:text-white hover:bg-slate-800 border border-transparent rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
              title="Share link"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
