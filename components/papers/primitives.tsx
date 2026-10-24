'use client';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Skeleton} from '@/components/ui/skeleton';
import {Empty,EmptyHeader,EmptyTitle,EmptyDescription} from '@/components/ui/empty';
import {BookOpen,Calculator,FlaskConical,Globe,Languages,Monitor,BookText} from 'lucide-react';
export const icons:any={Mathematics:Calculator,Science:FlaskConical,'Social Science':Globe,English:BookOpen,Hindi:Languages,'Computer Science':Monitor};
export const colors:any={Mathematics:'blue',Science:'teal','Social Science':'orange',English:'orange',Hindi:'pink','Computer Science':'slate'};
export function SubjectIcon({subject,size=22}:{subject:string;size?:number}){const Icon=icons[subject]||BookText;return <span className={'subject-icon '+(colors[subject]||'blue')}><Icon size={size}/></span>}
export function Picker({value,onChange,options,placeholder='Choose',label}:{value:string;onChange:(v:string)=>void;options:string[];placeholder?:string;label?:string}){return <Select value={value||'_all'} onValueChange={v=>onChange(v==='_all'?'':v)}><SelectTrigger className="picker" aria-label={label||placeholder}><SelectValue placeholder={placeholder}/></SelectTrigger><SelectContent><SelectItem value="_all">{placeholder}</SelectItem>{options.filter(Boolean).map(x=><SelectItem value={x} key={x}>{x}</SelectItem>)}</SelectContent></Select>}
export function Loading(){return <div className="paper-grid">{[1,2,3,4,5,6].map(x=><div className="paper-card" key={x}><Skeleton className="h-10 w-10 mb-5"/><Skeleton className="h-6 w-4/5 mb-3"/><Skeleton className="h-4 w-full mb-8"/><Skeleton className="h-10 w-full"/></div>)}</div>}
export function Blank({title='No papers found',description='Try changing your filters or upload the first paper for this subject.'}:{title?:string;description?:string}){return <Empty className="empty"><EmptyHeader><BookOpen size={30}/><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader><a className="btn primary" href="/upload">Upload Paper</a></Empty>}
export function Avatar({name,large=false,src}:{name:string;large?:boolean;src?:string}){return <span className={'avatar '+(large?'large':'')}>{src?<img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>:name?.slice(0,2).toUpperCase()||'ST'}</span>}
