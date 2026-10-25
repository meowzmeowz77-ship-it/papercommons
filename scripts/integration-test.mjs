import {Miniflare} from 'miniflare';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const mf=new Miniflare({modules:[{type:'ESModule',path:path.resolve('dist/server/index.js')},...(await readdir('dist/server',{recursive:true})).filter(f=>f.endsWith('.js')&&f!=='index.js').map(f=>({type:'ESModule',path:path.resolve('dist/server',f)}))],modulesRoot:'dist/server',modulesRules:[{type:'ESModule',include:['**/*.js'],fallthrough:true}],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{ADMIN_EMAILS:'admin@test.local'},assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}}});
let checked=0;
async function request(path,body,who='student',expected=200){const headers={};if(who){headers['oai-authenticated-user-id']='test-'+who;headers['oai-authenticated-user-email']=who+'@test.local'}if(body!==undefined)headers['Content-Type']='application/json';const r=await mf.dispatchFetch('https://test.local/api/'+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={text:text.slice(0,300)}}assert.equal(r.status,expected,`${path}: ${JSON.stringify(data)}`);checked++;return data}
try{
const db=await mf.getD1Database('DB');for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){const migration=await readFile('drizzle/'+file,'utf8');for(const sql of migration.split('--> statement-breakpoint').filter(x=>x.trim()))await db.prepare(sql).run();}
// Reproduce the five previously published scans in an isolated database.
const scanIds=['term1-2026-english','term1-2026-hindi','term1-2026-mathematics','term1-2026-science','term1-2026-social-science'];
await db.prepare("INSERT INTO users(id,username,display_name,created_at,updated_at) VALUES('sample-editor','papercommons_team','PaperCommons Team','2026-10-01','2026-10-01')").run();
for(const scanId of scanIds){
  await db.prepare("INSERT INTO papers(id,slug,title,uploader_id,board,grade,subject,exam,year,status,featured,created_at,updated_at) VALUES(?,?,?,'sample-editor','CBSE','10','Mathematics','Term 1',2026,'approved',1,'2026-10-01','2026-10-01')").bind(scanId,scanId,scanId+' Partial Scan').run();
  await db.prepare("INSERT INTO files(id,paper_id,key,mime,size,hash,position) VALUES(?,?,?,'application/pdf',5,?,0)").bind(scanId+'-pdf',scanId,scanId+'.pdf',scanId).run();
}
await request('bootstrap');await request('bootstrap',undefined,'admin');await request('bootstrap',undefined,'other');
const termPapers=await request('papers?exam=Term+1',undefined,null);
assert.equal(termPapers.total,0);
for(const scanId of scanIds){
  assert.equal((await db.prepare('SELECT status,featured FROM papers WHERE id=?').bind(scanId).first()).status,'deleted');
  await request('papers/'+scanId,undefined,null,404);
  const f=await mf.dispatchFetch('https://test.local/api/files/'+scanId+'-pdf?download=1');
  assert.equal(f.status,404);checked++;
}
await request('bootstrap');await request('papers/term1-2026-hindi',undefined,null,404);
assert.equal((await db.prepare("SELECT COUNT(*) n FROM files WHERE paper_id LIKE 'term1-2026-%'").first()).n,5);
assert.equal((await db.prepare("SELECT COUNT(*) n FROM papers WHERE id LIKE 'sample-%' AND status='approved'").first()).n,12);
assert.equal((await db.prepare("SELECT COUNT(*) n FROM moderation WHERE action='delete'").first()).n,5);
// Verify the one-time profile backfill preserves existing paper relationships.
await db.prepare("UPDATE users SET username='temporary_seed_name' WHERE id='sample-editor'").run();
await db.prepare("INSERT INTO users(id,username,display_name,created_at,updated_at) SELECT 'sample-vihan','Vihan123','Vihan Agrawal',created_at,updated_at FROM users WHERE id='sample-editor'").run();
await db.prepare("UPDATE papers SET uploader_id='sample-vihan' WHERE uploader_id='sample-editor'").run();
await db.prepare("UPDATE points SET user_id='sample-vihan' WHERE user_id='sample-editor'").run();
await db.prepare("UPDATE notifications SET user_id='sample-vihan' WHERE user_id='sample-editor'").run();
await db.prepare("DELETE FROM users WHERE id='sample-editor'").run();
await db.prepare("DELETE FROM settings WHERE key='brand_profile_v2'").run();
await request('bootstrap');
const branded=await request('community');assert.ok(branded.contributors.some(c=>c.id==='sample-editor'&&c.display_name==='PaperCommons Team'));assert.ok(!branded.contributors.some(c=>/vihan|agrawal/i.test(c.display_name+' '+c.username)));

