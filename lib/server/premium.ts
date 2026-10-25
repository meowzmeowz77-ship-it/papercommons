import {AppError,isPremium,str} from './auth';
import {db,id,now,one,rows,run} from './db';

export const PREMIUM_PLAN={id:'papercommons-premium-monthly',price_inr:299,currency:'INR',interval:'month',checkout_enabled:true,avk_connected:true} as const;
export function paperAccess(p:any,user:any){return !p.premium_only||isPremium(user)||(user?.status==='active'&&p.uploader_id===user?.id)}
export function withPaperAccess(p:any,user:any){return {...p,can_access:paperAccess(p,user)}}
export function assertPaperAccess(p:any,user:any){if(!paperAccess(p,user))throw new AppError(403,'Premium access is required to open or download this paper. You can view its details on the paper page.')}
export async function premiumInfo(user:any){return {...PREMIUM_PLAN,active:isPremium(user),admin_preview:user?.role==='admin',premium_until:user?.premium_until||null,interested:!!(user&&await one('SELECT 1 FROM premium_interest WHERE user_id=?',user.id)),papers_count:(await one("SELECT COUNT(*) count FROM papers WHERE status='approved' AND premium_only=1")).count}}
export async function premiumCommand(kind:string,pathId:string|undefined,b:any,user:any){
  if(user.role!=='admin')throw new AppError(403,'Administrator access is required.');
  const reason=str(b.reason,1000);if(!reason)throw new AppError(400,'Add a reason for the access change.');
  if(pathId&&pathId!==b.id)throw new AppError(400,'The selected item does not match this request.');
  const stamp=now();let statement:D1PreparedStatement;let result:any;let action:string;
  if(kind==='paper'){
    if(typeof b.enabled!=='boolean')throw new AppError(400,'Choose free or Premium access.');
    const p=await one('SELECT * FROM papers WHERE id=?',b.id);if(!p)throw new AppError(404,'Paper not found.');
    if(b.enabled&&(p.uploader_id!==user.id||p.sample))throw new AppError(403,'Only your own original uploads can be made Premium-only. Community contributions and sample papers stay free.');
    if(b.enabled&&p.status==='deleted')throw new AppError(400,'Restore this paper before changing its access.');
    statement=db().prepare('UPDATE papers SET premium_only=?,updated_at=? WHERE id=?').bind(b.enabled?1:0,stamp,p.id);
    action=b.enabled?'premium_enable':'premium_disable';result={premium_only:b.enabled?1:0};
  }else if(kind==='user'){
    const target=await one('SELECT * FROM users WHERE id=?',b.id);if(!target)throw new AppError(404,'User not found.');
    if(target.id.startsWith('sample-'))throw new AppError(400,'Sample contributor profiles cannot receive memberships.');
    if(!['premium','free'].includes(b.plan))throw new AppError(400,'Choose a valid plan.');
    if(target.role==='admin')throw new AppError(400,'Administrators already have review access. Grant test access to a student account.');
    if(b.plan==='premium'&&target.status!=='active')throw new AppError(400,'Restore this account before granting access.');
    const days=Number(b.days??30);if(b.plan==='premium'&&(!Number.isInteger(days)||days<1||days>90))throw new AppError(400,'Test access must last between 1 and 90 days.');
    const until=b.plan==='premium'?new Date(Date.now()+days*86400000).toISOString():null;
    statement=db().prepare('UPDATE users SET plan=?,premium_until=?,updated_at=? WHERE id=?').bind(b.plan,until,stamp,target.id);
    action=b.plan==='premium'?'premium_test_grant':'premium_revoke';result={plan:b.plan,premium_until:until};
  }else throw new AppError(404,'Premium action not found.');
  await db().batch([statement,db().prepare('INSERT INTO moderation(id,admin_id,target_id,action,reason,created_at) VALUES(?,?,?,?,?,?)').bind(id(),user.id,b.id,action,reason,stamp)]);
  return {ok:true,...result};
}
export async function joinPremiumInterest(user:any){await run('INSERT OR IGNORE INTO premium_interest(user_id,created_at) VALUES(?,?)',user.id,now());return {ok:true,interested:true}}
export async function premiumAdminSummary(){return {plan:PREMIUM_PLAN,interest_count:(await one('SELECT COUNT(*) count FROM premium_interest')).count,active_test_access:(await one("SELECT COUNT(*) count FROM users WHERE plan='premium' AND status='active' AND role<>'admin' AND premium_until>?",now())).count,interest:await rows('SELECT u.id,u.username,u.display_name,i.created_at FROM premium_interest i JOIN users u ON u.id=i.user_id ORDER BY i.created_at DESC LIMIT 100')}}
