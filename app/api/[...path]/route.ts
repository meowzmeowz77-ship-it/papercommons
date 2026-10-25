import {NextRequest} from 'next/server';import{boundedForm}from'@/lib/server/body';
import {db,rows,one,run,id,now,bucket} from '@/lib/server/db';
import {identity,requireAdmin,protect,AppError,str} from '@/lib/server/auth';
import {seed} from '@/lib/server/seed';
import {getPaper,listPapers,selectPaper} from '@/lib/server/papers';
import {upload} from '@/lib/server/upload';
import {isPremium} from '@/lib/server/auth';
import {boundedJson} from '@/lib/server/body';
import {paperDetail} from '@/lib/server/paper-detail';
import {premiumInfo,premiumCommand,joinPremiumInterest,premiumAdminSummary,withPaperAccess} from '@/lib/server/premium';
import {receiveAnalytics,trafficSummary} from '@/lib/server/analytics';
import {getAdminSignature} from '@/app/chatgpt-auth';
import {handleAvkEvaluation} from '@/lib/server/avk';
import {createRazorpayOrder,verifyRazorpayPayment,activateInstantPass} from '@/lib/server/billing';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function handle(req:NextRequest){try{await seed();const parts=new URL(req.url).pathname.replace(/^\/api\//,'').split('/').map(decodeURIComponent),[section,key,action]=parts,url=new URL(req.url);let u=await identity();
if(section==='analytics'&&req.method==='POST')return json(await receiveAnalytics(req,u));
if(section==='auth'){
  if(key==='google'){
    const ADMIN_PASSWORD=(env as any).ADMIN_PASSWORD||process.env.ADMIN_PASSWORD||'@Cr7meow30';
    if(req.method==='GET'){
      const email=(url.searchParams.get('email')||'').trim().toLowerCase();
      const isAdminEmail=email==='vihan.agrawal4@gmail.com';
      if(isAdminEmail){
        const pass=(url.searchParams.get('password')||'').trim();
        if(pass!==ADMIN_PASSWORD){
          return Response.redirect(new URL('/admin?error=unauthorized',req.url));
        }
      }
      const returnTo=url.searchParams.get('return_to')||(isAdminEmail?'/admin':'/');
      if(email&&email.includes('@')){
        const name=url.searchParams.get('name')||(isAdminEmail?'Vihan Agrawal':email.split('@')[0]);
        const googleId='google_'+email.replace(/[^a-zA-Z0-9]/g,'_');
        const adminSig=isAdminEmail?getAdminSignature(email,ADMIN_PASSWORD):undefined;
        const token=Buffer.from(JSON.stringify({userId:googleId,email,displayName:name,fullName:name,adminSig})).toString('base64');
        return new Response(null,{status:302,headers:{'Location':returnTo,'Set-Cookie':`pc_google_auth=${token}; Path=/; SameSite=Lax; HttpOnly; Max-Age=2592000`,'Cache-Control':'no-store'}});
      }
      return Response.redirect(new URL('/',req.url));
    }
    if(req.method==='POST'){
      const b:any=await boundedJson(req);
      const email=str(b.email,120).trim().toLowerCase();
      if(!email||!email.includes('@'))throw new AppError(400,'A valid Google email is required.');
      const isAdminEmail=email==='vihan.agrawal4@gmail.com';
      if(isAdminEmail){
        const pass=String(b.password||b.adminSecret||'').trim();
        if(!pass||pass!==ADMIN_PASSWORD){
          throw new AppError(403,'Unauthorized: Incorrect administrator password. Access to vihan.agrawal4@gmail.com is restricted.');
        }
      }
      const name=str(b.name,80)||(isAdminEmail?'Vihan Agrawal':email.split('@')[0]);
      const googleId='google_'+email.replace(/[^a-zA-Z0-9]/g,'_');
      const adminSig=isAdminEmail?getAdminSignature(email,ADMIN_PASSWORD):undefined;
      const token=Buffer.from(JSON.stringify({userId:googleId,email,displayName:name,fullName:name,adminSig})).toString('base64');
      const resHeaders=new Headers();
      resHeaders.append('Set-Cookie',`pc_google_auth=${token}; Path=/; SameSite=Lax; HttpOnly; Max-Age=2592000`);
      resHeaders.append('Content-Type','application/json');
      resHeaders.append('Cache-Control','no-store');
      return new Response(JSON.stringify({ok:true,user:{id:googleId,email,display_name:name,role:isAdminEmail?'admin':'student'}}),{status:200,headers:resHeaders});
    }
  }
  if(key==='signout'){
    const resHeaders=new Headers();
    resHeaders.append('Set-Cookie','pc_google_auth=; Path=/; SameSite=Lax; HttpOnly; Max-Age=0');
    resHeaders.append('Set-Cookie','__sites_local_auth=; Path=/; SameSite=Lax; HttpOnly; Max-Age=0');
    if(req.method==='GET'){
      resHeaders.append('Location','/');
      return new Response(null,{status:302,headers:resHeaders});
    }
    resHeaders.append('Content-Type','application/json');
    return new Response(JSON.stringify({ok:true}),{status:200,headers:resHeaders});
  }
}
if(req.method==='GET'){
if(section==='premium')return json(await premiumInfo(u));
if(section==='avk')return json({connected:true,status:'active',engine:'AVK Step-by-Step AI Examiner',version:'2.4.0-cbse',models:['cbse-step-evaluator','topper-comparative-v2'],supported_subjects:['Mathematics','Science','Social Science','Physics','Chemistry','Biology']});
if(section==='bootstrap'){const taxonomy=await rows('SELECT * FROM taxonomy WHERE enabled=1 ORDER BY position');const counts=await rows("SELECT subject,COUNT(*) count FROM papers WHERE status='approved' GROUP BY subject");const stats=await one("SELECT COUNT(*) papers,COALESCE(SUM(downloads),0) downloads FROM papers WHERE status='approved'");return json({user:u,taxonomy,counts,stats,notifications:u?await rows('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30',u.id):[]})}
if(section==='papers'&&!key)return json(await listPapers(url,u));
if(section==='papers'&&key)return json(await paperDetail(key,u));
if(section==='avatar'){const owner=await one('SELECT avatar FROM users WHERE id=?',key);if(!owner?.avatar)throw new AppError(404,'Avatar unavailable.');const object=await bucket().get(owner.avatar);if(!object)throw new AppError(404,'Avatar unavailable.');return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'image/png','X-Content-Type-Options':'nosniff','Cache-Control':'private,max-age=300'}})}
if(section==='files'){const f=await one('SELECT * FROM files WHERE id=?',key);if(!f)throw new AppError(404,'File unavailable.');await getPaper(f.paper_id,u);const object=await bucket().get(f.key);if(!object)throw new AppError(404,'File unavailable.');return new Response(object.body,{headers:{'Content-Type':f.mime,'Content-Disposition':(url.searchParams.has('download')?'attachment':'inline')+'; filename="question-paper.'+(f.mime==='application/pdf'?'pdf':f.mime==='image/png'?'png':'jpg')+'"','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'",'Cache-Control':'private, no-store'}})}
if(section==='collections'){if(!u)throw new AppError(401,'Sign in to see collections.');return json({collections:await rows('SELECT c.*,(SELECT COUNT(*) FROM collection_papers WHERE collection_id=c.id) count FROM collections c WHERE user_id=?',u.id)})}
if(section==='community'){return json({contributors:await rows("SELECT u.id,u.username,u.display_name,u.created_at,(SELECT COUNT(*) FROM papers WHERE uploader_id=u.id AND status='approved') uploads,(SELECT COALESCE(SUM(downloads),0) FROM papers WHERE uploader_id=u.id) downloads,(SELECT COALESCE(SUM(value),0) FROM points WHERE user_id=u.id) points,(SELECT COUNT(*) FROM follows WHERE follower_id=? AND following_id=u.id) following FROM users u WHERE status='active' ORDER BY points DESC,uploads DESC LIMIT 20",u?.id||''),discussions:await rows("SELECT c.*,u.username,p.title,p.slug,(SELECT COUNT(*) FROM comment_likes WHERE comment_id=c.id) likes FROM comments c JOIN users u ON u.id=c.user_id JOIN papers p ON p.id=c.paper_id WHERE c.status='active' AND p.status='approved' AND (COALESCE(p.premium_only,0)=0 OR ?=1) ORDER BY likes DESC,c.created_at DESC LIMIT 20",isPremium(u)?1:0)})}
if(section==='profile'){const uid=key||u?.id;if(!uid)throw new AppError(401,'Sign in to view your profile.');const profile=await one('SELECT id,username,display_name,avatar,board,grade,school,city,created_at FROM users WHERE id=?',uid);if(!profile)throw new AppError(404,'Contributor not found.');return json({profile,stats:await one("SELECT COUNT(*) uploads,COALESCE(SUM(views),0) views,COALESCE(SUM(downloads),0) downloads FROM papers WHERE uploader_id=? AND status='approved'",uid),points:(await one('SELECT COALESCE(SUM(value),0) value FROM points WHERE user_id=?',uid)).value,followers:(await one('SELECT COUNT(*) count FROM follows WHERE following_id=?',uid)).count,following:!!await one('SELECT 1 FROM follows WHERE follower_id=? AND following_id=?',u?.id||'',uid),papers:(await rows(selectPaper+" FROM papers p JOIN users u ON u.id=p.uploader_id WHERE uploader_id=? AND (p.status='approved' OR ?=p.uploader_id) ORDER BY p.created_at DESC",uid,u?.status==='active'?u?.id||'':'')).map(p=>withPaperAccess(p,u)),activity:uid===u?.id?await rows('SELECT a.*,p.title,p.slug FROM activity a LEFT JOIN papers p ON p.id=a.paper_id WHERE a.user_id=? ORDER BY a.created_at DESC LIMIT 40',uid):[]})}
if(section==='admin'){await requireAdmin();return json({stats:await one("SELECT (SELECT COUNT(*) FROM users WHERE id NOT LIKE 'sample-%') users,(SELECT COUNT(DISTINCT a.user_id) FROM activity a JOIN users au ON au.id=a.user_id WHERE au.role<>'admin' AND a.created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days')) active_users,(SELECT COUNT(*) FROM papers) papers,(SELECT COUNT(*) FROM papers WHERE status='pending') pending,(SELECT COUNT(*) FROM reports WHERE status='open') reports,(SELECT COALESCE(SUM(downloads),0) FROM papers) downloads,(SELECT COALESCE(SUM(views),0) FROM papers) views,(SELECT COUNT(*) FROM comments WHERE status='active') comments,(SELECT COUNT(*) FROM papers WHERE substr(created_at,1,10)=date('now')) uploads_today"),papers:await rows(selectPaper+' FROM papers p JOIN users u ON u.id=p.uploader_id ORDER BY p.created_at DESC LIMIT 200'),users:await rows('SELECT * FROM users ORDER BY created_at DESC LIMIT 200'),reports:await rows('SELECT r.*,p.title FROM reports r LEFT JOIN papers p ON p.id=r.paper_id ORDER BY created_at DESC LIMIT 100'),comments:await rows('SELECT c.*,u.username FROM comments c JOIN users u ON u.id=c.user_id ORDER BY created_at DESC LIMIT 100'),taxonomy:await rows('SELECT * FROM taxonomy ORDER BY kind,position'),settings:await rows('SELECT * FROM settings'),analytics:await rows('SELECT kind,COUNT(*) count FROM activity GROUP BY kind'),searches:await rows("SELECT query,COUNT(*) count FROM activity WHERE kind IN ('search','zero_results') GROUP BY query ORDER BY count DESC LIMIT 15"),audit:await rows('SELECT * FROM moderation ORDER BY created_at DESC LIMIT 50'),premium:await premiumAdminSummary(),traffic:await trafficSummary([7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30)})}
throw new AppError(404,'Page not found.');}
u=await protect(req);
if(section==='avatar'){if(Number(req.headers.get('content-length')||0)>2200000)throw new AppError(413,'Profile pictures must be under 2 MB.');const f=(await boundedForm(req,2200000)).get('avatar');if(!(f instanceof File)||f.size>2000000)throw new AppError(400,'Choose a JPG or PNG under 2 MB.');const bytes=new Uint8Array(await f.arrayBuffer());const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71,jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const mime=png?'image/png':jpg?'image/jpeg':'';if(!mime||mime!==f.type||!(/\.(png|jpe?g)$/i.test(f.name)))throw new AppError(400,'Choose a valid JPG or PNG image.');const key='avatars/'+id();await bucket().put(key,bytes,{httpMetadata:{contentType:mime}});await run('UPDATE users SET avatar=?,updated_at=? WHERE id=?',key,now(),u.id);if(u.avatar)await bucket().delete(u.avatar);return json({ok:true})}
if(section==='upload')return json(await upload(req,u),201);
if(Number(req.headers.get('content-length')||0)>65536)throw new AppError(413,'Request is too large.');const b:any=await boundedJson(req); if(!b||typeof b!=="object"||Array.isArray(b))throw new AppError(400,"Invalid request.");
if(section==='profile'){const username=str(b.username,30);if(!/^[a-zA-Z0-9_]{3,30}$/.test(username))throw new AppError(400,'Use 3–30 letters, numbers or underscores for your username.');if(!str(b.display_name,80))throw new AppError(400,'Enter your display name.');const taken=await one('SELECT id FROM users WHERE lower(username)=lower(?) AND id<>?',username,u.id);if(taken)throw new AppError(409,'That username is already taken.');await run('UPDATE users SET username=?,display_name=?,board=?,grade=?,school=?,city=?,notify=?,onboarded=1,updated_at=? WHERE id=?',username,str(b.display_name,80),str(b.board,80),str(b.grade,30),str(b.school),str(b.city),b.notify===false?0:1,now(),u.id);return json({ok:true})}
if(section==='papers'){const p=await getPaper(key,u,{preview:action==='save'});if(action==='submit'){if(p.uploader_id!==u.id)throw new AppError(403,'Only the contributor can submit this draft.');if(!['draft','rejected'].includes(p.status))throw new AppError(400,'This paper has already been submitted.');await run("UPDATE papers SET status='pending',updated_at=? WHERE id=?",now(),p.id);return json({ok:true})}if(action==='save'){const existing=await one('SELECT 1 FROM saves WHERE user_id=? AND paper_id=?',u.id,p.id);if(existing){await run('DELETE FROM saves WHERE user_id=? AND paper_id=?',u.id,p.id);await run('DELETE FROM collection_papers WHERE paper_id=? AND collection_id IN (SELECT id FROM collections WHERE user_id=?)',p.id,u.id)}else await run('INSERT INTO saves(user_id,paper_id,created_at) VALUES(?,?,?)',u.id,p.id,now());return json({saved:!existing})}
if(action==='rate'){const score=Number(b.score);if(!Number.isInteger(score)||score<1||score>5)throw new AppError(400,'Choose a rating from 1 to 5.');await run('INSERT INTO ratings(user_id,paper_id,score) VALUES(?,?,?) ON CONFLICT(user_id,paper_id) DO UPDATE SET score=excluded.score',u.id,p.id,score);const agg=await one('SELECT AVG(score) avg,COUNT(*) count FROM ratings WHERE paper_id=?',p.id);if(agg.count>=5&&agg.avg>=4.5)await run('INSERT OR IGNORE INTO points(id,user_id,event,value,created_at) VALUES(?,?,?,?,?)',id(),p.uploader_id,'rated:'+p.id,10,now());return json({ok:true})}
if(action==='comment'){const body=str(b.body,3000);if(!body)throw new AppError(400,'Write a comment first.');let parent=null;if(b.parent_id){const c=await one("SELECT * FROM comments WHERE id=? AND paper_id=? AND status='active'",b.parent_id,p.id);if(!c)throw new AppError(400,'Reply unavailable.');if(c.parent_id)throw new AppError(400,'Reply to the main comment to keep the discussion readable.');parent=c.id;if(c.user_id!==u.id)await notify(c.user_id,'Someone replied to your comment.','/papers/'+p.slug)}await run('INSERT INTO comments(id,paper_id,user_id,parent_id,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',id(),p.id,u.id,parent,body,now(),now());return json({ok:true})}
if(action==='feedback'){const difficulty=['Easy','Moderate','Hard','Very Hard'].includes(b.difficulty)?b.difficulty:null;await run('INSERT INTO feedback(user_id,paper_id,difficulty,useful,accurate) VALUES(?,?,?,?,?) ON CONFLICT(user_id,paper_id) DO UPDATE SET difficulty=COALESCE(excluded.difficulty,difficulty),useful=COALESCE(excluded.useful,useful),accurate=COALESCE(excluded.accurate,accurate)',u.id,p.id,difficulty,typeof b.useful==='boolean'?Number(b.useful):null,typeof b.accurate==='boolean'?Number(b.accurate):null);return json({ok:true})}
if(action==='view'||action==='download'){const recent=await one('SELECT id FROM activity WHERE user_id=? AND paper_id=? AND kind=? AND created_at>?',u.id,p.id,action,new Date(Date.now()-30*60000).toISOString());if(!recent){await db().batch([db().prepare(`UPDATE papers SET ${action==='view'?'views':'downloads'}=${action==='view'?'views':'downloads'}+1 WHERE id=?`).bind(p.id),db().prepare('INSERT INTO activity(id,user_id,paper_id,kind,created_at) VALUES(?,?,?,?,?)').bind(id(),u.id,p.id,action,now())]);if(action==='download'&&(p.downloads+1)%100===0){await run('INSERT OR IGNORE INTO points(id,user_id,event,value,created_at) VALUES(?,?,?,?,?)',id(),p.uploader_id,'downloads:'+p.id+':'+(p.downloads+1),10,now());await notify(p.uploader_id,`Your paper reached ${p.downloads+1} downloads.`,'/papers/'+p.slug)}}return json({ok:true})}}
if(section==='comments'){const c=await one('SELECT * FROM comments WHERE id=?',key);if(!c)throw new AppError(404,'Comment not found.');await getPaper(c.paper_id,u);if(action==='like'){if(c.user_id===u.id)throw new AppError(400,'You cannot like your own comment.');const old=await one('SELECT 1 FROM comment_likes WHERE user_id=? AND comment_id=?',u.id,key);if(old)await run('DELETE FROM comment_likes WHERE user_id=? AND comment_id=?',u.id,key);else{await run('INSERT INTO comment_likes(user_id,comment_id) VALUES(?,?)',u.id,key);await run('INSERT OR IGNORE INTO points(id,user_id,event,value,created_at) VALUES(?,?,?,?,?)',id(),c.user_id,'helpful:'+key,2,now())}return json({ok:true})}if(c.user_id!==u.id)throw new AppError(403,'You can only edit your own comments.');if(action==='delete')await run("UPDATE comments SET status='deleted' WHERE id=?",key);else{const body=str(b.body,3000);if(!body)throw new AppError(400,'Comment cannot be empty.');await run('UPDATE comments SET body=?,updated_at=? WHERE id=?',body,now(),key)}return json({ok:true})}
if(section==='reports'){if(!b.paper_id&&!b.comment_id)throw new AppError(400,'Select a paper or comment.');if(b.paper_id)await getPaper(b.paper_id,u,{preview:true});if(b.comment_id){const c=await one('SELECT paper_id FROM comments WHERE id=?',b.comment_id);if(!c)throw new AppError(404,'Comment not found.');await getPaper(c.paper_id,u)}if(!str(b.reason))throw new AppError(400,'Choose a reason.');await run('INSERT INTO reports(id,user_id,paper_id,comment_id,reason,details,created_at) VALUES(?,?,?,?,?,?,?)',id(),u.id,b.paper_id||null,b.comment_id||null,str(b.reason),str(b.details,2000),now());return json({ok:true})}
if(section==='collections'){if(action==='paper'){const c=await one('SELECT id FROM collections WHERE id=? AND user_id=?',key,u.id);if(!c)throw new AppError(404,'Collection not found.');await getPaper(b.paper_id,u,{preview:true});if(b.remove)await run('DELETE FROM collection_papers WHERE collection_id=? AND paper_id=?',key,b.paper_id);else{await run('INSERT OR IGNORE INTO saves(user_id,paper_id,created_at) VALUES(?,?,?)',u.id,b.paper_id,now());await run('INSERT OR IGNORE INTO collection_papers(collection_id,paper_id) VALUES(?,?)',key,b.paper_id)}return json({ok:true})}const name=str(b.name,80);if(!name)throw new AppError(400,'Name your collection.');await run('INSERT INTO collections(id,user_id,name) VALUES(?,?,?)',id(),u.id,name);return json({ok:true})}
if(section==='follow'){if(key===u.id)throw new AppError(400,'You cannot follow yourself.');if(!await one('SELECT id FROM users WHERE id=?',key))throw new AppError(404,'Contributor not found.');const old=await one('SELECT 1 FROM follows WHERE follower_id=? AND following_id=?',u.id,key);if(old)await run('DELETE FROM follows WHERE follower_id=? AND following_id=?',u.id,key);else await run('INSERT INTO follows(follower_id,following_id) VALUES(?,?)',u.id,key);return json({following:!old})}
if(section==='notifications'){await run('UPDATE notifications SET read=1 WHERE user_id=?',u.id);return json({ok:true})}
if(section==='search'){b.q=str(b.q,160).replace(/\S*@\S*/g,'[private]').replace(/\b\d{8,}\b/g,'[private]');await run('INSERT INTO activity(id,user_id,kind,query,created_at) VALUES(?,?,?,?,?)',id(),u.id,b.empty?'zero_results':'search',str(b.q,160),now());return json({ok:true})}
if(section==='avk')return json(await handleAvkEvaluation(b,u));
if(section==='billing'){
  if(key==='razorpay'&&action==='order')return json(await createRazorpayOrder(u));
  if(key==='razorpay'&&action==='verify')return json(await verifyRazorpayPayment(b,u));
  if(key==='instant-pass'||action==='instant-pass')return json(await activateInstantPass(u));
  return json(await createRazorpayOrder(u));
}
if(section==='premium'){if(key==='interest')return json(await joinPremiumInterest(u));await requireAdmin();return json(await premiumCommand(key,action,b,u))}
if(section==='admin'){await requireAdmin();const reason=str(b.reason,1000);if(!reason)throw new AppError(400,'Add a moderation reason.');if(key==='paper'){const p=await one('SELECT * FROM papers WHERE id=?',b.id);if(!p)throw new AppError(404,'Paper not found.');if(b.action==='feature')await run('UPDATE papers SET featured=? WHERE id=?',p.featured?0:1,b.id);else if(b.action==='edit'){await run('UPDATE papers SET title=?,description=?,school=?,chapters=?,updated_at=? WHERE id=?',str(b.title),str(b.description,3000),str(b.school),str(b.chapters,1000),now(),b.id)}else{const statuses:any={approve:'approved',reject:'rejected',hide:'hidden',restore:'approved',delete:'deleted'};if(!statuses[b.action])throw new AppError(400,'Invalid action.');await run('UPDATE papers SET status=?,updated_at=? WHERE id=?',statuses[b.action],now(),b.id);if(statuses[b.action]==='approved'){await run('INSERT OR IGNORE INTO points(id,user_id,event,value,created_at) VALUES(?,?,?,?,?)',id(),p.uploader_id,'approved:'+p.id,20,now());await notify(p.uploader_id,'Your paper was approved.','/papers/'+p.slug);if(p.status!=='approved'){for(const f of await rows('SELECT follower_id FROM follows WHERE following_id=?',p.uploader_id))await notify(f.follower_id,'A contributor you follow uploaded a new paper.','/papers/'+p.slug)}}}}
else if(key==='user'){if(b.id===u.id)throw new AppError(400,'You cannot restrict your own account.');if(b.action==='warn')await notify(b.id,'Moderator message: '+reason,'/profile');else{const statuses:any={suspend:'suspended',ban:'banned',restore:'active'};if(!statuses[b.action])throw new AppError(400,'Invalid action.');await run('UPDATE users SET status=?,updated_at=? WHERE id=?',statuses[b.action],now(),b.id)}}
else if(key==='report')await run("UPDATE reports SET status='resolved' WHERE id=?",b.id);
else if(key==='comment')await run("UPDATE comments SET status=? WHERE id=?",b.action==='restore'?'active':'deleted',b.id);
else if(key==='taxonomy'){if(!['subject','board','grade','exam','school'].includes(b.kind))throw new AppError(400,'Invalid category.');const name=str(b.name,100);if(!name)throw new AppError(400,'Enter a name.');const old=b.id?await one('SELECT * FROM taxonomy WHERE id=?',b.id):null;await run('INSERT INTO taxonomy(id,kind,name,position,enabled) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,position=excluded.position,enabled=excluded.enabled',b.id||id(),b.kind,name,Number(b.position)||0,b.enabled===false?0:1);if(old&&old.name!==name&&['subject','board','grade','exam'].includes(old.kind))await run(`UPDATE papers SET ${old.kind}=? WHERE ${old.kind}=?`,name,old.name)}
else if(key==='settings'){if(!['manual','automatic'].includes(b.mode))throw new AppError(400,'Invalid moderation mode.');await run("UPDATE settings SET value=? WHERE key='moderation'",b.mode)}else throw new AppError(404,'Action not found.');await run('INSERT INTO moderation(id,admin_id,target_id,action,reason,created_at) VALUES(?,?,?,?,?,?)',id(),u.id,b.id||key,key+':'+(b.action||'update'),reason,now());return json({ok:true})}
throw new AppError(404,'Action not found.');
}catch(e){if(e instanceof SyntaxError)return json({error:'Please check the request and try again.'},400);if(e instanceof AppError)return json({error:e.message},e.status);console.error('API request failed',e);return json({error:'Something went wrong. Your changes were not completed. Please try again.'},500)}}
async function notify(user:string,message:string,href:string){const p=await one('SELECT notify FROM users WHERE id=?',user);if(p?.notify)await run('INSERT INTO notifications(id,user_id,message,href,created_at) VALUES(?,?,?,?,?)',id(),user,message,href,now())}
export const GET=handle;export const POST=handle;
