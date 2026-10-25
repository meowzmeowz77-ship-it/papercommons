'use client';
import {Crown,Users,Bookmark,ShieldCheck,ChartNoAxesCombined,Sparkles} from 'lucide-react';
import {track} from '@/lib/analytics-client';
import {Paper} from '@/lib/types';
import {HeroSearch} from './stitch/HeroSearch';
import {SubjectGrid} from './stitch/SubjectGrid';
import {PaperFeed} from './stitch/PaperFeed';
import {CORE_SUBJECTS} from './stitch/subjects';
import {paperView,categories} from './stitch/adapter';
import {toast} from 'sonner';
import {api} from '@/lib/client';

export function StitchHome({boot,papers,total,query,setQuery,filters,setFilters,sort,setSort,loading,error,retry,onSave,onReport}:{boot:any;papers:Paper[];total:number;query:string;setQuery:(q:string)=>void;filters:Record<string,string>;setFilters:(f:Record<string,string>)=>void;sort:string;setSort:(s:string)=>void;loading:boolean;error:string;retry:()=>void;onSave:(p:Paper)=>void;onReport:(p:Paper)=>void}){
  const filter=filters.access==='premium'?'pro-sets':filters.subject==='Mathematics'?'mathematics':filters.subject==='Science'?'science':filters.exam==='Pre-Board'?'pre-board-2026':filters.grade?'class-'+filters.grade:'all';
  const chooseFilter=(key:string)=>{
    if(key==='all'){setFilters({});setQuery('')}
    else if(key==='pro-sets'){setFilters({...filters,access:filters.access==='premium'?'':'premium'})}
    else if(key.startsWith('class-'))setFilters({...filters,grade:key.slice(6)})
    else if(key==='pre-board-2026')setFilters({...filters,exam:'Pre-Board',year:'2026'})
    else setFilters({...filters,subject:key==='mathematics'?'Mathematics':'Science'})
  };

  const subjects=(boot?.taxonomy||[]).filter((t:any)=>t.kind==='subject').map((t:any)=>{const base=CORE_SUBJECTS.find(s=>s.category===categories[t.name])||CORE_SUBJECTS[0];return{...base,id:t.name,name:t.name==='Computer Science'?'IT & Computer Science':t.name,paperCount:boot?.counts?.find((c:any)=>c.subject===t.name)?.count||0}});
  const find=(p:{id:string})=>papers.find(x=>x.id===p.id)!;
  const link=(p:{id:string})=>location.origin+'/papers/'+find(p).slug;
  const copy=async(p:{id:string})=>{try{await navigator.clipboard.writeText(link(p));toast.success('Paper link copied')}catch{toast.error('Could not copy the link')}};
  const share=async(p:{id:string})=>{if(navigator.share){try{await navigator.share({title:find(p).title,url:link(p)})}catch(e:any){if(e.name!=='AbortError')toast.error('Sharing is unavailable')}}else await copy(p)};
  const tab=sort==='newest'?'recent':sort==='rating'?'rated':sort;
  const active=Object.entries(filters).filter(([,v])=>v);

  return <div className="stitch-native flex flex-col gap-6 sm:gap-8 md:gap-10">
    <HeroSearch onSearch={()=>{track('search');api('search',{q:query,empty:total===0}).catch(()=>{});document.getElementById('feed-anchor')?.scrollIntoView({block:'start'})}} searchQuery={query} onSearchChange={q=>{setQuery(q);if(q.trim())setFilters({...filters,subject:''})}} activeFilter={filter} onFilterChange={chooseFilter} onOpenUpload={()=>location.href='/upload'} counts={{all:boot?.stats?.papers||total,mathematics:boot?.counts?.find((c:any)=>c.subject==='Mathematics')?.count||0,science:boot?.counts?.find((c:any)=>c.subject==='Science')?.count||0}} matches={papers.map(p=>({title:p.title,meta:p.board+' • Class '+p.grade,tag:p.subject}))}/>
    
    {/* Shortcuts */}
    <nav className="feature-shortcuts" aria-label="Study and account features">
      <a className="feature-premium" href="/premium">
        <Crown size={20} className="text-amber-400"/>
        <span>
          <strong className="text-amber-300">PaperVault PRO</strong>
          <small className="text-amber-200/80">Topper solutions, AI checker &amp; exam simulator</small>
        </span>
      </a>
      <a href="/community"><Users size={18} className="text-orange-400"/><span><strong>Community</strong><small>Contributors &amp; discussions</small></span></a>
      <a href="/saved"><Bookmark size={18} className="text-cyan-400"/><span><strong>Saved Papers</strong><small>Organise into revision collections</small></span></a>
      {boot?.user?.role==='admin'&&<><a href="/admin?tab=Premium"><ShieldCheck size={18} className="text-emerald-400"/><span><strong>Manage Premium</strong><small>Member papers &amp; test access</small></span></a><a href="/admin?tab=Analytics"><ChartNoAxesCombined size={18} className="text-indigo-400"/><span><strong>Traffic Analytics</strong><small>Views, downloads &amp; searches</small></span></a></>}
    </nav>

    <SubjectGrid subjects={subjects} selectedSubject={filters.subject} onSelectSubject={s=>{setFilters({...filters,subject:filters.subject===s?'':s});setQuery('')}} onViewAllSubjects={()=>location.href='/subjects'}/>
    
    {(active.length>0||query)&&<div className="bg-[#0C1222] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300 shadow-sm"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-slate-400">Active Criteria:</span>{query&&<span className="bg-[#131B2E] text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-semibold">Query: {query}</span>}{active.map(([k,v])=><span className="bg-[#131B2E] text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-semibold" key={k}>{k==='access'&&v==='premium'?'⭐ PRO Sets':k==='grade'?'Class '+v:v}</span>)}</div><button className="text-xs text-amber-400 font-bold hover:underline cursor-pointer" onClick={()=>{setFilters({});setQuery('')}}>Reset All Filters</button></div>}
    
    {error?<div className="error-state" role="alert"><h3>We couldn’t load these papers.</h3><p>{error}</p><button className="btn primary" onClick={retry}>Try again</button></div>:<PaperFeed papers={papers.map(paperView)} totalAvailableCount={total} loading={loading} activeTab={tab} onTabChange={t=>setSort(t==='recent'?'newest':t==='rated'?'rating':t)} recommendationLabel={'Recommended For You (Class '+(boot?.user?.grade||'10')+' '+(boot?.user?.board||'CBSE')+')'} bookmarkedIds={papers.filter(p=>p.saved).map(p=>p.id)} onToggleBookmark={id=>{const p=papers.find(x=>x.id===id);if(p)onSave(p)}} onViewPaper={p=>location.href='/papers/'+find(p).slug} onDownloadPdf={p=>location.href='/papers/'+find(p).slug+'?download=1'} onShare={share} onCopyCitation={copy} onReport={p=>onReport(find(p))} onOpenUpload={()=>location.href='/upload'} onBrowseAll={()=>location.href='/explore'}/>}
  </div>;
}
