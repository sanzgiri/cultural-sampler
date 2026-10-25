import { scoreCandidate } from './taste';
import type { Profile, QualityEvidence, ScoredCandidate, Work } from './types';
export type SelectionInput={works:Work[];evidence:QualityEvidence[];profile:Profile;knownWorkIds:Set<string>;priorWorkIds:Set<string>;deferredWorkIds:Set<string>;now:Date};
export type SelectionItem={work:Work;score:number;slot:'familiar'|'adjacent'|'exploration';reason:string};
export type SelectionResult={items:SelectionItem[];underfilled:boolean;diagnostics:string[]};
export function selectEdition(input:SelectionInput):SelectionResult {
 const evidenceBy=new Map<string,QualityEvidence[]>(); for(const e of input.evidence) evidenceBy.set(e.workId,[...(evidenceBy.get(e.workId)??[]),e]);
 const candidates=input.works.filter(w=>w.medium==='book'&&!input.knownWorkIds.has(w.id)&&!input.priorWorkIds.has(w.id)&&!input.deferredWorkIds.has(w.id)&&w.primaryGenre&&evidenceBy.get(w.id)?.some(e=>e.score>=0.7)).map(w=>scoreCandidate(w,evidenceBy.get(w.id)??[],input.profile)).sort((a,b)=>b.baseScore-a.baseScore||a.work.id.localeCompare(b.work.id));
 const picked:SelectionItem[]=[]; const creators=new Set<string>(); const genres=new Set<string>();
 for(const candidate of candidates){if(picked.length>=5)break;if(creators.has(candidate.work.primaryCreatorKey))continue;if(genres.has(candidate.work.primaryGenre!)&&[...genres].filter(g=>g===candidate.work.primaryGenre).length>=2)continue; const slot=picked.length===0?'familiar':picked.length===1?'adjacent':'exploration';picked.push({work:candidate.work,score:candidate.baseScore,slot,reason:slot==='familiar'?'Editorial starting point':slot==='adjacent'?'An adjacent discovery':'A wider exploration'});creators.add(candidate.work.primaryCreatorKey);genres.add(candidate.work.primaryGenre!);}
 return {items:picked,underfilled:picked.length<5,diagnostics:picked.length<5?[`Only ${picked.length} eligible works available`]:[]};
}
