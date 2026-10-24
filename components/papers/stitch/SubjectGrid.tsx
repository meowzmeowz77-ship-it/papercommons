'use client';
import React from 'react';
import { SubjectItem } from './types';
import { BookOpen, ChevronRight, ArrowRight } from 'lucide-react';

interface SubjectGridProps {
  subjects: SubjectItem[];
  onSelectSubject: (subjectId: string) => void;
  onViewAllSubjects: () => void;
  selectedSubject?: string | null;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({
  onSelectSubject,
  onViewAllSubjects,
  selectedSubject,
  subjects
}) => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Browse by Core Subject</span>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-black uppercase tracking-wider border border-orange-500/40">
              Core Subjects
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-semibold">
            Classified practice papers, chapter tests, and school examinations
          </p>
        </div>

        <button
          onClick={onViewAllSubjects}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-amber-300 hover:text-amber-200 bg-[#131B2E] hover:bg-[#1E293B] px-3.5 py-2 rounded-xl border-2 border-amber-500/30 transition-all hover:scale-105 group cursor-pointer shadow-xs"
        >
          <span>View all subjects</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5" id="subject-cards-container">
        {subjects.map((subject: SubjectItem, index: number) => {
          const isSelected = selectedSubject === subject.id;

          const topBarGradients: Record<string, string> = {
            math: 'from-orange-500 to-amber-500',
            science: 'from-emerald-500 to-teal-500',
            social: 'from-amber-500 to-orange-500',
            english: 'from-orange-600 to-amber-500',
            hindi: 'from-rose-500 to-red-500',
            it: 'from-cyan-500 to-blue-500'
          };

          return (
            <div
              key={subject.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSubject(subject.id);
                }
              }}
              onClick={() => onSelectSubject(subject.id)}
              style={{ animationDelay: `${(index + 1) * 0.08}s` }}
              className={`fade-in-stagger group bg-[#0C1222] p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/40 bg-[#131B2E]'
                  : 'border-slate-800 hover:border-orange-500/60 hover:shadow-orange-500/10'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${topBarGradients[subject.category] || 'from-orange-500 to-amber-500'} transition-all duration-300 group-hover:h-2`}
              ></div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-white shadow-lg shadow-slate-950/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20`}
                  >
                    {subject.category === 'hindi' ? (
                      <span className="font-black text-2xl">अ</span>
                    ) : (
                      <span className="material-symbols-outlined text-[26px]">
                        {subject.iconName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                      {subject.name}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {subject.subTitle}
                    </span>
                  </div>
                </div>

                <span
                  className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider group-hover:scale-105 transition-transform shrink-0 bg-[#131B2E] border border-slate-700 text-slate-300"
                >
                  {subject.badgeText}
                </span>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-black text-slate-300">
                  <BookOpen size={15} className="text-orange-400" />
                  <span className="text-white text-sm font-black">{subject.paperCount.toLocaleString()}</span>{' '}
                  <span className="text-slate-400 font-semibold">papers</span>
                </span>
                <span className="text-amber-400 font-black group-hover:translate-x-1.5 transition-transform flex items-center gap-0.5">
                  Explore Sets <ChevronRight size={15} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
