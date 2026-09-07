/* Luma 5.2.0 - sequential journey layer and map-first interface. */
(function(root,factory){
  const api=factory(root);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
'use strict';
const TOTAL=72,PER_WORLD=12,KEY='luma.save.v1';
function safeCompleted(raw){
  const out={};
  if(!raw||typeof raw!=='object')return out;
  for(const [k,v] of Object.entries(raw)){
    const id=Number(k);
    if(Number.isInteger(id)&&id>=0&&id<TOTAL&&v&&Number.isInteger(v.stars)&&v.stars>=1&&v.stars<=3)out[id]=v;
  }
  return out;
}
function readState(storage){
  try{
    const raw=JSON.parse(storage?.getItem(KEY)||'null');
    return {completed:safeCompleted(raw?.completed),resume:raw?.resume||null,lastWorld:Number.isInteger(raw?.lastWorld)?Math.max(0,Math.min(5,raw.lastWorld)):0};
  }catch{return {completed:{},resume:null,lastWorld:0};}
}
function frontier(completed){for(let i=0;i<TOTAL;i++)if(!completed[i])return i;return TOTAL;}
function levelUnlocked(id,completed){
  if(!Number.isInteger(id)||id<0||id>=TOTAL)return false;
  if(completed[id])return true;
  return id===frontier(completed);
}
function worldUnlocked(w,completed){
  if(!Number.isInteger(w)||w<0||w>=6)return false;
  if(w===0)return true;
  const f=frontier(completed),start=w*PER_WORLD;
  if(f>=start&&f<start+PER_WORLD)return true;
  for(let i=start;i<start+PER_WORLD;i++)if(completed[i])return true;
  return Boolean(completed[start-1]);
}
function progress(completed,w){let n=0;for(let i=w*PER_WORLD;i<w*PER_WORLD+PER_WORLD;i++)if(completed[i])n++;return n;}
function starCount(completed){return Object.values(completed).reduce((n,r)=>n+(Number(r.stars)||0),0);}
function pathSegment(a,b,i){
  const cy=(a.y+b.y)/2,cx=(a.x+b.x)/2+(i%2?30:-30);
  return `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`;
}
const positions=[
  {x:200,y:1320},{x:137,y:1210},{x:232,y:1100},{x:286,y:990},
  {x:174,y:880},{x:116,y:770},{x:218,y:660},{x:292,y:550},
  {x:212,y:440},{x:124,y:330},{x:186,y:220},{x:270,y:110}
];
function mapSegments(completed,start){
  let s='';
  for(let j=0;j<positions.length-1;j++){
    const a=positions[j],b=positions[j+1],id=start+j;
    const open=Boolean(completed[id]);
    s+=`<path class="journey-route-segment ${open?'open':'locked'}" d="${pathSegment(a,b,j)}"/>`;
  }
  return s;
}
function cleanLockedDeepLink(win,completed){
  if(!win?.location||!win?.history)return false;
  const u=new URL(win.location.href),raw=u.searchParams.get('level');
  if(!raw||!/^\d+$/.test(raw))return false;
  const id=Number(raw)-1;
  if(levelUnlocked(id,completed))return false;
  u.searchParams.delete('level');
  win.history.replaceState({},'',u.pathname+(u.search||'')+(u.hash||''));
  return true;
}
const api={TOTAL,PER_WORLD,frontier,levelUnlocked,worldUnlocked,progress,starCount,mapSegments,readState,cleanLockedDeepLink};
if(!root.document||!root.localStorage)return api;
const doc=root.document;
let state=readState(root.localStorage),blockedDeepLink=cleanLockedDeepLink(root,state.completed),observer=null,queued=false;
function A(){return root.LumaStudioArt;}
function refresh(){state=readState(root.localStorage);return state;}
function buttonIcon(name){try{return A()?.icon?.(name)||'';}catch{return '';}}
function logo(){try{return A()?.logo?.()||'<strong class="journey-word-logo">luma</strong>';}catch{return '<strong class="journey-word-logo">luma</strong>';}}
function mark(){try{return A()?.mark?.()||'';}catch{return '';}}
function scenery(w,cls=''){try{return A()?.scenery?.(w,cls)||'';}catch{return '';}}
function worldData(w){return A()?.worlds?.[w]||{name:['Zonnetuin','Regendauw','Fluisterbos','Zandbloei','Nachtkas','Sterrenweide'][w]||'Luma',tag:'Vind de verbinding.',accent:'#CC5A43'};}
function showLockToast(text='Voltooi eerst het vorige level.'){
  let el=doc.getElementById('journey-lock-toast');
  if(!el){el=doc.createElement('div');el.id='journey-lock-toast';el.className='journey-lock-toast';el.setAttribute('role','status');doc.body.appendChild(el);}
  el.textContent=text;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),2600);
}
function currentPage(){
  if(doc.querySelector('.home-shell'))return 'home';
  if(doc.querySelector('.atlas-shell'))return 'worlds';
  if(doc.querySelector('.collection-shell'))return 'garden';
  if(doc.querySelector('.play-shell'))return 'play';
  return '';
}
function setPageClass(name){doc.body.dataset.journeyPage=name||'';}
function redesignHome(shell){
  if(shell.dataset.journey==='52')return;
  refresh();const f=frontier(state.completed),all=f===TOTAL;
  const resume=state.resume,resumeCampaign=resume?.mode==='campaign'&&Number.isInteger(resume.id),resumeAny=Boolean(resume),id=resumeCampaign?resume.id:(all?TOTAL-1:f),w=Math.max(0,Math.min(5,resumeAny&&Number.isInteger(resume.world)?resume.world:Math.floor(id/PER_WORLD))),t=worldData(w),done=Object.keys(state.completed).length;
  shell.dataset.journey='52';shell.classList.add('journey-opening-shell');
  shell.innerHTML=`<section class="journey-opening" style="--journey-accent:${t.accent||'#CC5A43'}">
    <div class="journey-opening-scene">${scenery(w,'journey-opening-art')}</div>
    <div class="journey-opening-vignette" aria-hidden="true"></div>
    <div class="journey-opening-top">
      <span class="journey-mini-progress"><strong>${done}</strong><small>/ 72</small></span>
      <button class="journey-square-button" data-action="settings" aria-label="Instellingen">${buttonIcon('settings')}</button>
    </div>
    <div class="journey-opening-center">
      <div class="journey-opening-logo">${logo()}</div>
      <p class="journey-opening-kicker">${t.name}</p>
      <h1>${all?'Reis voltooid.':'Vind de verbinding.'}</h1>
      <p>${all?'Alle werelden zijn open. Speel je favoriete route opnieuw.':`Level ${id+1} wacht op je. Elk volgend level opent pas als je dit pad hebt voltooid.`}</p>
    </div>
    <div class="journey-opening-bottom">
      <button class="journey-main-cta" data-action="${all&&!resumeAny?'worlds':'continue'}"><span>${resumeAny?(resume.mode==='daily'?'Verder met dagpuzzel':resume.mode==='zen'?'Verder met vrij spel':'Verder spelen'):all?'Bekijk de kaart':'Speel level '+(id+1)}</span>${buttonIcon('play')}</button>
      <button class="journey-map-link" data-action="worlds">${buttonIcon('worlds')}<span>Open de kaart</span></button>
    </div>
  </section>`;
}
function mapNode(id,j,completed,f){
  const result=completed[id],unlocked=levelUnlocked(id,completed),current=id===f,complete=Boolean(result),p=positions[j];
  const label=complete?`Level ${id+1}, voltooid met ${result.stars} sterren`:unlocked?`Level ${id+1}, beschikbaar`:`Level ${id+1}, vergrendeld`;
  return `<button class="journey-level-node ${complete?'complete':''} ${current?'current':''} ${unlocked?'unlocked':'locked'}" style="left:${p.x/4}%;top:${p.y/14.3}%" ${unlocked?`data-action="level" data-level="${id}"`:'disabled'} aria-label="${label}">
    ${current?`<span class="journey-current-marker">${mark()}</span>`:''}
    <span class="journey-node-disc">${complete?buttonIcon('check'):`<strong>${id+1}</strong>`}</span>
    ${complete?`<span class="journey-node-stars">${Array.from({length:3},(_,i)=>`<i class="${i<result.stars?'on':''}"></i>`).join('')}</span>`:''}
  </button>`;
}
function redesignWorlds(shell){
  if(shell.dataset.journey==='52')return;
  refresh();const original=doc.querySelector('.world-card.selected');let w=Number(original?.dataset.world);
  if(!Number.isInteger(w))w=state.lastWorld;
  const f=frontier(state.completed),frontierWorld=f<TOTAL?Math.floor(f/PER_WORLD):5;
  if(!worldUnlocked(w,state.completed))w=frontierWorld;
  const t=worldData(w),start=w*PER_WORLD,p=progress(state.completed,w),stars=starCount(state.completed),currentInWorld=f>=start&&f<start+PER_WORLD?f:null;
  shell.dataset.journey='52';shell.classList.add('journey-map-shell');
  const tabs=Array.from({length:6},(_,i)=>{const wt=worldData(i),open=worldUnlocked(i,state.completed);return `<button class="journey-world-tab ${i===w?'selected':''} ${open?'open':'locked'}" ${open?`data-action="world" data-world="${i}"`:'disabled'} aria-label="${wt.name}${open?'':' vergrendeld'}"><span>${buttonIcon(wt.symbol||'worlds')}</span><small>${i+1}</small></button>`;}).join('');
  const nodes=Array.from({length:PER_WORLD},(_,j)=>mapNode(start+j,j,state.completed,f)).join('');
  shell.innerHTML=`<section class="journey-map" style="--journey-accent:${t.accent||'#CC5A43'}">
    <div class="journey-map-hero">${scenery(w,'journey-map-art')}</div>
    <div class="journey-map-topbar">
      <button class="journey-square-button" data-action="home" aria-label="Startscherm">${buttonIcon('home')}</button>
      <div class="journey-map-title"><span>WERELD ${w+1} / 6</span><h1>${t.name}</h1><small>${p} van 12 voltooid</small></div>
      <button class="journey-square-button" data-action="settings" aria-label="Instellingen">${buttonIcon('settings')}</button>
    </div>
    <div class="journey-world-tabs" aria-label="Werelden">${tabs}</div>
    <div class="journey-map-status"><span>${buttonIcon('star')}<strong>${stars}</strong> sterren</span><span>${buttonIcon('target')}<strong>${f===TOTAL?'72':f+1}</strong> ${f===TOTAL?'voltooid':'volgende'}</span></div>
    <div class="journey-route-wrap">
      <svg class="journey-route" viewBox="0 0 400 1430" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g>${mapSegments(state.completed,start)}</g></svg>
      ${nodes}
      <div class="journey-world-finish" style="left:50%;top:2.45%">${buttonIcon(t.symbol||'star')}</div>
    </div>
    <div class="journey-map-bottom-card">
      <div><span>${currentInWorld===null?(p===12?'WERELD VOLTOOID':'VOLGENDE ROUTE'):'VOLGENDE LEVEL'}</span><strong>${currentInWorld===null?(p===12?'Mooi gedaan':`Ga verder met level ${f+1}`):`Level ${currentInWorld+1}`}</strong></div>
      ${currentInWorld!==null?`<button class="journey-play-pill" data-action="level" data-level="${currentInWorld}">${buttonIcon('play')}<span>Spelen</span></button>`:p===12&&w<5&&worldUnlocked(w+1,state.completed)?`<button class="journey-play-pill" data-action="world" data-world="${w+1}">${buttonIcon('arrow')}<span>Volgende wereld</span></button>`:''}
    </div>
    <nav class="journey-dock" aria-label="Hoofdnavigatie"><button data-action="worlds" aria-current="page">${buttonIcon('worlds')}<span>Kaart</span></button><button data-action="garden">${buttonIcon('collection')}<span>Collectie</span></button><button data-action="settings">${buttonIcon('settings')}<span>Instellingen</span></button></nav>
  </section>`;
  root.setTimeout(()=>{const el=doc.querySelector('.journey-level-node.current');if(el)el.scrollIntoView({block:'center',behavior:'auto'});},0);
}
function tuneCollection(shell){
  if(shell.dataset.journey==='52')return;shell.dataset.journey='52';
  const heading=shell.querySelector('.page-heading h1');if(heading)heading.textContent='Jouw ontdekkingen.';
  const intro=shell.querySelector('.page-intro');if(intro)intro.textContent='Voltooi levels op de kaart om werelden en mijlpalen te openen.';
}
function tunePlay(shell){
  if(shell.dataset.journey==='52')return;shell.dataset.journey='52';
  const side=shell.querySelector('.play-sidebar'),score=shell.querySelector('.game-score');
  if(score&&!score.querySelector('.journey-play-label'))score.insertAdjacentHTML('afterbegin','<span class="journey-play-label">OPDRACHT</span>');
  if(side){const objective=side.querySelector('.objective');if(objective)objective.classList.add('journey-objective');}
}
function enforceLocksInExistingDom(){
  refresh();doc.querySelectorAll('[data-action="level"][data-level]').forEach(b=>{
    const id=Number(b.dataset.level);if(!levelUnlocked(id,state.completed)){b.removeAttribute('data-action');b.disabled=true;b.classList.add('journey-force-locked');b.setAttribute('aria-label',`Level ${id+1}, vergrendeld. Voltooi eerst level ${frontier(state.completed)}.`);}
  });
}
function enhance(){
  queued=false;const page=currentPage();if(!page)return;setPageClass(page);enforceLocksInExistingDom();
  if(page==='home')redesignHome(doc.querySelector('.home-shell'));
  else if(page==='worlds')redesignWorlds(doc.querySelector('.atlas-shell'));
  else if(page==='garden')tuneCollection(doc.querySelector('.collection-shell'));
  else if(page==='play')tunePlay(doc.querySelector('.play-shell'));
  if(blockedDeepLink){blockedDeepLink=false;showLockToast('Dat level is nog niet open. Voltooi eerst je huidige route.');}
}
function queueEnhance(){if(queued)return;queued=true;root.requestAnimationFrame?root.requestAnimationFrame(enhance):root.setTimeout(enhance,0);}
doc.addEventListener('click',event=>{
  const b=event.target.closest?.('[data-level]');if(!b)return;const id=Number(b.dataset.level);refresh();
  if(Number.isInteger(id)&&!levelUnlocked(id,state.completed)){event.preventDefault();event.stopImmediatePropagation();showLockToast();}
},true);
function start(){
  const target=doc.getElementById('app');if(!target)return;
  observer=new MutationObserver(queueEnhance);observer.observe(target,{childList:true,subtree:true});queueEnhance();
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
return api;
});
