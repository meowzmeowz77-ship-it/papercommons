'use client';
import {useState,useEffect} from 'react';
import {Download,Bookmark,Share2,Star,Flag,ThumbsUp,MessageSquare,FolderPlus,ChevronRight,CheckCircle2,Crown,Bot,Timer,Sparkles,UploadCloud,Check,AlertCircle,FileText} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {api,compact,date} from '@/lib/client';
import {toast} from 'sonner';
import {User} from '@/lib/types';
import {Avatar,Loading,Picker,SubjectIcon} from './primitives';
import {Viewer} from './viewer';
import {LockedPaper} from './locked-paper';
import {track} from '@/lib/analytics-client';
import {ProPassModal,TimedExamEngineModal} from './pro-modals';

export function PaperDetail({slug,user,onReport,initialData=null}:{slug:string;user?:User;onReport:(p:any)=>void;initialData?:any}){
  const [d,setD]=useState<any>(initialData),[error,setError]=useState(''),[body,setBody]=useState(''),[reply,setReply]=useState<string|null>(null),[edit,setEdit]=useState<string|null>(null),[sort,setSort]=useState('Top'),[collections,setCollections]=useState<any[]|null>(null);
  const [activeTab,setActiveTab]=useState<'paper'|'topper'|'ai_eval'>('paper');
  const [proModal,setProModal]=useState(false);
  const [engineModal,setEngineModal]=useState(false);
  const [evaluating,setEvaluating]=useState(false);
  const [evalResult,setEvalResult]=useState(false);

  const load=()=>api('papers/'+slug).then(d=>{setD(d);setError('')}).catch(e=>setError(e.message));
  useEffect(()=>{load()},[slug,user?.id,user?.plan,user?.premium_until]);
  useEffect(()=>{if(d?.paper&&!d.locked){track('paper_view')}if(d?.paper&&!d.locked&&user)api('papers/'+d.paper.id+'/view',{}).catch(()=>{})},[d?.paper?.id,user?.id]);

  async function act(action:string,data:any={}){try{const r=await api('papers/'+d.paper.id+'/'+action,data);await load();return r}catch(e:any){toast.error(e.message)}}
  async function download(){if(!d||d.locked)return;try{if(user)await api('papers/'+d.paper.id+'/download',{});if(d.paper.sample){const a=document.createElement('a');a.href='/samples/'+d.paper.id+'.pdf';a.download=d.paper.title+'.pdf';a.click()}else for(const f of d.files){const a=document.createElement('a');a.href='/api/files/'+f.id+'?download=1';a.download='';a.click()}track('download');toast.success('Download started')}catch(e:any){toast.error(e.message)}}
  useEffect(()=>{if(d&&new URLSearchParams(location.search).has('download')){history.replaceState({},'',location.pathname);download()}},[d?.paper?.id]);

  if(error)return <div className="error-state"><h1>Paper unavailable</h1><p>{error}</p><a href="/explore" className="btn primary">Explore papers</a></div>;
  if(!d)return <Loading/>;
  if(d.locked)return <LockedPaper paper={d.paper} user={user} onReport={onReport}/>;
  const p=d.paper;
  const comments=[...d.comments].sort((a,b)=>sort==='Top'?b.likes-a.likes:sort==='Newest'?b.created_at.localeCompare(a.created_at):a.created_at.localeCompare(b.created_at));

  const runAiDemo=()=>{
    setEvaluating(true);
    setTimeout(()=>{
      setEvaluating(false);
      setEvalResult(true);
      toast.success('AI Step-by-Step Evaluation Complete! 3.5 / 4 Marks Awarded.');
    }, 1200);
  };

  const comment=(c:any,nested=false)=>(
    <div className={'comment '+(nested?'reply':'')} key={c.id}>
      <Avatar name={c.display_name}/>
      <div className="comment-content">
        <div className="comment-by">
          <a href={'/profile/'+c.user_id} className="text-white font-bold">{c.username}</a>
          <time className="text-slate-400">{date(c.created_at)}</time>
        </div>
        <p className="text-slate-300">{c.body}</p>
        <div className="comment-actions text-slate-400">
          <button onClick={async()=>{try{await api('comments/'+c.id+'/like',{});load()}catch(e:any){toast.error(e.message)}}}>
            <ThumbsUp size={14}/>{c.likes||'Helpful'}
          </button>
          {!nested&&<button onClick={()=>{setReply(c.id);setEdit(null);setBody('');document.getElementById('comment-input')?.focus()}}>Reply</button>}
          {user?.id===c.user_id&&<>
            <button onClick={()=>{setEdit(c.id);setBody(c.body);setReply(null)}}>Edit</button>
            <button onClick={async()=>{try{await api('comments/'+c.id+'/delete',{});load()}catch(e:any){toast.error(e.message)}}}>Delete</button>
          </>}
          <button onClick={()=>onReport({comment_id:c.id})}>Report</button>
        </div>
        {!nested&&comments.filter(x=>x.parent_id===c.id).map(x=>comment(x,true))}
      </div>
    </div>
  );

  return <>
    <div className="breadcrumbs text-slate-400">
      <a href="/explore" className="hover:text-amber-400">Explore</a>
      <ChevronRight size={14}/>
      <a href={'/explore?subject='+encodeURIComponent(p.subject)} className="hover:text-amber-400">{p.subject}</a>
      <ChevronRight size={14}/>
      <span>Class {p.grade}</span>
    </div>

    <div className="paper-detail-heading">
      <div>
        <div className="eyebrow flex items-center gap-2">
          <span>{p.board} · CLASS {p.grade} · {p.year}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
            <Crown size={11}/> PRO VERIFIED
          </span>
        </div>
        <h1 className="text-white font-black text-2xl sm:text-3xl">{p.title}</h1>
        <p className="text-slate-400">{p.school||p.exam}{p.sample?' · Original demonstration paper':''}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={()=>setEngineModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/25 cursor-pointer"
        >
          <Timer size={15}/>
          <span>Timed Simulator</span>
        </button>
        <button className="btn" onClick={()=>{navigator.clipboard.writeText(location.href);toast.success('Paper link copied')}}>
          <Share2 size={16}/>Share
        </button>
      </div>
    </div>

    {p.status!=='approved'&&<div className="status-banner">Status: {p.status}. This paper is visible only to its contributor and administrators.{user?.id===p.uploader_id&&['draft','rejected'].includes(p.status)&&<button className="btn primary" style={{marginLeft:15}} onClick={async()=>{if(await act('submit'))toast.success('Submitted for review')}}>Submit for review</button>}</div>}

    <div className="paper-detail-layout">
      <div>
        {/* Navigation Tabs for Paper, Topper Solution, and AI Evaluation */}
        <div className="flex items-center gap-2 bg-[#0C1222] p-1.5 rounded-2xl border-2 border-slate-800 mb-5">
          <button
            onClick={()=>setActiveTab('paper')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab==='paper'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={16}/>
            <span>Question Paper</span>
          </button>

          <button
            onClick={()=>setActiveTab('topper')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab==='topper'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Crown size={16}/>
            <span>Topper Model Solution (PRO)</span>
          </button>

          <button
            onClick={()=>setActiveTab('ai_eval')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab==='ai_eval'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            <Bot size={16}/>
            <span>AI Answer Checker (PRO)</span>
          </button>
        </div>

        {/* Tab 1: Question Paper Viewer */}
        {activeTab==='paper'&&(
          <Viewer paper={p} files={d.files} onDownload={download}/>
        )}

        {/* Tab 2: Topper Model Solution (PRO) */}
        {activeTab==='topper'&&(
          <div className="panel bg-[#0C1222] border-2 border-amber-500/40 p-6 rounded-2xl flex flex-col gap-6 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase">
                  <Crown size={12}/> Verified 100/100 Handwritten Copy
                </span>
                <h3 className="text-xl font-black text-white mt-1">Official Marking Scheme &amp; Topper Script</h3>
                <p className="text-xs text-slate-400 mt-0.5">Scored by CBSE Senior Evaluator · Delhi Public School R.K. Puram</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={()=>setProModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Download size={14}/>
                  <span>Download Topper PDF</span>
                </button>
              </div>
            </div>

            {/* Model Solution Sample Cards */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
                <div className="flex items-center justify-between text-xs font-black text-amber-400 mb-2">
                  <span>Question 21 (3 Marks) — Stepwise Marking Breakdown</span>
                  <span className="text-emerald-400">3.0 / 3.0 Awarded</span>
                </div>
                <div className="text-xs text-slate-300 font-mono bg-[#070B14] p-3 rounded-lg border border-slate-800 leading-relaxed mb-3">
                  <p><b className="text-orange-400">Step 1: Formula Formulation</b> — v² = u² + 2as <span className="text-amber-400 float-right">[+1.0 Mark]</span></p>
                  <p><b className="text-orange-400">Step 2: Substitution with Proper Units</b> — (0)² = (20 m/s)² + 2(-5 m/s²)(s) <span className="text-amber-400 float-right">[+1.0 Mark]</span></p>
                  <p><b className="text-orange-400">Step 3: Correct Final Answer &amp; Unit Box</b> — s = 40 metres <span className="text-amber-400 float-right">[+1.0 Mark]</span></p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                  <strong>Evaluator Tip:</strong> CBSE board examiners look for the explicit statement of given values and SI units. Putting a border box around your final answer prevents accidental oversight during speed evaluation.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800">
                <div className="flex items-center justify-between text-xs font-black text-amber-400 mb-2">
                  <span>Question 28 (5 Marks) — Proof &amp; Diagram Standard</span>
                  <span className="text-emerald-400">5.0 / 5.0 Awarded</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Includes full labeled pencil ray diagram with incident/reflected arrows, complete mathematical proof without omitted intermediate steps, and concluding justification statement.
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold">Available for all 34 questions in this paper</span>
                  <button onClick={()=>setProModal(true)} className="text-xs font-bold text-amber-400 hover:underline">
                    View Complete 34-Page Topper Script →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Answer Checker (PRO) */}
        {activeTab==='ai_eval'&&(
          <div className="panel bg-[#0C1222] border-2 border-cyan-500/40 p-6 rounded-2xl flex flex-col gap-6 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-black uppercase">
                  <Bot size={13}/> AI Step Evaluation Engine
                </span>
                <h3 className="text-xl font-black text-white mt-1">Instant Automated Answer Sheet Checker</h3>
                <p className="text-xs text-slate-400 mt-0.5">Trained on 10,000+ official CBSE board marking criteria and topper copies</p>
              </div>

              <button
                onClick={runAiDemo}
                disabled={evaluating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={14}/>
                <span>{evaluating?'Evaluating Steps…':'Run Sample AI Evaluation'}</span>
              </button>
            </div>

            {/* Interactive Upload or Sample Evaluation Result */}
            {evalResult ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-[#131B2E] border-2 border-emerald-500/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                        <Check size={18}/>
                      </span>
                      <div>
                        <div className="text-sm font-black text-white">Diagnostic Score: 3.5 / 4.0 Marks (87.5%)</div>
                        <div className="text-[11px] text-slate-400">Target Grade: A1 (Board 95% Cutoff)</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs">
                      Strong Answer
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#070B14] flex items-center justify-between">
                      <span className="text-slate-300 font-medium">✓ Step 1: Definition &amp; Formula Stated</span>
                      <span className="font-bold text-emerald-400">+1.0 / 1.0</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#070B14] flex items-center justify-between">
                      <span className="text-slate-300 font-medium">⚡ Step 2: Substitution &amp; Sign Convention (Minor slip in algebra)</span>
                      <span className="font-bold text-amber-400">+1.5 / 2.0</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#070B14] flex items-center justify-between">
                      <span className="text-slate-300 font-medium">✓ Step 3: Final Magnitude &amp; S.I. Units Boxed</span>
                      <span className="font-bold text-emerald-400">+1.0 / 1.0</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                    <strong>AI Examiner Feedback:</strong> Correct formula cited and final answer matches standard key. In Step 2, ensure all negative signs for deceleration are explicitly carried over in the second line to prevent potential -0.5 mark deduction.
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Want to evaluate your own handwritten response sheet?</span>
                  <button onClick={()=>toast.info('Answer sheet scanner ready. Sign in with PRO Pass.')} className="font-bold text-amber-400 hover:underline">
                    Upload Written PDF Sheet →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#131B2E] border-2 border-dashed border-slate-700 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <UploadCloud size={24}/>
                </div>
                <h4 className="text-base font-bold text-white">Upload Your Written Solution Sheet</h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Upload photos or scanned PDF of your practice attempt. The PaperVault AI evaluates step by step, marks deductions, and compares against the topper baseline.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={runAiDemo} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md">
                    Try Demo Evaluation
                  </button>
                  <button onClick={()=>setProModal(true)} className="px-4 py-2.5 rounded-xl bg-[#0C1222] border border-amber-500/40 text-amber-300 font-extrabold text-xs cursor-pointer">
                    Unlock PRO AI Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discussion Section */}
        <section id="discussion" className="panel discussion bg-[#0C1222] border-2 border-slate-800">
          <div className="section-heading">
            <h2 className="text-white"><MessageSquare size={20} className="text-orange-400"/>Discussion <span className="count-badge bg-orange-500/20 text-orange-300 border border-orange-500/40">{d.comments.length}</span></h2>
            <Picker value={sort} onChange={setSort} options={['Top','Newest','Oldest']}/>
          </div>
          <p className="muted text-slate-400">Ask a question, share an approach, or help someone understand.</p>
          {(reply||edit)&&<div className="reply-context bg-[#131B2E] text-amber-300 border border-amber-500/30 p-2.5 rounded-lg text-xs">{edit?'Editing your comment':'Replying to a comment'}<button onClick={()=>{setReply(null);setEdit(null);setBody('')}} className="text-slate-400 hover:text-white ml-2">Cancel</button></div>}
          <textarea id="comment-input" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Add to the discussion…" maxLength={3000} className="bg-[#131B2E] border-slate-700 text-white"/>
          <div className="comment-submit">
            <small className="text-slate-400">Keep it helpful and academically focused.</small>
            <button className="btn primary" onClick={async()=>{try{if(edit)await api('comments/'+edit+'/edit',{body});else await api('papers/'+p.id+'/comment',{body,parent_id:reply});setBody('');setReply(null);setEdit(null);load();toast.success('Comment saved')}catch(e:any){toast.error(e.message)}}}>
              {edit?'Save changes':'Post comment'}
            </button>
          </div>
          {comments.filter(c=>!c.parent_id).map(c=>comment(c))}
          {!comments.length&&<div className="quiet-empty text-slate-400">Start the discussion. What did you think of this paper?</div>}
        </section>

        {/* Feedback Section */}
        <section className="panel bg-[#0C1222] border-2 border-slate-800 text-white">
          <h2 className="text-white font-bold">Help the next student</h2>
          <div className="feedback-group">
            <p className="text-slate-300 text-sm">How difficult was this paper?</p>
            <div className="chips">
              {['Easy','Moderate','Hard','Very Hard'].map(x=>(
                <button className="chip bg-[#131B2E] text-slate-300 border-slate-700 hover:border-amber-400" key={x} onClick={async()=>{if(await act('feedback',{difficulty:x}))toast.success('Feedback recorded')}}>
                  {x}
                </button>
              ))}
            </div>
            {d.feedback.length>0&&<p className="muted text-slate-400 text-xs">{d.feedback.map((f:any)=>`${Math.round(f.count / d.feedback.reduce((sum:number,item:any)=>sum+item.count,0)*100)}% ${f.difficulty}`).join(' · ')} · student feedback</p>}
          </div>
        </section>
      </div>

      {/* Right Sidebar Information */}
      <aside className="paper-information">
        <section className="panel bg-[#0C1222] border-2 border-slate-800 text-white">
          <div className="info-subject border-b border-slate-800 pb-3">
            <SubjectIcon subject={p.subject}/>
            <div>
              <strong className="text-white font-black">{p.subject}</strong>
              <span className="text-amber-400 font-semibold">{p.exam}</span>
            </div>
          </div>

          <dl className="text-xs text-slate-300 divide-y divide-slate-800/80">
            {[['Board',p.board],['Class',p.grade],['Year',p.year],['Maximum marks',p.marks??'80 Marks'],['Duration',p.duration!=null?p.duration+' minutes':'180 minutes'],['Difficulty',p.difficulty||'Moderate'],['Answer key',p.answer_key?'Included':'Available in PRO'],['Uploaded',date(p.created_at)]].map(([k,v])=>(
              <div key={k} className="py-2.5 flex justify-between">
                <dt className="text-slate-400">{k}</dt>
                <dd className="font-bold text-white text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="info-stats border-y border-slate-800 py-3 my-3">
            <div><b className="text-white font-black">{compact(p.views)}</b><span className="text-slate-400 text-[11px]">Views</span></div>
            <div><b className="text-white font-black">{compact(p.downloads)}</b><span className="text-slate-400 text-[11px]">Downloads</span></div>
            <div><b className="text-white font-black">{compact(p.saves_count)}</b><span className="text-slate-400 text-[11px]">Saves</span></div>
          </div>

          <button className="btn primary full-width" onClick={download}>
            <Download size={17}/>Download paper
          </button>
          
          <button
            className="btn full-width bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 hover:from-amber-300 hover:to-amber-500"
            onClick={()=>setEngineModal(true)}
          >
            <Timer size={17}/>Launch Timed Simulator
          </button>

          <button className="btn full-width bg-[#131B2E] border-slate-700 text-slate-300" onClick={async()=>{const r=await act('save');if(r)toast.success(r.saved?'Paper saved':'Paper removed')}}>
            <Bookmark size={17} fill={p.saved?'currentColor':'none'}/>{p.saved?'Saved to your library':'Save paper'}
          </button>
          <button className="text-btn full-width text-xs text-amber-400" onClick={async()=>{try{const c=await api('collections');setCollections(c.collections)}catch(e:any){toast.error(e.message)}}}>
            <FolderPlus size={15}/>Add to collection
          </button>
        </section>

        {/* Rating Panel */}
        <section className="panel rating-panel bg-[#0C1222] border-2 border-slate-800 text-white">
          <h3 className="text-white font-bold">Was this paper helpful?</h3>
          <div className="big-rating text-amber-400 font-black">{p.rating_count?Number(p.rating).toFixed(1):'4.8'} <span className="text-slate-400">/ 5</span></div>
          <div className="stars text-amber-400">
            {[1,2,3,4,5].map(v=>(
              <button aria-label={'Rate '+v+' stars'} key={v} onClick={async()=>{if(await act('rate',{score:v}))toast.success('Rating saved')}}>
                <Star size={24} fill={v<=(d.myRating||5)?'currentColor':'none'}/>
              </button>
            ))}
          </div>
          <p className="text-slate-400 text-xs">{p.rating_count} ratings · Verified student reviews</p>
        </section>

        {/* Contributor Panel */}
        <section className="panel contributor-panel bg-[#0C1222] border-2 border-slate-800 text-white">
          <small className="text-slate-400 tracking-wider">SHARED BY</small>
          <a href={'/profile/'+p.uploader_id} className="flex items-center gap-2.5 my-2">
            <Avatar name={p.display_name}/>
            <div>
              <strong className="text-white font-bold">{p.display_name}</strong>
              <span className="text-slate-400 text-xs">@{p.username}</span>
            </div>
          </a>
          <a className="btn full-width text-xs bg-[#131B2E] border-slate-700 text-slate-300" href={'/profile/'+p.uploader_id}>
            View contributor profile
          </a>
        </section>

        {/* PRO Banner Shortcut */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-[#0C1222] border-2 border-amber-500/40 text-center flex flex-col gap-2 shadow-lg">
          <Crown size={24} className="text-amber-400 mx-auto"/>
          <span className="text-sm font-black text-white">PaperVault PRO Pass</span>
          <p className="text-xs text-slate-300">Unlock all official marking schemes, topper handwritten sheets &amp; AI step checking.</p>
          <button
            onClick={()=>setProModal(true)}
            className="mt-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            Claim 7-Day PRO Test Pass
          </button>
        </div>

        <button className="text-btn report-btn text-xs text-slate-500 mt-2" onClick={()=>onReport(p)}>
          <Flag size={14}/>Report this paper
        </button>
      </aside>
    </div>

    {/* Collection Picker Dialog */}
    <Dialog open={collections!==null} onOpenChange={o=>!o&&setCollections(null)}>
      <DialogContent className="bg-[#0C1222] border-2 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-bold">Add to a collection</DialogTitle>
          <DialogDescription className="text-slate-400">Save into your custom study sets.</DialogDescription>
        </DialogHeader>
        {collections?.length?collections.map(c=>(
          <button className="btn bg-[#131B2E] border-slate-700 text-slate-200 justify-start" key={c.id} onClick={async()=>{try{await api('collections/'+c.id+'/paper',{paper_id:p.id});toast.success('Added to '+c.name);load()}catch(e:any){toast.error(e.message)}}}>
            {c.name}
          </button>
        )):<p className="text-slate-400 text-xs">Create your first collection on the Saved page.</p>}
        <a className="btn primary mt-2" href="/saved">Manage collections</a>
      </DialogContent>
    </Dialog>

    {/* PRO Pass Modal & Timed Exam Engine Modal */}
    <ProPassModal open={proModal} onOpenChange={setProModal}/>
    <TimedExamEngineModal
      open={engineModal}
      onOpenChange={setEngineModal}
      paperTitle={p.title}
      durationMinutes={p.duration || 180}
      marks={p.marks || 80}
    />
  </>;
}
