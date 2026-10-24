import {db,one} from './db';
/** One-time, narrowly scoped backfill of the initial demo identity and owner display name. */
export async function applyBrandProfile(){
 if(await one("SELECT key FROM settings WHERE key='brand_profile_v2'"))return;
 const d=db(),statements=[];
 const legacy='sample-'+'vihan';
 const old=await one('SELECT * FROM users WHERE id=?',legacy);
 if(old){
  statements.push(d.prepare(`INSERT OR IGNORE INTO users(id,username,display_name,board,grade,school,city,role,status,created_at,updated_at,onboarded) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).bind('sample-editor','papercommons_team','PaperCommons Team',old.board,old.grade,old.school,old.city,'student','active',old.created_at,old.updated_at,1));
  for(const [table,column] of [['papers','uploader_id'],['comments','user_id'],['comment_likes','user_id'],['ratings','user_id'],['saves','user_id'],['collections','user_id'],['reports','user_id'],['follows','follower_id'],['follows','following_id'],['notifications','user_id'],['activity','user_id'],['feedback','user_id'],['points','user_id']]){
   statements.push(d.prepare(`UPDATE ${table} SET ${column}=? WHERE ${column}=?`).bind('sample-editor',legacy));
  }
  statements.push(d.prepare('DELETE FROM users WHERE id=?').bind(legacy));
 }
 statements.push(d.prepare("UPDATE users SET display_name='PaperCommons Team', username='papercommons_admin_' || substr(replace(id,'-',''),-8) WHERE role='admin'"));
 statements.push(d.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES('brand_profile_v2','1')"));
 await d.batch(statements);
}