const list=await request('papers?q=CBSE+class+10+maths+preboard');assert.equal(list.papers.length,1);assert.equal(list.papers[0].subject,'Mathematics');const p=list.papers[0];
await request('papers/'+p.id+'/save',{});assert.equal((await request('papers?saved=1')).papers.length,1);
await request('papers/'+p.id+'/rate',{score:4});await request('papers/'+p.id+'/rate',{score:5});assert.equal((await request('papers/'+p.id)).paper.rating_count,1);
await request('papers/'+p.id+'/rate',{score:8},'student',400);
await request('papers/'+p.id+'/comment',{body:'Helpful practice set.'});const comments=(await request('papers/'+p.id)).comments;assert.equal(comments.length,1);
await request('comments/'+comments[0].id+'/edit',{body:'Changed'},'other',403);
await request('papers/'+p.id+'/comment',{body:'Thank you!',parent_id:comments[0].id},'other');await request('comments/'+comments[0].id+'/like',{},'other');
await request('collections',{name:'Maths revision'});const col=(await request('collections')).collections[0];await request('collections/'+col.id+'/paper',{paper_id:p.id});assert.equal((await request('papers?collection='+col.id)).papers.length,1);
await request('collections/'+col.id+'/paper',{paper_id:p.id},'other',404);
await request('admin',undefined,'student',403);await request('admin',undefined,'admin');await request('papers/'+p.id+'/save',{},null,401);
await request('reports',{paper_id:p.id,reason:'Incorrect information'});await request('admin/paper',{id:p.id,action:'hide',reason:'Test moderation'},'admin');await request('papers/'+p.id,undefined,'student',404);await request('papers/'+p.id,undefined,'admin');await request('admin/paper',{id:p.id,action:'restore',reason:'Restore sample'},'admin');
await request('follow/sample-editor',{});await request('profile',{username:'test_student',display_name:'Test Student',board:'CBSE',grade:'10'});await request('profile/test-student');
const bad=await mf.dispatchFetch('https://test.local/api/papers/'+p.id+'/save',{method:'POST',headers:{'oai-authenticated-user-id':'test-student','oai-authenticated-user-email':'student@test.local','Content-Type':'application/json','Origin':'https://attacker.invalid'},body:'{}'});assert.equal(bad.status,403);checked++;
for(const [name,bytes,mime,expected] of [['bad.png','not an image','image/png',400],['paper.pdf',await readFile('public/samples/sample-1.pdf'),'application/pdf',201]]){const form=new FormData();form.append('files',new File([bytes],name,{type:mime}));for(const[k,v]of Object.entries({title:'Integration test paper',board:'CBSE',grade:'10',subject:'Mathematics',exam:'Practice Paper',year:'2026',consent:'true'}))form.append(k,v);const serialized=new Request('https://test.local/api/upload',{method:'POST',body:form});const r=await mf.dispatchFetch(serialized.url,{method:'POST',headers:{'oai-authenticated-user-id':'test-student','oai-authenticated-user-email':'student@test.local','Content-Type':serialized.headers.get('Content-Type')},body:await serialized.arrayBuffer()});const result=await r.json();assert.equal(r.status,expected,JSON.stringify(result));checked++;if(r.status===201){assert.equal(result.status,'pending');await request('papers/'+result.id,undefined,'other',404);const own=await request('papers/'+result.id);assert.equal(own.files.length,1);const fr=await mf.dispatchFetch('https://test.local/api/files/'+own.files[0].id,{headers:{'oai-authenticated-user-id':'test-other','oai-authenticated-user-email':'other@test.local'}});assert.equal(fr.status,404);checked++;}}
// Premium controls cannot paywall community samples or be self-granted.
await request('premium/paper/sample-1',{id:'sample-1',enabled:true,reason:'Attempt to paywall sample'},'admin',403);
await request('premium/user/test-student',{id:'test-student',plan:'premium',days:30,reason:'Self-promotion attempt'},'student',403);
await request('premium/user/sample-ananya',{id:'sample-ananya',plan:'premium',days:30,reason:'Sample is not a real account'},'admin',400);
await request('profile',{username:'test_student',display_name:'Test Student',board:'CBSE',grade:'10',plan:'premium',role:'admin'});
assert.equal((await request('bootstrap')).user.plan,'free');
assert.equal((await request('bootstrap')).user.role,'student');
// Create a separate owner document; files and discussions must stay private.
await db.prepare("INSERT INTO papers(id,slug,title,uploader_id,board,grade,subject,exam,year,status,premium_only,created_at,updated_at) VALUES('owner-premium','owner-premium','Owner Mathematics Revision','test-admin','CBSE','10','Mathematics','Practice Paper',2026,'approved',0,?,?)").bind(new Date().toISOString(),new Date().toISOString()).run();
await db.prepare("INSERT INTO files(id,paper_id,key,mime,size,hash,position) VALUES('owner-file','owner-premium','owner-premium.pdf','application/pdf',5,'owner-hash',0)").run();
const storage=await mf.getR2Bucket('BUCKET');await storage.put('owner-premium.pdf','%PDF-');
await request('papers/owner-premium/comment',{body:'A private member discussion.'},'admin');
await request('premium/paper/owner-premium',{id:'owner-premium',enabled:true,reason:'Owner-curated revision paper'},'admin');
await request('premium/paper/owner-premium',{id:'owner-premium',enabled:'false',reason:'Invalid access input'},'admin',400);
const locked=await request('papers/owner-premium',undefined,null);assert.equal(locked.locked,true);assert.equal(locked.files.length,0);assert.equal(locked.comments.length,0);
const browse=await request('papers?access=premium',undefined,null);assert.equal(browse.papers[0].can_access,false);
await request('papers/owner-premium/save',{},'student');
await request('papers/owner-premium/rate',{score:5},'student',403);
await request('papers/owner-premium/comment',{body:'Blocked comment'},'student',403);
await request('papers/owner-premium/download',{},'student',403);
assert.ok(!(await request('community',undefined,null)).discussions.some(c=>c.paper_id==='owner-premium'));
const blockedFile=await mf.dispatchFetch('https://test.local/api/files/owner-file?download=1');assert.equal(blockedFile.status,403);checked++;
const lockedHtml=await (await mf.dispatchFetch('https://test.local/papers/owner-premium')).text();assert.match(lockedHtml,/reserved for Premium/);assert.ok(!lockedHtml.includes('owner-file'));assert.ok(!lockedHtml.includes('private member discussion'));checked++;
await request('premium/user/test-student',{id:'test-student',plan:'premium',days:30,reason:'30-day owner-authorized test'},'admin');
const unlocked=await request('papers/owner-premium');assert.equal(unlocked.locked,false);assert.equal(unlocked.files.length,1);assert.equal(unlocked.comments.length,1);
const allowedFile=await mf.dispatchFetch('https://test.local/api/files/owner-file',{headers:{'oai-authenticated-user-id':'test-student','oai-authenticated-user-email':'student@test.local'}});assert.equal(allowedFile.status,200);assert.match(allowedFile.headers.get('Cache-Control'),/no-store/);checked++;
await db.prepare("UPDATE users SET premium_until='2020-01-01T00:00:00Z' WHERE id='test-student'").run();assert.equal((await request('papers/owner-premium')).locked,true);
await request('premium/user/test-student',{id:'test-student',plan:'premium',days:30,reason:'Renew test'},'admin');
await request('admin/user',{id:'test-student',action:'suspend',reason:'Test suspended entitlement'},'admin');assert.equal((await request('papers/owner-premium')).locked,true);
await request('admin/user',{id:'test-student',action:'restore',reason:'Restore test user'},'admin');
await request('premium/user/test-student',{id:'test-student',plan:'free',reason:'Revoke test'},'admin');assert.equal((await request('papers/owner-premium')).locked,true);
await request('premium/user/test-student',{id:'test-student',plan:'premium',days:999,reason:'Invalid duration'},'admin',400);
await request('premium/user/test-student',{id:'test-student',plan:'premium',days:1},'admin',400);
await request('premium/interest',{});await request('premium/interest',{});assert.equal((await request('admin',undefined,'admin')).premium.interest_count,1);
const plan=await request('premium',undefined,null);assert.equal(plan.price_inr,299);assert.equal(plan.interval,'month');assert.equal(plan.checkout_enabled,true);
const avkRes=await request('avk',{textSubmission:'Given: u=20, a=-2. Formula: v=u+at'},'student');assert.equal(avkRes.ok,true);assert.ok(avkRes.result.total>0);
const orderRes=await request('billing/razorpay/order',{},'student');assert.equal(orderRes.amount,29900);
const analyticsBody={kind:'page_view',path:'/explore',client_id:'12345678-1234-1234-1234-123456789012'};
async function telemetry(body,origin='https://test.local'){const res=await mf.dispatchFetch('https://test.local/api/analytics',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});return {status:res.status,data:await res.json()}}
assert.equal((await telemetry(analyticsBody)).data.recorded,true);assert.equal((await telemetry(analyticsBody)).data.recorded,false);
assert.equal((await telemetry({...analyticsBody,path:'/profile/private-user'})).status,400);
assert.equal((await telemetry(analyticsBody,'https://attacker.invalid')).status,403);
assert.equal((await telemetry({...analyticsBody,kind:'download',path:'/papers/owner-premium'})).status,403);
const stats=await request('admin?days=7',undefined,'admin');assert.equal(stats.traffic.summary.page_views,1);assert.equal(stats.traffic.pages[0].path,'/explore');assert.ok(stats.audit.some(a=>a.action==='premium_revoke'));checked+=9;
await request('premium/paper/owner-premium',{id:'owner-premium',enabled:false,reason:'Return test to free'},'admin');
for(const route of ['/','/explore','/subjects','/saved','/upload','/community','/profile','/premium','/papers/'+p.slug,'/admin']){
  const who=route==='/admin'?'admin':'student';
  const html=await mf.dispatchFetch('https://test.local'+route,{headers:{'oai-authenticated-user-id':'test-'+who,'oai-authenticated-user-email':who+'@test.local'}});
  assert.equal(html.status,200,route);const content=await html.text();
  assert.match(content,/PaperCommons/,route);assert.match(content,/id="main-content"/,route);
  if(route.startsWith('/papers/'))assert.match(content,/id="discussion"/);
  checked++;
}
console.log(`PASS: ${checked} integration checks including auth, search, persistence, uploads, permissions and moderation.`);
}finally{await mf.dispose()}
