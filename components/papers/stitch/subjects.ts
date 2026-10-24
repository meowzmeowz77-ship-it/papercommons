'use client';
import { SubjectItem } from './types';

export const CORE_SUBJECTS: SubjectItem[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    subTitle: 'Standard & Basic (Class IX-XII)',
    category: 'math',
    badgeText: 'STANDARD & BASIC',
    badgeType: 'amber',
    paperCount: 0,
    iconName: 'square_foot',
    gradient: 'from-indigo-500 to-blue-600',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'science',
    name: 'Science',
    subTitle: 'Physics, Chemistry, Biology',
    category: 'science',
    badgeText: 'Theory + Lab',
    badgeType: 'emerald',
    paperCount: 0,
    iconName: 'science',
    gradient: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'social-science',
    name: 'Social Science',
    subTitle: 'History, Civics, Geo, Eco',
    category: 'social',
    badgeText: 'MAPS & THEORY',
    badgeType: 'amber',
    paperCount: 0,
    iconName: 'public',
    gradient: 'from-amber-500 to-yellow-600',
    iconColor: 'text-amber-600'
  },
  {
    id: 'english',
    name: 'English',
    subTitle: 'Language & Literature (184/301)',
    category: 'english',
    badgeText: 'Writing Formats',
    badgeType: 'amber',
    paperCount: 0,
    iconName: 'menu_book',
    gradient: 'from-orange-500 to-amber-600',
    iconColor: 'text-orange-500'
  },
  {
    id: 'hindi',
    name: 'Hindi',
    subTitle: 'Course A & Course B',
    category: 'hindi',
    badgeText: 'Vyakaran Focus',
    badgeType: 'rose',
    paperCount: 0,
    iconName: 'translate',
    gradient: 'from-rose-500 to-red-600',
    iconColor: 'text-rose-600'
  },
  {
    id: 'it',
    name: 'IT & Computer Science',
    subTitle: 'Code 402, Python & SQL (083)',
    category: 'it',
    badgeText: 'PRACTICE SETS',
    badgeType: 'cyan',
    paperCount: 0,
    iconName: 'terminal',
    gradient: 'from-cyan-500 to-blue-600',
    iconColor: 'text-cyan-600'
  }
];
