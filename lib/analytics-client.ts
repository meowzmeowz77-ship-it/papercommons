'use client';
let fallbackId:string|undefined;
export function track(kind:string,path=location.pathname){
 if(navigator.doNotTrack==='1'||(navigator as any).globalPrivacyControl)return;
 let clientId:string;try{clientId=sessionStorage.getItem('papercommons-session')||crypto.randomUUID();sessionStorage.setItem('papercommons-session',clientId)}catch{clientId=fallbackId??=crypto.randomUUID()}
 void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,path,client_id:clientId}),keepalive:true}).catch(()=>{});
}
