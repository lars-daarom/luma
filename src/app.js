(function () {
  'use strict';
  const E=LumaEngine, A=LumaArt, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const KEY='luma.save.v1', app=$('#app'), modalRoot=$('#modals'), live=$('#live');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const systemMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaults=()=>({version:1,completed:{},daily:{},resume:null,lastWorld:0,settings:{music:true,sound:true,muted:false,motion:systemMotion.matches,contrast:false,haptic:true}});
  let storageOkay=true, storageWarned=false;
  function readSave() {
    try {
      const raw=JSON.parse(localStorage.getItem(KEY)||'null'), safe=defaults();
      if(!raw || raw.version!==1) return safe;
      for(const k of Object.keys(safe.settings)) if(typeof raw.settings?.[k]==='boolean') safe.settings[k]=raw.settings[k];
      for(const [id,v] of Object.entries(raw.completed||{})) if(/^\d+$/.test(id) && Number(id)<72 && v && Number.isInteger(v.stars) && v.stars>=1 && v.stars<=3) safe.completed[id]={stars:v.stars,moves:Math.max(0,Number(v.moves)||0)};
      for(const [date,v] of Object.entries(raw.daily||{}).slice(-100)) if(/^\d{4}-\d{2}-\d{2}$/.test(date) && v && Number.isInteger(v.stars) && v.stars>=1 && v.stars<=3) safe.daily[date]={stars:v.stars,moves:Math.max(0,Number(v.moves)||0)};
      safe.lastWorld=Number.isInteger(raw.lastWorld)?Math.max(0,Math.min(5,raw.lastWorld)):0;
      if(raw.resume && Array.isArray(raw.resume.turns) && raw.resume.turns.length<=36 && raw.resume.turns.every(q=>Number.isInteger(q)&&Math.abs(q)<100000)) safe.resume=raw.resume;
      return safe;
    } catch(_){storageOkay=false;return defaults();}
  }
  let state=readSave(), page='home', world=state.lastWorld, game=null, winTimer=null, toastTimer=null, selectedSize=4, pendingInstall=null, winData=null;
  const audio=new LumaAudio(()=>state.settings);
  function save() { try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){storageOkay=false;if(!storageWarned){storageWarned=true;toast('Opslaan is geblokkeerd in deze browser. Je kunt wel blijven spelen.');}} }
  function completedCount(){return Object.keys(state.completed).length;}
  function lightCount(){return Object.values(state.completed).reduce((n,x)=>n+x.stars,0);}
  function nextLevel(){for(let i=0;i<72;i++)if(!state.completed[i])return i;return 0;}
  function theme(i=0) {
    const w=E.WORLDS[i], root=document.documentElement;
    for(const [key,val] of Object.entries({bg:w.bg,ink:w.ink,accent:w.color,light:w.light,board:w.board,muted:w.muted,petal:w.petal})) root.style.setProperty('--'+key,val);
    root.style.setProperty('--line',i===4?'rgba(241,236,223,.17)':'rgba(48,45,59,.13)');
    $('meta[name="theme-color"]').content=w.bg; audio.setTheme(i);
    document.body.classList.toggle('contrast',state.settings.contrast); document.body.classList.toggle('reduce-motion',state.settings.motion);
  }
  function soundButton(){return `<button class="icon-button sound-button ${!state.settings.muted?'sound-on':''}" data-act="mute" aria-label="${state.settings.muted?'Geluid inschakelen':'Geluid dempen'}" aria-pressed="${!state.settings.muted}">${A.icon(state.settings.muted?'mute':'sound')}</button>`;}
  function header(active='home') {return `<header class="topbar"><button class="logo-button" data-act="home" aria-label="Luma, naar start">${A.logo()}</button><nav class="desktop-nav" aria-label="Hoofdnavigatie">${[['home','Ontdek'],['worlds','Werelden'],['garden','Mijn tuin']].map(([p,t])=>`<button data-act="${p}" class="${active===p?'active':''}" ${active===p?'aria-current="page"':''}>${t}</button>`).join('')}</nav><div class="top-actions">${soundButton()}<button class="icon-button" data-act="settings" aria-label="Instellingen">${A.icon('settings')}</button></div></header>`;}
  function bottomNav(active) {return `<nav class="bottom-nav" aria-label="Hoofdnavigatie">${[['home','sun','Ontdek'],['worlds','worlds','Werelden'],['garden','garden','Mijn tuin']].map(([p,i,t])=>`<button data-act="${p}" class="${active===p?'active':''}" ${active===p?'aria-current="page"':''}>${A.icon(i)}<span>${t}</span></button>`).join('')}</nav>`;}
  function closeDialogs(){ $$('dialog[open]').forEach(d=>d.close()); modalRoot.innerHTML=''; }
  function focusHeading(){ requestAnimationFrame(()=>{ const h=$$('h1',app).find(x=>x.getClientRects().length); if(h){h.tabIndex=-1;h.focus({preventScroll:true});} }); }
  function setRoute(name,push=true){if(push && location.hash!=='#'+name) {try{history.pushState({page:name},'',location.pathname+location.search+'#'+name);}catch(_){}}}
  function navigate(name='home',push=true){
    if(game && !game.won) persistGame();
    if(winTimer) clearTimeout(winTimer);
    closeDialogs(); game=null; page=name;
    document.body.classList.remove('playing'); setRoute(name,push);
    if(name==='worlds') renderWorlds(); else if(name==='garden')renderGarden(); else{page='home';renderHome();}
    window.scrollTo(0,0); focusHeading();
  }
  function renderHome(){
    theme(0);const hasResume=Boolean(state.resume), date=E.dateKey(), dailyDone=state.daily[date];
    const startLabel=hasResume?'Verder met je puzzel':completedCount()?'Vervolg je reis':'Begin de reis';
    const dateLabel=new Date(date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'});
    app.innerHTML=`<div class="shell view-enter">${header('home')}<section class="hero" aria-labelledby="home-title"><div class="hero-copy"><div class="eyebrow"><span class="tiny-dot"></span> EEN KLEIN MOMENT VOOR JEZELF</div><h1 id="home-title">Kleine draai.<br><span>Groot gevoel.</span></h1><p>Verbind het licht.<br>Laat je hoofd even los.</p><button class="primary hero-cta" data-act="continue">${startLabel}${A.icon('arrow')}</button><div class="under-cta"><span>${A.icon('worlds')}72 puzzels</span><span>${A.icon('sun')}6 werelden</span><span>${A.icon('infinity')}Jouw tempo</span></div></div><div class="hero-art">${A.hero()}</div></section><section class="home-secondary" aria-label="Meer manieren om te spelen"><button class="feature-card daily" data-act="daily"><span class="card-icon">${A.icon(dailyDone?'check':'sun')}</span><span><span class="eyebrow">VANDAAG EEN LICHTPUNTJE</span><h2>${dailyDone?'Mooi gedaan.':'Even helemaal hier.'}</h2><p>${dailyDone?'Nog een keer spelen':dateLabel+' / nieuwe dagpuzzel'}</p></span>${A.icon('arrow','card-arrow')}</button><button class="feature-card zen" data-act="zen"><span class="card-icon">${A.icon('infinity')}</span><span><span class="eyebrow">VRIJ SPELEN</span><h2>Volg je gevoel.</h2><p>Een nieuwe puzzel, wanneer jij wilt.</p></span>${A.icon('arrow','card-arrow')}</button></section><footer class="quiet-footer"><span>Geen haast. Geen advertenties. Alleen jij.</span><span>${completedCount()?completedCount()+' van 72 lichtpuntjes verzameld':'Een kleine puzzel met een warm hart.'}</span></footer>${bottomNav('home')}</div>`;
  }
  function renderWorlds(){
    theme(world);state.lastWorld=world;save();const w=E.WORLDS[world], n=Object.keys(state.completed).filter(i=>Math.floor(Number(i)/12)===world).length;
    app.innerHTML=`<div class="shell view-enter">${header('worlds')}<section class="section-heading"><div><div class="eyebrow">ZES WERELDEN. EEN KLEINE REIS.</div><h1>Volg het licht.</h1></div><p>Begin bij het begin. Of ergens anders.<br>Deze reis is van jou.</p></section><nav class="world-tabs" aria-label="Kies een wereld">${E.WORLDS.map((w,i)=>`<button class="world-tab ${world===i?'active':''}" data-act="world" data-world="${i}" aria-pressed="${world===i}">${A.worldMark(i)}<span>${w.name}</span></button>`).join('')}</nav><section class="world-panel"><div class="world-panel-copy"><div class="eyebrow">WERELD ${String(world+1).padStart(2,'0')} / ${w.label}</div><h2>${w.name}</h2><p>${w.line}<br>${n} van 12 lichtpuntjes gevonden.</p>${A.scene(world,'world-scene')}</div><div class="level-grid" aria-label="Levels in ${w.name}">${Array.from({length:12},(_,j)=>{const id=world*12+j,done=state.completed[id],current=id===nextLevel();return `<button class="level-button ${current?'recommended':''}" data-act="level" data-level="${id}" aria-label="Level ${id+1}${done?', voltooid met '+done.stars+' lichtjes':''}${current?', aanbevolen':''}">${current?'<span class="level-current-dot"></span>':''}<strong>${String(id+1).padStart(2,'0')}</strong>${A.lights(done?.stars||0)}</button>`;}).join('')}</div></section><p class="world-note">${A.icon('infinity')}Alle levels zijn vrij te spelen. De eerste drie laten je rustig kennismaken.</p>${bottomNav('worlds')}</div>`;
    requestAnimationFrame(()=>{const tabs=$('.world-tabs'),active=$('.world-tab.active');if(tabs&&active)tabs.scrollLeft=Math.max(0,active.offsetLeft-tabs.clientWidth/2+active.clientWidth/2);});
  }
  function renderGarden(){
    theme(0); const count=completedCount();
    app.innerHTML=`<div class="shell view-enter">${header('garden')}<section class="section-heading"><div><div class="eyebrow">KLEINE MOMENTEN, SAMEN IETS MOOIS</div><h1>Jouw lichttuin.</h1></div><p>Elke opgeloste puzzel laat iets groeien.<br>Helemaal op jouw tempo.</p></section><div class="garden-summary"><div class="garden-stat"><strong>${count}<span style="font-size:14px;opacity:.5"> / 72</span></strong><small>Lichtpuntjes gevonden</small></div><div class="garden-stat"><strong>${lightCount()}</strong><small>Lichtjes verzameld</small></div><div class="garden-stat"><strong>${Object.keys(state.daily).length}</strong><small>Dagpuzzels opgelost</small></div></div><section class="garden-cards" aria-label="Je verzamelde bloemen per wereld">${E.WORLDS.map((w,i)=>{const n=Object.keys(state.completed).filter(k=>Math.floor(Number(k)/12)===i).length;return `<button class="garden-card" data-act="world" data-world="${i}" aria-label="${w.name}, ${n} van 12 bloemen, bekijk levels"><div class="garden-art" style="--card-bg:${w.board}">${A.garden(i,state.completed)}</div><div class="garden-info"><h2>${w.name}</h2><span>${n} / 12 bloemen</span></div></button>`;}).join('')}</section><p class="garden-empty">${count===0?'De eerste bloem begint met een kleine draai.':count===72?'Een tuin vol licht. Alle 72 puzzels zijn voltooid.':'Niets moet af. Ook een kleine tuin is een mooie tuin.'}</p>${bottomNav('garden')}</div>`;
  }
  function restoreGame(){
    const r=state.resume;
    if(!r)return false;
    try{startGame({id:r.id,mode:r.mode,date:r.date,seed:r.seed,n:r.n,world:r.world},r);return true;}
    catch(_){state.resume=null;save();return false;}
  }
  function startGame(options={},resume=null){
    const mode=['campaign','daily','zen'].includes(options.mode)?options.mode:'campaign';
    const id=Number.isInteger(options.id)?options.id:nextLevel();
    const date=options.date||E.dateKey();
    const seed=options.seed||((Date.now() ^ Math.floor(Math.random()*1000000))>>>0);
    const level=mode==='daily'?E.daily(date):mode==='zen'?E.generate(Math.max(0,Math.min(71,id)),{seed,n:options.n||4,world:options.world??Math.floor(Math.random()*6)}):E.generate(id);
    if(resume && (resume.turns.length!==level.solution.length || level.locked.some(i=>E.rotate(level.solution[i],resume.turns[i])!==level.solution[i]))) throw new Error('Invalid save');
    if(game&&!game.won)persistGame();if(winTimer)clearTimeout(winTimer);closeDialogs();
    game={level,mode,date,turns:resume?resume.turns.slice():level.initial.slice(),moves:Math.max(0,Number(resume?.moves)||0),hints:Math.max(0,Number(resume?.hints)||0),history:Array.isArray(resume?.history)?resume.history.filter(x=>x&&Number.isInteger(x.i)&&x.i>=0&&x.i<level.n*level.n&&Number.isInteger(x.q)&&Math.abs(x.q)<100000&&!level.locked.includes(x.i)).slice(-200):[],won:false,hint:-1};
    // A solved persisted board is restored as a fresh replay, never stuck behind a missing dialog.
    if(E.evaluate(level,game.turns).won){game.turns=level.initial.slice();game.moves=0;game.hints=0;game.history=[];}
    world=level.world;state.lastWorld=world;page='play';theme(world);document.body.classList.add('playing');setRoute('play');
    renderGame();persistGame();window.scrollTo(0,0);focusHeading();
  }
  function persistGame(){
    if(!game||game.won)return;
    const g=game,l=g.level;
    state.resume={id:l.id,mode:g.mode,date:g.date,seed:l.seed,n:l.n,world:l.world,turns:g.turns.slice(),moves:g.moves,hints:g.hints,history:g.history.slice(-200)};save();
  }
  function levelTitle(){if(game.mode==='daily')return 'Jouw dagelijkse lichtpuntje';if(game.mode==='zen')return 'Even helemaal niets moeten';return ['De eerste vonk','Om het hoekje','Volg je gevoel'][game.level.id]||E.WORLDS[world].name;}
  function renderGame(){
    const g=game,l=g.level,w=E.WORLDS[world],isIntro=g.mode==='campaign'&&l.id<3;
    const title=levelTitle(),badge=g.mode==='daily'?'DAGPUZZEL / '+g.date:g.mode==='zen'?'VRIJ SPELEN / '+l.n+' x '+l.n:'WERELD '+String(world+1).padStart(2,'0')+' / '+w.name.toUpperCase();
    app.innerHTML=`<div class="shell game-shell view-enter"><header class="topbar game-topbar"><div class="top-actions"><button class="icon-button" data-act="game-back" aria-label="Terug naar ${g.mode==='campaign'?'de werelden':'start'}">${A.icon('back')}</button></div><div class="game-top-title"><div class="eyebrow">${badge}</div><strong>${g.mode==='campaign'?'Lichtpuntje '+String(l.id+1).padStart(2,'0')+' van 72':'Alle tijd is van jou'}</strong></div><div class="top-actions">${soundButton()}<button class="icon-button" data-act="settings" aria-label="Instellingen">${A.icon('settings')}</button></div></header><section class="game-layout"><aside class="game-aside"><div class="chapter-no">${String(g.mode==='campaign'?l.id+1:world+1).padStart(2,'0')}</div><div class="eyebrow">${g.mode==='daily'?'EEN MOMENT VOOR VANDAAG':w.label}</div><h1>${title}</h1><p>${isIntro?'Geef de tegels een draai. Breng het licht naar de bloem.':w.line}</p><div class="world-progress" aria-hidden="true">${Array.from({length:12},(_,j)=>`<span class="${state.completed[world*12+j]?'done':''} ${l.id===world*12+j?'current':''}"></span>`).join('')}</div></aside><div class="game-center ${l.n>=5?'large-board':''}"><div class="game-mobile-title"><h1>${title}</h1><p>${isIntro?'Een kleine draai is alles wat je nodig hebt.':w.line}</p></div><div class="game-status"><div><span class="count" id="move-count">${String(g.moves).padStart(2,'0')}</span><span class="caption">draaien</span></div><div class="bloom-status">${A.icon('flower')}<span id="bloom-count"></span></div></div><div class="board-wrap"><div class="board" id="board" style="--n:${l.n}" role="group" aria-label="Puzzel van ${l.n} bij ${l.n}. Draai de tegels om alle lichtpaden te verbinden."></div></div><div class="board-caption" id="board-caption"></div><p class="game-instruction" id="instruction"></p><div class="game-tools"><button class="tool" data-act="undo" id="undo-button" aria-label="Laatste draai ongedaan maken">${A.icon('undo')}Terug</button><button class="tool" data-act="restart" aria-label="Deze puzzel opnieuw beginnen">${A.icon('restart')}Opnieuw</button><button class="tool hint-tool" data-act="hint">${A.icon('hint')}Hint</button></div></div><aside class="game-right">${A.scene(world,'mini-scene')}<div class="eyebrow">LAAT HET LICHT STROMEN</div><p>Verbind alle paden met de zon. Elke bloem komt vanzelf tot leven.</p><button class="small-link" data-act="help">Hoe werkt het?</button></aside></section><footer class="game-footer"><button data-act="help" style="min-height:44px;display:flex;align-items:center;gap:7px;padding:10px 15px">${A.icon('help')}Geen tijdslimiet. Geen verkeerde afslagen.</button></footer></div>`;
    buildBoard();updateBoard(true);
    if(isIntro&&l.id===0){$('.tile[data-index="4"]')?.classList.add('hint');}
  }
  function pipePath(mask){
    if(mask===3)return 'M50 0V26Q50 50 74 50H100';
    if(mask===6)return 'M100 50H74Q50 50 50 74V100';
    if(mask===12)return 'M50 100V74Q50 50 26 50H0';
    if(mask===9)return 'M0 50H26Q50 50 50 26V0';
    if(mask===5)return 'M50 0V100';if(mask===10)return 'M0 50H100';
    return E.DIRS.filter(d=>mask&d.bit).map(d=>`M50 50L${50+d.dx*50} ${50+d.dy*50}`).join('');
  }
  function marker(i){
    const l=game.level;
    if(i===l.source)return `<svg class="marker" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="23" fill="var(--accent)"/><circle cx="50" cy="50" r="16" fill="var(--light)"/><g fill="var(--ink)"><ellipse cx="45" cy="48" rx="1.8" ry="2.5"/><ellipse cx="55" cy="48" rx="1.8" ry="2.5"/></g><path d="M46 55q4 3 8 0" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`;
    if(l.portals.includes(i))return `<svg class="marker" viewBox="0 0 100 100" aria-hidden="true"><path d="m50 28 19 11v22L50 72 31 61V39Z" fill="var(--bg)" stroke="var(--accent)" stroke-width="4"/><circle cx="50" cy="50" r="10" stroke="var(--accent)" stroke-width="3" fill="var(--petal)"/><circle cx="50" cy="50" r="3" fill="var(--ink)"/></svg>`;
    if(l.flowers.includes(i))return `<svg class="marker" viewBox="0 0 100 100" aria-hidden="true"><g class="bud-petals">${A.petalPaths(50,50,22,6,'currentColor')}</g><circle class="bud-center" cx="50" cy="50" r="9"/></svg>`;
    return '';
  }
  function buildBoard(){
    const l=game.level,first=l.solution.findIndex((m,i)=>m&&!l.locked.includes(i));
    $('#board').innerHTML=l.solution.map((m,i)=>{
      if(!m)return `<span class="empty-tile" aria-hidden="true">${A.icon(i%2?'sparkle':'pin')}</span>`;
      const locked=l.locked.includes(i),p=pipePath(m);
      return `<button class="tile ${locked?'locked':''}" data-act="rotate" data-index="${i}" data-turn="${game.turns[i]}" ${locked?'aria-disabled="true"':''} tabindex="${i===first?0:-1}"><svg class="pipe" viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(${game.turns[i]*90}deg)"><path class="pipe-line" d="${p}"/><path class="pipe-shimmer" d="${p}"/></svg>${marker(i)}${locked?'<svg class="lock-pin" viewBox="0 0 10 10" aria-hidden="true"><path d="m5 0 5 5-5 5-5-5Z"/></svg>':''}<span class="hint-ring"></span>${A.icon('restart','hint-arrow')}</button>`;
    }).join('');
  }
  function updateBoard(initial=false){
    if(!game)return;const g=game,l=g.level,result=E.evaluate(l,g.turns),old=g.result;g.result=result;
    $$('.tile').forEach(el=>{
      const i=Number(el.dataset.index),isLit=result.lit.has(i),flower=l.flowers.includes(i),locked=l.locked.includes(i);
      el.classList.toggle('powered',isLit);el.dataset.turn=g.turns[i];
      $('.pipe',el).style.transform=`rotate(${g.turns[i]*90}deg)`;
      const dirs=E.DIRS.filter(d=>result.masks[i]&d.bit).map(d=>({1:'boven',2:'rechts',4:'onder',8:'links'}[d.bit])).join(', ');
      el.setAttribute('aria-label',`Rij ${Math.floor(i/l.n)+1}, kolom ${i%l.n+1}. ${i===l.source?'Zon. ':flower?'Bloem. ':l.portals.includes(i)?'Lichtpoort. ':''}${locked?'Vast. ':''}Verbindingen: ${dirs}. ${isLit?'Verlicht.':'Nog donker.'}${locked?'':' Tik om rechtsom te draaien.'}`);
    });
    $('#move-count').textContent=String(g.moves).padStart(2,'0');
    $('#bloom-count').textContent=l.flowers.length?`${result.flowers} / ${l.flowers.length} bloemen`:`${result.lit.size} / ${result.active} verbonden`;
    $('#undo-button').disabled=!g.history.length||g.won;
    $('#board-caption').innerHTML=g.mode==='zen'?`${A.icon('infinity')}Geen doel voor je draaien. Alleen jouw ritme.`:`${A.icon('sparkle')}Richtlijn voor 3 lichtjes: ${l.par} draaien, zonder hint`;
    if(!g.hintText)$('#instruction').innerHTML=instruction();
    audio.energy=result.lit.size/result.active;
    if(!initial && old && result.flowers>old.flowers){audio.effect('bloom');vibrate([8,30,8]);}
    if(!initial && old && result.flowers!==old.flowers)live.textContent=`${result.flowers} van ${l.flowers.length} bloemen verlicht.`;
    if(result.won&&!g.won)win();
  }
  function instruction(){
    const g=game,l=g.level;
    if(g.mode==='campaign'&&l.id===0)return '<strong>Tik op de middelste tegel.</strong><br>Verbind de zon met de bloem.';
    if(g.mode==='campaign'&&l.id===1)return 'Een bocht maakt een nieuw begin.<br>Geef het licht de weg naar de bloem.';
    if(l.portals.length)return 'De twee zeshoeken zijn lichtpoorten.<br>Wat de ene binnenkomt, verlaat de andere.';
    if(g.result?.flowers===l.flowers.length && g.result?.lit.size<g.result?.active)return 'De bloemen bloeien al.<br>Laat nu ook alle verbindingen oplichten.';
    if(l.world===4)return 'Een omweg kan ook een verbinding zijn.<br>Laat alle paden oplichten, zonder losse eindjes.';
    if(l.world===1)return 'Tegels met een ruitje staan vast.<br>Laat de andere paden eromheen stromen.';
    return 'Draai de tegels. Verbind alle paden.<br>Laat de bloemen oplichten.';
  }
  function vibrate(pattern=7){if(state.settings.haptic && navigator.vibrate)try{navigator.vibrate(pattern);}catch(_){}}
  function turn(i){
    if(!game||game.won||!Number.isInteger(i)||!game.level.solution[i])return;
    if(game.level.locked.includes(i)){toast(i===game.level.source?'Hier begint het licht. De zon staat vast.':'Deze tegel staat vast. Verbind de paden eromheen.');return;}
    const g=game;g.history.push({i,q:g.turns[i]});if(g.history.length>200)g.history.shift();g.turns[i]++;g.moves++;g.hintText='';g.hint=-1;
    $$('.tile.hint').forEach(el=>el.classList.remove('hint'));audio.effect('turn',g.moves);vibrate();updateBoard();persistGame();
  }
  function undo(){
    if(!game||game.won||!game.history.length)return;
    const m=game.history.pop();game.turns[m.i]=m.q;game.moves=Math.max(0,game.moves-1);game.hintText='';game.hint=-1;
    $$('.tile.hint').forEach(el=>el.classList.remove('hint'));audio.effect('undo');updateBoard();persistGame();
  }
  function hint(){
    if(!game||game.won)return;const g=game,l=g.level;
    let candidates=l.solution.map((m,i)=>m&&!l.locked.includes(i)&&E.rotate(m,g.turns[i])!==m?i:-1).filter(i=>i>=0);
    candidates.sort((a,b)=>Number(g.result.lit.has(b))-Number(g.result.lit.has(a)));
    const i=candidates[0];if(i===undefined)return;
    if(g.hint!==i)g.hints++;g.hint=i;const turns=E.distanceToSolution(l.solution[i],g.turns[i]);
    $$('.tile.hint').forEach(el=>el.classList.remove('hint'));const el=$(`.tile[data-index="${i}"]`);el?.classList.add('hint');
    g.hintText=`Deze tegel helpt je verder.<br><strong>Geef hem ${turns===1?'nog 1 draai':turns+' draaien'} rechtsom.</strong>`;
    $('#instruction').innerHTML=g.hintText;live.textContent=`Hint: draai rij ${Math.floor(i/l.n)+1}, kolom ${i%l.n+1}, ${turns} keer.`;
    el?.focus({preventScroll:true});audio.effect('hint');persistGame();
  }
  function restart(force=false){
    if(!game)return;if(game.moves>0&&!force){showDialog('Opnieuw beginnen?',`<p class="zen-copy">Deze puzzel gaat terug naar het begin. Je andere lichtpuntjes blijven bewaard.</p><div class="confirm-actions"><button class="tool" data-act="close">Verder spelen</button><button class="primary" data-act="confirm-restart">Opnieuw</button></div>`);return;}
    const g=game;startGame({id:g.level.id,mode:g.mode,date:g.date,seed:g.level.seed,n:g.level.n,world:g.level.world});
  }
  function win(){
    const g=game;if(!g||g.won)return;g.won=true;g.hintText='';
    const stars=E.grade(g.moves,g.hints,g.level.par),store=g.mode==='campaign'?state.completed:g.mode==='daily'?state.daily:null,key=g.mode==='daily'?g.date:String(g.level.id);
    const fresh=store?!store[key]:true;
    if(store){const old=store[key];store[key]={stars:Math.max(stars,old?.stars||0),moves:old?Math.min(old.moves,g.moves):g.moves};}
    state.resume=null;save();$('#board').classList.add('won');$('#instruction').innerHTML='<strong>Alles is verbonden.</strong><br>Een klein moment om van te genieten.';
    $('#undo-button').disabled=true;live.textContent='Puzzel opgelost. '+stars+' van 3 lichtjes verzameld.';
    audio.effect('win');vibrate([10,60,15]);
    winData={stars,moves:g.moves,hints:g.hints,par:g.level.par,world:g.level.world,id:g.level.id,mode:g.mode,date:g.date,seed:g.level.seed,n:g.level.n,fresh};
    winTimer=setTimeout(()=>{if(game===g&&g.won)showWin();},state.settings.motion?350:850);
  }
  function showWin(){
    const d=winData;if(!d)return;closeDialogs();
    const chapterEnd=d.mode==='campaign'&&(d.id+1)%12===0;
    const title=d.mode==='campaign'&&d.id===71?'Een wereld vol licht.':chapterEnd?'Een wereld lichter.':d.stars===3?'Dat voelt goed.':'Kijk eens wat je deed.';
    const text=d.mode==='zen'?'Niets moest. En toch kwam alles samen.':d.mode==='daily'?'Jouw lichtpuntje voor vandaag. Morgen wacht er weer een nieuw.':d.id===0?'Je hebt je eerste lichtpuntje gevonden. Deze kleine reis is begonnen.':chapterEnd?'Neem het gevoel even mee. Er is altijd een nieuwe weg.':'Een beetje draaien. Een beetje ontdekken. En ineens valt alles op zijn plek.';
    const nextLabel=d.mode==='zen'?'Nog een vrije puzzel':d.mode==='daily'?'Naar mijn lichttuin':d.id===71?'Bekijk je lichttuin':chapterEnd?'Ontdek de volgende wereld':'Nog een lichtpuntje';
    modalRoot.innerHTML=`<dialog id="win-dialog" class="win-dialog" aria-labelledby="win-title">${A.flower(d.world,'win-flower')}<div class="eyebrow">${d.mode==='daily'?'DAGPUZZEL VOLTOOID':d.mode==='zen'?'EEN MOMENT VOOR JEZELF':'LICHTPUNTJE '+String(d.id+1).padStart(2,'0')+' GEVONDEN'}</div><h2 id="win-title">${title}</h2><p class="win-copy">${text}</p>${d.mode!=='zen'?A.lights(d.stars,true):''}<div class="win-stats"><div><strong>${d.moves}</strong><small>Draaien</small></div><div><strong>${d.hints}</strong><small>Hints</small></div>${d.mode!=='zen'?`<div><strong>${d.par}</strong><small>Richtlijn</small></div>`:''}</div><button class="primary" data-act="next">${nextLabel}${A.icon('arrow')}</button><div class="win-secondary"><button data-act="share">${A.icon('share')}Deel dit moment</button><button data-act="win-exit">Even pauze</button></div></dialog>`;
    const dialog=$('#win-dialog');dialog.addEventListener('cancel',e=>{e.preventDefault();navigate('home');});dialog.showModal();
    if(!state.settings.motion)confetti(d.world);
  }
  function showDialog(title,content){
    closeDialogs();modalRoot.innerHTML=`<dialog id="sheet" aria-labelledby="dialog-title"><header class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-act="close" aria-label="Sluiten">${A.icon('close')}</button></header>${content}</dialog>`;
    const d=$('#sheet');d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
    d.showModal();
  }
  function settings(){
    const s=state.settings,rows=[['music','Themamuziek','Een eigen, zachte melodie voor elke wereld.'],['sound','Speelgeluiden','Kleine klanken bij elke draai en verbinding.'],['haptic','Voelbare tikjes','Alleen op apparaten die dit ondersteunen.'],['motion','Minder beweging','Rustige overgangen, zonder rondzwevende details.'],['contrast','Sterkere contrasten','Duidelijker onderscheid tussen de lichtpaden.']];
    showDialog('Helemaal jouw tempo.',rows.map(([k,t,d])=>`<div class="setting-row"><div><strong id="setting-label-${k}">${t}</strong><small>${d}</small></div><button class="switch" role="switch" aria-checked="${s[k]}" aria-labelledby="setting-label-${k}" data-act="toggle" data-setting="${k}"></button></div>`).join('')+`<div class="dialog-footer">${s.muted?'Het geluid is nu volledig gedempt. Gebruik het luidsprekerknopje om te luisteren.<br>':''}${!audio.available?'Audio is niet beschikbaar in deze browser.<br>':''}${storageOkay?'Je voortgang blijft op dit apparaat bewaard.':'Je browser blokkeert het bewaren van voortgang.'}<br><button data-act="install">Luma op je beginscherm</button><br><button data-act="help">Hoe werkt Luma?</button> &nbsp; / &nbsp; <button data-act="about">Over Luma</button></div>`);
  }
  function help(){
    showDialog('Een kleine draai.',`<div class="help-step">${A.icon('touch')}<div><h3>Tik om te draaien.</h3><p>Elke tik draait een tegel een kwartslag rechtsom. Begin bij de zon en volg de paden.</p></div></div><div class="help-step">${A.icon('flower')}<div><h3>Breng alles tot leven.</h3><p>Verbind alle paden met de zon, zonder losse uiteinden. De bloemen gaan vanzelf bloeien.</p></div></div><div class="help-step">${A.icon('pin')}<div><h3>Sommige dingen blijven.</h3><p>De zon en tegels met een klein ruitje staan vast. In Avondrood komen lichtpoorten: licht springt van de ene zeshoek naar de andere.</p></div></div><div class="help-step">${A.icon('sparkle')}<div><h3>Je eigen kleine uitdaging.</h3><p>Je krijgt 1 lichtje voor oplossen, 2 zonder hints, 3 zonder hints binnen de richtlijn. Die richtlijn is een haalbaar aantal draaien, niet altijd het minimum. Terugdraaien mag altijd.</p></div></div><div class="help-keyboard">Op een toetsenbord: pijltjes om een tegel te kiezen, Enter of spatie om te draaien. Z is terug, H is een hint, R is opnieuw. Esc opent de instellingen. Er is geen tijdslimiet.</div><button class="primary" style="width:100%;margin-top:22px" data-act="close">Laat het licht stromen${A.icon('arrow')}</button>`);
  }
  function about(){showDialog('Een klein lichtpuntje.',`<div style="width:100px;margin:auto">${A.flower(0)}</div><div class="about-copy"><p>Luma is een rustige, volledig speelbare HTML5-puzzelgame. Een reis van 72 puzzels, zes werelden, een dagelijkse puzzel en vrij spel.</p><p>Alle illustraties zijn vectorvormen. De originele muziek en geluiden worden ter plekke gemaakt met Web Audio. Geen advertenties, account, tracking of externe downloads.</p><p>Je voortgang staat alleen in deze browser. Verwijder je de browsergegevens, dan verdwijnt ook je tuin. Luma is een zelfstandig ontwerp, niet verbonden aan Apple en geen bekroond product.</p><p>Versie 1.0.0</p></div>`);}
  function showZen(){showDialog('Volg je gevoel.',`<p class="zen-copy">Een nieuwe puzzel, speciaal voor dit moment. Kies de ruimte die bij je past.</p><div class="zen-sizes" aria-label="Formaat van je puzzel">${[3,4,5,6].map(n=>`<button class="${n===selectedSize?'active':''}" data-act="size" data-size="${n}" aria-pressed="${n===selectedSize}">${n} x ${n}</button>`).join('')}</div><p class="zen-copy">Geen score om na te jagen. Gewoon spelen.</p><button class="primary" style="width:100%;margin-top:25px" data-act="start-zen">Maak een lichtpuntje${A.icon('arrow')}</button>`);}
  function showInstall(){
    if(pendingInstall){pendingInstall.prompt();pendingInstall.userChoice.finally(()=>{pendingInstall=null;});return;}
    showDialog('Altijd een lichtpuntje.',`<div class="about-copy"><p>${window.LUMA_STANDALONE||location.protocol==='file:'?'Dit is de losse HTML-versie. Voor installatie op je beginscherm gebruik je de webapp-map op een HTTPS-webadres.':'Open Luma in Safari op je iPhone. Tik op de deelknop en kies "Zet op beginscherm". Op Android vind je "App installeren" of "Toevoegen aan startscherm" in het browsermenu.'}</p><p>De webapp-versie heeft een eigen app-icoon en werkt na de eerste volledige laadbeurt ook zonder internet. Je voortgang blijft lokaal bewaard; er is geen synchronisatie tussen apparaten.</p></div>`);
  }
  async function share(){
    const d=winData;if(!d)return;
    let text=`LUMA / ${d.mode==='daily'?d.date:d.mode==='zen'?'Een vrij lichtpuntje':'Lichtpuntje '+(d.id+1)}\n${d.moves} draaien${d.mode!=='zen'?' / '+d.stars+' van 3 lichtjes':''}\nEen kleine draai. Een wereld van verschil.`;
    let url='';
    if(/^https?:$/.test(location.protocol)&&!['localhost','127.0.0.1'].includes(location.hostname)){
      const u=new URL(location.href);u.hash='';u.search='';
      if(d.mode==='daily')u.searchParams.set('daily',d.date);else if(d.mode==='campaign')u.searchParams.set('level',String(d.id+1));
      url=u.toString();
    }
    if(navigator.share){try{await navigator.share({title:'Luma',text,...(url?{url}:{})});return;}catch(e){if(e.name==='AbortError')return;}}
    const all=text+(url?'\n'+url:'');
    if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(all);toast('Je lichtpuntje is gekopieerd.');return;}catch(_){}}
    showDialog('Deel je lichtpuntje.',`<p class="zen-copy">Selecteer en kopieer je resultaat.</p><textarea class="share-field" readonly aria-label="Je resultaat om te delen">${esc(all)}</textarea><button class="primary" style="width:100%" data-act="back-win">Terug naar je lichtpuntje${A.icon('arrow')}</button>`);
    $('.share-field').select();
  }
  function toast(message){const el=$('#toast');clearTimeout(toastTimer);el.textContent=message;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),3700);}
  function confetti(world){
    const canvas=$('#confetti'),ctx=canvas.getContext('2d');if(!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2),W=innerWidth,H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);
    const w=E.WORLDS[world],colors=[w.color,w.petal,w.light,w.board],parts=Array.from({length:42},(_,i)=>({x:W/2,y:H*.46,vx:(Math.random()-.5)*9,vy:-4-Math.random()*8,r:3+Math.random()*4,a:Math.random()*6,color:colors[i%4]}));
    const started=performance.now();let last=started;
    function frame(t){const dt=Math.min((t-last)/16.67,2);last=t;ctx.clearRect(0,0,W,H);const age=t-started;if(age>1800||state.settings.motion){canvas.width=0;return;}ctx.globalAlpha=Math.min(1,(1800-age)/450);parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.14*dt;p.a+=.035*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle=p.color;ctx.beginPath();ctx.ellipse(0,0,p.r,p.r*.5,0,0,Math.PI*2);ctx.fill();ctx.restore();});requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }
  function updateSoundButtons(){ $$('.sound-button').forEach(b=>{b.innerHTML=A.icon(state.settings.muted?'mute':'sound');b.setAttribute('aria-pressed',String(!state.settings.muted));b.setAttribute('aria-label',state.settings.muted?'Geluid inschakelen':'Geluid dempen');b.classList.toggle('sound-on',!state.settings.muted);}); }
  document.addEventListener('pointerdown',()=>{ if(!document.hidden && !state.settings.muted)audio.unlock(); },{passive:true});
  document.addEventListener('keydown',()=>{if(!document.hidden&&!state.settings.muted)audio.unlock();},{once:true});
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const act=b.dataset.act;
    if(act!=='rotate'&&act!=='mute')audio.effect('tap');
    switch(act){
      case 'home':navigate('home');break;
      case 'worlds':navigate('worlds');break;
      case 'garden':navigate('garden');break;
      case 'world':world=Number(b.dataset.world);navigate('worlds');break;
      case 'continue':if(!restoreGame())startGame({id:nextLevel()});break;
      case 'level':startGame({id:Number(b.dataset.level)});break;
      case 'daily':if(state.resume?.mode==='daily'&&state.resume.date===E.dateKey()){if(!restoreGame())startGame({mode:'daily'});}else startGame({mode:'daily'});break;
      case 'zen':showZen();break;
      case 'size':selectedSize=Number(b.dataset.size);$$('.zen-sizes button').forEach(el=>{const active=Number(el.dataset.size)===selectedSize;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});break;
      case 'start-zen':startGame({mode:'zen',n:selectedSize});break;
      case 'rotate':turn(Number(b.dataset.index));break;
      case 'undo':undo();break;
      case 'hint':hint();break;
      case 'restart':restart();break;
      case 'confirm-restart':restart(true);break;
      case 'game-back':navigate(game?.mode==='campaign'?'worlds':'home');break;
      case 'settings':settings();break;
      case 'help':help();break;
      case 'about':about();break;
      case 'install':showInstall();break;
      case 'close':closeDialogs();if(game?.won)showWin();break;
      case 'mute':state.settings.muted=!state.settings.muted;save();await audio.unlock();audio.sync();updateSoundButtons();if(!audio.available)toast('Audio is niet beschikbaar in deze browser.');break;
      case 'toggle':{
        const k=b.dataset.setting;if(!Object.hasOwn(state.settings,k))break;state.settings[k]=!state.settings[k];b.setAttribute('aria-checked',String(state.settings[k]));save();theme(game?game.level.world:page==='worlds'?world:0);await audio.unlock();audio.sync();break;
      }
      case 'next':{
        if(!winData)break;const d=winData;
        if(d.mode==='daily'||d.mode==='campaign'&&d.id===71)navigate('garden');
        else if(d.mode==='zen')startGame({mode:'zen',n:d.n,world:(d.world+1)%6});
        else startGame({id:d.id+1});break;
      }
      case 'share':share();break;
      case 'back-win':showWin();break;
      case 'win-exit':navigate('home');break;
    }
  });
  document.addEventListener('keydown',e=>{
    if(!game||$('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    const key=e.key.toLowerCase();
    if(key==='escape'){e.preventDefault();settings();return;}
    if(key==='h'){e.preventDefault();hint();return;}if(key==='z'){e.preventDefault();undo();return;}if(key==='r'){e.preventDefault();restart();return;}
    if(!e.key.startsWith('Arrow'))return;
    const tiles=$$('.tile'),active=e.target.closest('.tile');if(!tiles.length)return;
    e.preventDefault();if(!active){tiles.find(el=>el.getAttribute('aria-disabled')!=='true')?.focus();return;}
    let index=Number(active.dataset.index),n=game.level.n,delta=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:e.key==='ArrowUp'?-n:n;
    for(let k=0;k<n*n;k++){index=(index+delta+n*n)%(n*n);const el=$(`.tile[data-index="${index}"]`);if(el&&el.getAttribute('aria-disabled')!=='true'){tiles.forEach(x=>x.tabIndex=-1);el.tabIndex=0;el.focus({preventScroll:true});break;}}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){persistGame();audio.pause();}else{if(audio.ctx&&!state.settings.muted)audio.unlock();refreshDate();}});
  window.addEventListener('pagehide',persistGame);
  window.addEventListener('popstate',()=>{const route=location.hash.slice(1);if(route==='play'){if(!restoreGame())navigate('home',false);}else navigate(['worlds','garden'].includes(route)?route:'home',false);});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pendingInstall=e;});
  systemMotion.addEventListener?.('change',e=>{if(e.matches){state.settings.motion=true;save();document.body.classList.add('reduce-motion');}});
  let lastDate=E.dateKey();function refreshDate(){const today=E.dateKey();if(today!==lastDate){lastDate=today;if(page==='home'&&!$('dialog[open]'))renderHome();}}
  setInterval(()=>{if(!document.hidden)refreshDate();},60000);
  if(!window.LUMA_STANDALONE&&'serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{});});
  theme(0);
  const params=new URLSearchParams(location.search);
  try{
    if(params.has('daily')){E.daily(params.get('daily'));startGame({mode:'daily',date:params.get('daily')});}
    else if(params.has('level')&&/^\d+$/.test(params.get('level'))&&Number(params.get('level'))>=1&&Number(params.get('level'))<=72)startGame({id:Number(params.get('level'))-1});
    else if(location.hash==='#play'&&restoreGame()){}
    else navigate(['#worlds','#garden'].includes(location.hash)?location.hash.slice(1):'home',false);
  }catch(_){navigate('home',false);toast('Die puzzel kon niet worden geopend. Begin hier een nieuwe reis.');}
})();
