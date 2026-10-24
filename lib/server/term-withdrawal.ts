import {db,now,one} from './db';

const batchKey='owner_term1_scans_withdrawn_2026_v1';
const paperIds=['term1-2026-english','term1-2026-hindi','term1-2026-mathematics','term1-2026-science','term1-2026-social-science'];
let pending:Promise<void>|undefined;

// One-time, owner-requested withdrawal of the original five partial scans.
// Fixed identifiers only; no public maintenance endpoint or arbitrary input.
// Preserve records and files for moderation history and possible restoration.
export async function withdrawTermScans(){
  if(await one('SELECT key FROM settings WHERE key=?',batchKey))return;
  if(pending)return pending;
  pending=withdrawBatch();
  try{await pending}finally{pending=undefined}
}

async function withdrawBatch(){
  const d=db(),stamp=now(),statements=[];
  for(const paperId of paperIds){
    statements.push(d.prepare("UPDATE papers SET status='deleted',featured=0,updated_at=? WHERE id=?").bind(stamp,paperId));
    statements.push(d.prepare('INSERT OR IGNORE INTO moderation(id,admin_id,target_id,action,reason,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM papers WHERE id=?)').bind(paperId+'-owner-withdrawal','site-owner-maintenance',paperId,'delete','Owner requested removal of the partial scans while preparing clearer photographs for replacement text PDFs.',stamp,paperId));
  }
  statements.push(d.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)').bind(batchKey,'completed'));
  await d.batch(statements);
}
