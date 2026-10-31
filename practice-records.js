export const RECORD_KEY='cube-time.cross-records.v1';
export function readRecords(storage=localStorage){
 const raw=storage.getItem(RECORD_KEY);
 if(raw===null)return [];
 const records=JSON.parse(raw);
 if(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||!Number.isSafeInteger(r.at)||r.at<0||r.at>8640000000000000||![3,4,5,6].includes(r.difficulty)))throw Error('白十字の記録を読み込めません。保存データを確認してください。');
 return records;
}
export function recordCompletion(id,difficulty,storage=localStorage,at=Date.now()){
 if(typeof id!=='string'||!id||![3,4,5,6].includes(difficulty))throw Error('問題の難易度を確認できません。');
 const records=readRecords(storage);
 if(records.some(r=>r.id===id))return records;
 const updated=[...records,{id,at,difficulty}];
 storage.setItem(RECORD_KEY,JSON.stringify(updated));
 return updated;
}
export function counts(records){
 const totals={3:0,4:0,5:0,6:0};
 for(const r of records)totals[r.difficulty]++;
 return totals;
}
