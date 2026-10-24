import {getChatGPTUser} from '@/app/chatgpt-auth';
import {one,run,now} from './db';
import {env} from 'cloudflare:workers';
export class AppError extends Error{constructor(public status:number,message:string){super(message)}}
export async function identity(){
  const u=await getChatGPTUser();
  if(!u)return null;
  const ADMIN_EMAIL='vihan.agrawal4@gmail.com';
  const envAdmins=(((env as any).ADMIN_EMAILS||'')).split(',').map((x:string)=>x.trim().toLowerCase()).filter(Boolean);
  const admin=u.email.toLowerCase()===ADMIN_EMAIL.toLowerCase()||envAdmins.includes(u.email.toLowerCase());
  let p=await one('SELECT * FROM users WHERE id=?',u.userId);
  if(!p){
    const stamp=now();
    const isVihan=u.email.toLowerCase()===ADMIN_EMAIL.toLowerCase();
    const displayName=isVihan?'Vihan Agrawal':(admin?'PaperCommons Team':(u.fullName||u.displayName||'Student'));
    const username=isVihan?'vihan_agrawal':('student_'+u.userId.replace(/[^a-zA-Z0-9]/g,'').slice(-12));
    await run('INSERT OR IGNORE INTO users (id,username,display_name,role,created_at,updated_at) VALUES (?,?,?,?,?,?)',u.userId,username,displayName,admin?'admin':'student',stamp,stamp);
    p=await one('SELECT * FROM users WHERE id=?',u.userId);
  }else if(admin&&p.role!=='admin'){
    await run("UPDATE users SET role='admin',updated_at=? WHERE id=?",now(),p.id);
    p=await one('SELECT * FROM users WHERE id=?',u.userId);
  }else if(!admin&&p.role==='admin'){
    await run("UPDATE users SET role='student',updated_at=? WHERE id=?",now(),p.id);
    p=await one('SELECT * FROM users WHERE id=?',u.userId);
  }
  return p ? {...p, email: u.email} : null;
}
export async function requireUser(){const u=await identity();if(!u)throw new AppError(401,'Please sign in to continue.');if(u.status!=='active')throw new AppError(403,'Your account is restricted. Please contact the administrator.');return u}
export async function requireAdmin(){const u=await requireUser();if(u.role!=='admin')throw new AppError(403,'Administrator access is required.');return u}
export function isPremium(user:any){return user?.status==='active'&&(user.role==='admin'||(user.plan==='premium'&&!!user.premium_until&&Date.parse(user.premium_until)>Date.now()))}
export async function protect(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new AppError(403,'Please refresh the page and try again.');if(req.headers.get('sec-fetch-site')==='cross-site')throw new AppError(403,'Request blocked.');const u=await requireUser();const time=Math.floor(Date.now()/60000),key=u.id+':'+time;await run('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',key,time+2);const n=await one('SELECT count FROM rate_limits WHERE key=?',key);if(n.count>40)throw new AppError(429,'Too many requests. Please wait a minute.');return u}
export function str(v:unknown,max=200){return String(v??'').trim().slice(0,max)}
