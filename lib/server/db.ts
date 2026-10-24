import { env } from 'cloudflare:workers';
export function db():D1Database{const d=(env as unknown as {DB:D1Database}).DB;if(!d)throw new Error('Database unavailable');return d}
export function bucket():R2Bucket{return (env as unknown as {BUCKET:R2Bucket}).BUCKET}
export async function rows(sql:string,...args:unknown[]){return (await db().prepare(sql).bind(...args).all()).results as any[]}
export async function one(sql:string,...args:unknown[]){return await db().prepare(sql).bind(...args).first() as any}
export async function run(sql:string,...args:unknown[]){return db().prepare(sql).bind(...args).run()}
export const now=()=>new Date().toISOString();
export const id=()=>crypto.randomUUID();
