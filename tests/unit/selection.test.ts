import { describe, expect, it } from 'vitest';
import { selectEdition } from '../../src/domain/selection';
import type { QualityEvidence, Work } from '../../src/domain/types';
const w=(id:string,genre:string,creator='a'):Work=>({id,medium:'book',title:id,creators:[creator],primaryCreatorKey:creator,franchiseKey:null,primaryGenre:genre,traits:[`genre:${genre}`],language:'en',originRegions:['US'],releaseYear:2020,musicSubtype:null,verifiedIdentifiers:{}});
const q=(id:string):QualityEvidence=>({workId:id,sourceUrl:'https://example.com',sourceType:'editorial',statement:'Selected',verified:true,observedAt:'2026-01-01',score:0.8});
describe('finite edition selection',()=>{it('keeps selection deterministic and avoids repeated creators',()=>{const result=selectEdition({works:[w('1','fiction','a'),w('2','history','a'),w('3','science','b'),w('4','music','c'),w('5','poetry','d')],evidence:[q('1'),q('2'),q('3'),q('4'),q('5')],profile:{book:{},music:{},film:{}},knownWorkIds:new Set(),priorWorkIds:new Set(),deferredWorkIds:new Set(),now:new Date('2026-01-01')});expect(result.items.map(x=>x.work.id)).toEqual(['1','3','4','5']);expect(result.items[0].reason).toContain('Editorial');});});
