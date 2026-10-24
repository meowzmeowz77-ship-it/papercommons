'use client';
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionItem {
  id: string;
  section: string;
  questionNumber: number;
  marks: number | string;
  text: string;
  options?: QuestionOption[];
  explanation?: string;
  topperTip?: string;
}

export interface Paper {
  id: string;
  year: number;
  title: string;
  board: string;
  grade: string;
  subject: string;
  subjectCategory: 'math' | 'science' | 'social' | 'english' | 'hindi' | 'it';
  examType: string;
  school: string;
  marks: number | string;
  durationHours: number | string;
  difficulty: string;
  specialBadge?: string;
  premiumOnly?: boolean;
  locked?: boolean;
  description: string;
  rating: number | string;
  ratingCount: number;
  views: number;
  downloads: number;
  commentsCount: number;
  contributor: {
    name: string;
    role?: string;
    isTrusted?: boolean;
  };
  timeAgo: string;
  paperCode: string;
  verifiedSyllabus: boolean;
  questions?: QuestionItem[];
}

export interface SubjectItem {
  id: string;
  name: string;
  subTitle: string;
  category: 'math' | 'science' | 'social' | 'english' | 'hindi' | 'it';
  badgeText: string;
  badgeType: 'amber' | 'emerald' | 'orange' | 'purple' | 'rose' | 'cyan';
  paperCount: number;
  iconName: string;
  gradient: string;
  iconColor: string;
}
