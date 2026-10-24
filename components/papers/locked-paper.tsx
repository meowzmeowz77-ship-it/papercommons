'use client';
import {useState} from 'react';
import {Bookmark,LockKeyhole,Flag,Share2,Crown,Sparkles,CheckCircle2} from 'lucide-react';
import {Paper,User} from '@/lib/types';
import {api} from '@/lib/client';
import {toast} from 'sonner';
import {ProPassModal} from './pro-modals';

export function LockedPaper({paper:p,user,onReport}:{paper:Paper;user?:User;onReport:(p:any)=>void}){
 const [proModal,setProModal]=useState(false);

 return <>
  <div className="breadcrumbs text-slate-400">
    <a href="/explore" className="hover:text-amber-400">Explore</a>
    <span> / {p.subject} / Class {p.grade}</span>
  </div>

  <div className="paper-detail-heading">
    <div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
        <Crown size={13}/> PaperVault PRO Exclusive Set
      </span>
      <h1 className="text-white font-black">{p.title}</h1>
      <p className="text-slate-400">{p.board} · Class {p.grade} · {p.exam} · {p.year}</p>
    </div>
    <button className="btn" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);toast.success('Paper link copied')}catch{toast.error('Copy address from your browser')}}}>
      <Share2 size={16}/>Share
    </button>
  </div>

  <div className="locked-paper-layout">
    <section className="panel locked-paper bg-[#0C1222] border-2 border-amber-500/40 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
        <LockKeyhole size={36}/>
      </div>
      <h2 className="text-2xl font-black text-white">This Paper &amp; Topper Solution is reserved for Premium PRO Members</h2>
      <p className="text-slate-300 max-w-md">
        This question paper is reserved for Premium members. Includes official line-by-line marking scheme, handwritten answer sheet by Delhi state topper, and AI step checker.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <button
          onClick={()=>setProModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 cursor-pointer flex items-center gap-1.5"
        >
          <Crown size={16}/>
          <span>Unlock with PRO Pass (₹299/mo)</span>
        </button>
        <a className="btn bg-[#131B2E] border-slate-700 text-slate-300 hover:text-white" href="/explore?access=free">
          Find a Free Practice Paper
        </a>
      </div>
      <small className="text-slate-400 font-semibold">Test access available instantly · No credit card required</small>
    </section>

    <aside className="panel bg-[#0C1222] border-2 border-slate-800">
      <h2 className="text-white font-black">Paper Details</h2>
      <dl className="locked-paper-meta text-slate-300">
        {[['Subject',p.subject],['Maximum marks',p.marks??'80 Marks'],['Time allowed',p.duration?p.duration+' minutes':'180 minutes'],['Difficulty',p.difficulty||'Hard'],['Contributor','@'+p.username]].map(([k,v])=>(
          <div key={k} className="border-b border-slate-800/80 py-2.5 flex justify-between text-xs">
            <dt className="text-slate-400">{k}</dt>
            <dd className="font-bold text-white">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-slate-400 text-xs mt-3">{p.description}</p>
      {p.chapters&&<p className="text-slate-300 text-xs mt-2"><strong className="text-white">Chapters:</strong> {p.chapters}</p>}
      
      <button className="btn full-width mt-4" onClick={async()=>{try{const r=await api('papers/'+p.id+'/save',{});toast.success(r.saved?'Saved for later':'Removed from saved papers')}catch(e:any){toast.error(e.message)}}}>
        <Bookmark size={17}/>Save for later
      </button>
      <button className="text-btn report-btn text-xs text-slate-500 mt-2" onClick={()=>onReport(p)}>
        <Flag size={14}/>Report information
      </button>
    </aside>
  </div>

  <ProPassModal open={proModal} onOpenChange={setProModal}/>
 </>;
}
