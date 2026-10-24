import {withdrawTermScans} from './term-withdrawal';
import {applyBrandProfile} from './brand-profile';
import {db,one,now,run,rows} from './db';
import {SUBJECTS,EXAMS} from '../types';
async function seedBase(){if(await one("SELECT key FROM settings WHERE key='seed_v1'")){await applyBrandProfile();return;}const d=db(),stamp=now();const statements=[];const names=[['sample-editor','papercommons_team','PaperCommons Team'],['sample-ananya','ananya.learns','Ananya Sharma'],['sample-arjun','arjunmaths','Arjun Mehta'],['sample-riya','riya.notes','Riya Patel']];for(const [id,username,name]of names)statements.push(d.prepare('INSERT OR IGNORE INTO users(id,username,display_name,created_at,updated_at,onboarded) VALUES(?,?,?,?,?,1)').bind(id,username,name,'2026-08-01T10:00:00Z',stamp));
for(const [kind,values]of Object.entries({subject:SUBJECTS,board:['CBSE','ICSE','State Board','Other'],grade:['6','7','8','9','10','11','12'],exam:EXAMS}))values.forEach((name,i)=>statements.push(d.prepare('INSERT OR IGNORE INTO taxonomy(id,kind,name,position) VALUES(?,?,?,?)').bind(kind+'-'+i,kind,name,i)));
const titles=['Mathematics Pre-Board 2026','Electricity • Chapter Test','Social Science Periodic Test','English Language & Literature','Hindi Course B • Sample Paper','Information Technology • Practice Paper','Mathematics Standard • Sample Paper','Science Mid-Term Examination','India and the Contemporary World','English Grammar • Unit Test','Hindi Course B • Pre-Board','Computer Science • Mock Test'];
for(let i=0;i<titles.length;i++){const subject=SUBJECTS[i%6],exam=i===1?'Chapter Test':i===2?'Periodic Test':i===7?'Mid-Term':i===9?'Unit Test':i===0||i===10?'Pre-Board':'Sample Paper';const pid='sample-'+(i+1);statements.push(d.prepare('INSERT OR IGNORE INTO papers(id,slug,title,description,uploader_id,board,grade,subject,exam,school,year,marks,duration,difficulty,chapters,answer_key,status,featured,sample,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(pid,'cbse-class-10-'+titles[i].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''),titles[i],'An original 25-mark demonstration paper for practising core concepts. This is a short practice set, not a full-length examination. This sample is not an official school or CBSE examination paper.',names[i%4][0],'CBSE','10',subject,exam,'PaperCommons Practice',2026,25,60,i%3===0?'Hard':i%3===1?'Medium':'Easy',i===1?'Electricity':i%6===0?'Real Numbers, Polynomials, Pair of Linear Equations':'Core Class 10 syllabus',0,'approved',i<3?1:0,1,new Date(Date.now()-i*86400000).toISOString(),stamp));}
statements.push(d.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('moderation','manual')"));statements.push(d.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('seed_v1','1')"));await d.batch(statements);await applyBrandProfile()}

async function ensurePremiumSchema(){
  if(await one("SELECT key FROM settings WHERE key='premium_schema_v2'"))return;
  const columns=await rows('PRAGMA table_info(papers)');
  if(!columns.some((column:any)=>column.name==='premium_only'))await run('ALTER TABLE papers ADD COLUMN premium_only INTEGER DEFAULT 0');
  await run("INSERT OR IGNORE INTO settings(key,value) VALUES('premium_price_inr','299')");
  await run("INSERT OR IGNORE INTO settings(key,value) VALUES('stripe_status','not_connected')");
  await run("INSERT OR IGNORE INTO settings(key,value) VALUES('premium_schema_v2','1')");
}
export async function seed(){await ensurePremiumSchema();await seedBase();await withdrawTermScans()}
