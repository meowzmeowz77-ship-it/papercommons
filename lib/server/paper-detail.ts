import {getPaper} from './papers';
import {one,rows} from './db';

/** Public metadata is safe to preview; document and discussion data require access. */
export async function paperDetail(key:string,user:any){
 const paper=await getPaper(key,user,{preview:true});
 if(!paper.can_access)return {paper,locked:true,files:[],comments:[],myRating:0,feedback:[],usefulness:{}};
 return {paper,locked:false,files:await rows('SELECT id,mime,size,position FROM files WHERE paper_id=? ORDER BY position',paper.id),comments:await rows("SELECT c.*,u.username,u.display_name,(SELECT COUNT(*) FROM comment_likes WHERE comment_id=c.id) likes,(SELECT COUNT(*) FROM comment_likes WHERE comment_id=c.id AND user_id=?) liked FROM comments c JOIN users u ON u.id=c.user_id WHERE c.paper_id=? AND c.status='active' ORDER BY c.created_at",user?.id||'',paper.id),myRating:user?(await one('SELECT score FROM ratings WHERE user_id=? AND paper_id=?',user.id,paper.id))?.score:0,feedback:await rows('SELECT difficulty,COUNT(*) count FROM feedback WHERE paper_id=? AND difficulty IS NOT NULL GROUP BY difficulty',paper.id),usefulness:await one('SELECT SUM(useful) useful,SUM(accurate) accurate,COUNT(useful) useful_count,COUNT(accurate) accurate_count FROM feedback WHERE paper_id=?',paper.id)};
}
