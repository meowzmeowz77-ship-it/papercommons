'use client';
import {useState,useEffect} from 'react';
import {ChevronRight} from 'lucide-react';
import {Toaster,toast} from 'sonner';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Paper} from '@/lib/types';
import {api} from '@/lib/client';
import {Blank,Picker} from './primitives';
import {UploadPage} from './upload';
import {PaperDetail} from './detail';
import {ProfilePage,CommunityPage} from './social';
import {AdminPage} from './admin';
import {SiteHeader,MobileNavigation} from './site-header';
import {SiteFooter} from './site-footer';
import {Catalog} from './catalog';
import {AnalyticsTracker} from './analytics-tracker';
import {PremiumPage} from './premium';

export default function PaperApp({route=[],initialBoot=null,initialPapers=null,initialDetail=null}:{route:string[];initialBoot?:any;initialPapers?:any;initialDetail?:any}){
  const page=route[0]||'home';
  const [boot,setBoot]=useState<any>(initialBoot),[bootError,setBootError]=useState(''),[refresh,setRefresh]=useState(0),[report,setReport]=useState<any>(null),[reason,setReason]=useState('Incorrect information'),[reportText,setReportText]=useState(''),[reporting,setReporting]=useState(false),[notifications,setNotifications]=useState(false);
  const reload=()=>setRefresh(v=>v+1);
  useEffect(()=>{let live=true;api('bootstrap').then(d=>{if(live){setBoot(d);setBootError('')}}).catch(e=>{if(live)setBootError(e.message)});return()=>{live=false}},[refresh]);
  async function save(p:Paper){try{await api('papers/'+p.id+'/save',{});reload();toast.success(p.saved?'Removed from saved papers':'Paper saved')}catch(e:any){toast.error(e.message)}}
  async function submitReport(){setReporting(true);try{await api('reports',{paper_id:report?.comment_id?null:report?.id,comment_id:report?.comment_id,reason,details:reportText});setReport(null);setReportText('');toast.success('Report submitted for review')}catch(e:any){toast.error(e.message)}finally{setReporting(false)}}
  return <>
    <AnalyticsTracker/><Toaster position="bottom-right" richColors/>
    <SiteHeader page={page} user={boot?.user} unread={!!boot?.notifications?.some((n:any)=>!n.read)} onNotifications={()=>setNotifications(true)}/>
    <div className="app-layout"><main id="main-content" className={'main-content '+(page==='admin'?'admin-content':'')}>
      {bootError&&<div className="onboard-notice" role="status"><span>Some account information could not be loaded.</span><button className="text-btn" onClick={reload}>Retry</button></div>}
      {boot?.user&&!boot.user.onboarded&&page!=='profile'&&<div className="onboard-notice"><span>Make this your study space. Choose your username, board and class.</span><a href="/profile">Set up profile <ChevronRight size={14}/></a></div>}
      {['home','explore','saved','subjects'].includes(page)?<Catalog page={page} boot={boot} initialPapers={initialPapers} refresh={refresh} onSave={save} onReport={setReport}/>:page==='upload'?<UploadPage boot={boot}/>:page==='papers'?<PaperDetail initialData={initialDetail} slug={route.slice(1).join('/')} user={boot?.user} onReport={setReport}/>:page==='community'?<CommunityPage user={boot?.user}/>:page==='profile'?<ProfilePage user={boot?.user} uid={route[1]} boot={boot} refresh={reload} onReport={setReport}/>:page==='admin'?<AdminPage user={boot?.user}/>:page==='premium'?<PremiumPage user={boot?.user}/>:<Blank title="Page not found" description="Head to Explore to find your next question paper."/>}
    </main></div>
    <SiteFooter/><MobileNavigation page={page}/>
    <Dialog open={!!report} onOpenChange={o=>!o&&setReport(null)}><DialogContent><DialogHeader><DialogTitle>Report {report?.comment_id?'comment':'paper'}</DialogTitle><DialogDescription>Help keep PaperCommons accurate, useful, and safe.</DialogDescription></DialogHeader><label>Reason<Picker value={reason} onChange={setReason} options={['Duplicate','Incorrect information','Copyright issue','Contains personal data','Wrong subject','Spam','Inappropriate content','File does not work','Other']}/></label><label>Additional details<textarea value={reportText} onChange={e=>setReportText(e.target.value)} maxLength={2000} rows={4}/></label><button className="btn primary" disabled={reporting} onClick={submitReport}>{reporting?'Submitting…':'Submit report'}</button></DialogContent></Dialog>
    <Dialog open={notifications} onOpenChange={setNotifications}><DialogContent><DialogHeader><DialogTitle>Notifications</DialogTitle><DialogDescription>Updates on your contributions and discussions.</DialogDescription></DialogHeader>{!boot?.user?<div className="quiet-empty"><p>Sign in to receive updates about replies and contributors you follow.</p><button className="btn primary" onClick={()=>{setNotifications(false);window.dispatchEvent(new CustomEvent('open-google-auth'));}}>Sign in with Google</button></div>:boot.notifications?.length?boot.notifications.map((n:any)=><a className={'notification '+(!n.read?'unread':'')} key={n.id} href={n.href}>{n.message}<small>{new Date(n.created_at).toLocaleDateString('en-IN')}</small></a>):<p className="muted">You’re all caught up. New updates will appear here.</p>}{boot?.user&&<button className="btn" onClick={async()=>{try{await api('notifications',{});reload();toast.success('Notifications marked as read')}catch(e:any){toast.error(e.message)}}}>Mark all as read</button>}</DialogContent></Dialog>
  </>;
}
