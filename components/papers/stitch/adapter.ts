import {Paper as StoredPaper} from '@/lib/types';
import {Paper} from './types';
export const categories:Record<string,Paper['subjectCategory']>={Mathematics:'math',Science:'science','Social Science':'social',English:'english',Hindi:'hindi','Computer Science':'it'};
export function paperView(p:StoredPaper):Paper{
  return {id:p.id,year:p.year,title:p.title,board:p.board,grade:'Class '+p.grade,subject:p.subject,subjectCategory:categories[p.subject]||'math',examType:p.exam,school:p.school||'Community contribution',marks:p.marks??'—',durationHours:p.duration==null?'—':p.duration/60,difficulty:p.difficulty||'Not assessed',specialBadge:p.sample?'Original Practice Set':undefined,premiumOnly:!!p.premium_only,locked:p.can_access===false,description:p.description||p.chapters||'Open this question paper and practise with the community.',rating:p.rating_count?Number(p.rating).toFixed(1):'Unrated',ratingCount:p.rating_count,views:p.views,downloads:p.downloads,commentsCount:p.comment_count,contributor:{name:p.username},timeAgo:new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),paperCode:p.id,verifiedSyllabus:false};
}
