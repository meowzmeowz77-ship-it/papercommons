'use client';
import {Paper} from '@/lib/types';
import {PaperCard as StitchPaperCard} from './stitch/PaperCard';
import {paperView} from './stitch/adapter';
import {toast} from 'sonner';
export function PaperCard({paper:p,onSave,onReport}:{paper:Paper;onSave:(p:Paper)=>void;onReport:(p:Paper)=>void}){
  const view=paperView(p),url=()=>location.origin+'/papers/'+p.slug;
  const copy=async()=>{try{await navigator.clipboard.writeText(url());toast.success('Link copied')}catch{toast.error('Could not copy the link. Open the paper to share its address.')}};
  const share=async()=>{if(navigator.share){try{await navigator.share({title:p.title,url:url()})}catch(e:any){if(e.name!=='AbortError')toast.error('Sharing is unavailable')}}else await copy()};
  return <StitchPaperCard paper={view} index={0} isBookmarked={!!p.saved} onToggleBookmark={()=>onSave(p)} onViewPaper={()=>location.href='/papers/'+p.slug} onDownloadPdf={()=>location.href='/papers/'+p.slug+'?download=1'} onShare={share} onCopyCitation={copy} onReport={()=>onReport(p)}/>;
}
