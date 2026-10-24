import {AppError} from './auth';
import {boundedJson} from './body';
import {db,id,now,one,rows,run} from './db';
import {getPaper} from './papers';

const staticPaths=new Set(['/','/explore','/subjects','/saved','/upload','/community','/profile','/premium','/admin']);
const eventKinds=new Set(['page_view','paper_view','download','search','premium_interest']);
async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
export async function receiveAnalytics(req:Request,user:any){
 if(req.headers.get('origin')!==new URL(req.url).origin||req.headers.get('sec-fetch-site')==='cross-site')throw new AppError(403,'Request blocked.');
 if(req.headers.get('dnt')==='1'||req.headers.get('sec-gpc')==='1')return {ok:true,recorded:false};
 const b=await boundedJson(req,2048);
 if(!eventKinds.has(b.kind)||typeof b.client_id!=='string'||!(/^[a-f0-9-]{36}$/i.test(b.client_id)))throw new AppError(400,'Invalid activity event.');
 const minute=Math.floor(Date.now()/60000),actor=await digest(b.client_id),ip=req.headers.get('cf-connecting-ip');
 const limitKey='analytics:'+await digest((ip||actor)+':'+minute);
 await run('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',limitKey,minute+2);
 if((await one('SELECT count FROM rate_limits WHERE key=?',limitKey)).count>90)throw new AppError(429,'Please wait before sending more activity.');
 if((await one('SELECT COUNT(*) count FROM analytics_events WHERE created_at>?',new Date(Date.now()-60000).toISOString())).count>=3000)return {ok:true,recorded:false};
 let path=String(b.path||'').split('?')[0].slice(0,180),paperId:string|null=null;
 if(path.startsWith('/papers/')){const paper=await getPaper(decodeURIComponent(path.slice(8)),user,{preview:b.kind==='page_view'});path='/papers/'+paper.slug;paperId=paper.id;}
 else if(!staticPaths.has(path))throw new AppError(400,'Invalid activity page.');
 if(['paper_view','download'].includes(b.kind)&&!paperId)throw new AppError(400,'Choose a paper.');
 if(b.kind==='premium_interest'&&path!=='/premium')throw new AppError(400,'Invalid activity page.');
 if(user?.role==='admin')return {ok:true,recorded:false}; // Owner reviews do not inflate student traffic.
 const recent=await one('SELECT 1 FROM analytics_events WHERE actor_key=? AND kind=? AND path=? AND created_at>?',actor,b.kind,path,new Date(Date.now()-(b.kind==='download'?1800000:60000)).toISOString());
 if(recent)return {ok:true,recorded:false};
 await db().batch([db().prepare('INSERT INTO analytics_events(id,actor_key,user_id,kind,path,paper_id,created_at) VALUES(?,?,?,?,?,?,?)').bind(id(),actor,user?.status==='active'?user.id:null,b.kind,path,paperId,now()),db().prepare('DELETE FROM rate_limits WHERE expires<?').bind(minute),db().prepare('DELETE FROM analytics_events WHERE created_at<?').bind(new Date(Date.now()-90*86400000).toISOString())]);
 return {ok:true,recorded:true};
}

export async function trafficSummary(days=30){
 const cutoff=new Date(Date.now()-days*86400000).toISOString();
 return {days,summary:await one("SELECT COUNT(*) events,COUNT(DISTINCT actor_key) sessions,COUNT(DISTINCT user_id) signed_in_students,COALESCE(SUM(kind='page_view'),0) page_views,COALESCE(SUM(kind='paper_view'),0) paper_opens,COALESCE(SUM(kind='download'),0) download_clicks FROM analytics_events WHERE created_at>=?",cutoff),daily:await rows("SELECT substr(created_at,1,10) day,SUM(kind='page_view') page_views,COUNT(DISTINCT actor_key) sessions FROM analytics_events WHERE created_at>=? GROUP BY day ORDER BY day",cutoff),pages:await rows("SELECT path,COUNT(*) views,COUNT(DISTINCT actor_key) sessions FROM analytics_events WHERE kind='page_view' AND created_at>=? GROUP BY path ORDER BY views DESC LIMIT 20",cutoff),papers:await rows("SELECT p.title,p.slug,SUM(e.kind='paper_view') opens,SUM(e.kind='download') downloads FROM analytics_events e JOIN papers p ON p.id=e.paper_id WHERE e.created_at>=? AND p.status='approved' GROUP BY p.id ORDER BY opens DESC,downloads DESC LIMIT 10",cutoff)};
}
