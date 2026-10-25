'use client';
import { useState } from 'react';
import type { Work } from '../domain/types';
export type EditionCard = Work & { label:string; reason:string; preview:string; source:string; href?:string; blurb:string; sampleStatus:'available'|'unavailable' };
export default function EditionClient({items}:{items:EditionCard[]}) {
 const [feedback,setFeedback]=useState<Record<string,string>>({});
 const [saved,setSaved]=useState<Set<string>>(new Set());
 const act=(id:string,value:string)=>setFeedback((old)=>({...old,[id]:value}));
 return <>
  <section className="grid">{items.map((item)=><article className={`card ${feedback[item.id]==='not_for_me'?'dismissed':''}`} key={item.id}><div className={`art ${item.medium}`}><span>{item.medium}</span><b>{item.releaseYear}</b></div><div className="card-body"><div className="card-meta"><span>{item.label}</span><span>·</span><span>{item.medium}</span></div><h3>{item.title}</h3><p className="creator">{item.creators.join(' · ')}</p><p className="reason">{item.reason}</p><p className="blurb">{item.blurb}</p>{item.href ? <a className="preview" href={item.href} target="_blank" rel="noreferrer" onClick={()=>act(item.id,'sample_opened')}>{item.preview}<small>{item.source} ↗</small></a> : <div className="preview unavailable">{item.preview}<small>{item.source} · no verified preview currently available</small></div>}<div className="actions"><button onClick={()=>act(item.id,'more_like_this')}>{feedback[item.id]==='more_like_this'?'Noted ✓':'More like this'}</button><button onClick={()=>act(item.id,'not_for_me')}>{feedback[item.id]==='not_for_me'?'Hidden ✓':'Not for me'}</button><button onClick={()=>setSaved((old)=>{const next=new Set(old);next.has(item.id)?next.delete(item.id):next.add(item.id);return next})} aria-label={`Save ${item.title}`}>{saved.has(item.id)?'♥':'♡'}</button></div></div></article>)}</section>
  <p className="feedback-note">{Object.keys(feedback).length ? 'Your actions are explicit signals. Opening a sample is not counted as liking it.' : 'Choose a card action to start teaching the sampler.'}</p>
 </>;
}
