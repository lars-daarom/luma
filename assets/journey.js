/* Luma 5.3.0 - campaign progression model. No DOM patching. */
(function(root,factory){
  const api=factory();
  root.LumaJourney=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const TOTAL=72,PER_WORLD=12;
function completedIds(completed={}){return Object.keys(completed).map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<TOTAL&&completed[i]).sort((a,b)=>a-b);}
function highestCompleted(completed={}){const ids=completedIds(completed);return ids.length?ids[ids.length-1]:-1;}
function contiguousFrontier(completed={}){for(let i=0;i<TOTAL;i++)if(!completed[i])return i;return TOTAL;}
/*
 * Legacy-safe frontier: old Luma versions allowed free level selection. If a player
 * already reached a later campaign level, do not send them back to level 1. The
 * highest completed/resumed campaign level becomes the starting point for the new
 * sequential journey. From there onward progression is strictly one level at a time.
 */
function frontier(completed={},resume=null){
  const contiguous=contiguousFrontier(completed);
  const high=highestCompleted(completed)+1;
  const resumed=resume?.mode==='campaign'&&Number.isInteger(resume.id)?Math.max(0,Math.min(TOTAL-1,resume.id)):0;
  return Math.min(TOTAL,Math.max(contiguous,high,resumed));
}
function levelUnlocked(id,completed={},resume=null){
  if(!Number.isInteger(id)||id<0||id>=TOTAL)return false;
  if(completed[id])return true;
  return id<=frontier(completed,resume);
}
function worldUnlocked(w,completed={},resume=null){
  if(!Number.isInteger(w)||w<0||w>=6)return false;
  if(w===0)return true;
  const start=w*PER_WORLD;
  if(frontier(completed,resume)>=start)return true;
  for(let i=start;i<start+PER_WORLD;i++)if(completed[i])return true;
  return false;
}
function progress(completed={},w){let n=0;for(let i=w*PER_WORLD;i<w*PER_WORLD+PER_WORLD;i++)if(completed[i])n++;return n;}
function starCount(completed={}){return Object.values(completed).reduce((n,r)=>n+(Number(r?.stars)||0),0);}
function currentWorld(completed={},resume=null){const f=frontier(completed,resume);return Math.max(0,Math.min(5,Math.floor(Math.min(f,TOTAL-1)/PER_WORLD)));}
function levelState(id,completed={},resume=null){if(completed[id])return 'complete';return levelUnlocked(id,completed,resume)?(id===frontier(completed,resume)?'current':'open'):'locked';}
return {TOTAL,PER_WORLD,completedIds,highestCompleted,contiguousFrontier,frontier,levelUnlocked,worldUnlocked,progress,starCount,currentWorld,levelState};
});
