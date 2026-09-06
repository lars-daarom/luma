/* LUMA - deterministic, dependency-free puzzle engine. Directions: N E S W. */
(function (root) {
  'use strict';
  const DIRS = [{ bit: 1, opp: 4, dx: 0, dy: -1 }, { bit: 2, opp: 8, dx: 1, dy: 0 }, { bit: 4, opp: 1, dx: 0, dy: 1 }, { bit: 8, opp: 2, dx: -1, dy: 0 }];
  const WORLDS = [
    { name: 'Zonnetuin', line: 'Luma en Pippa wijzen je de weg naar het licht.', label: 'DE EERSTE STAPJES', color: '#AD4D35', light: '#F4D89E', board: '#E5E9D8', bg: '#F8F7F0', ink: '#304B3B', muted: '#687463', petal: '#B3C5A0', key:60,bpm:78 },
    { name: 'Regendauw', line: 'Drijf met Nori langs regendruppels en waterlelies.', label: 'VASTE PUNTEN', color: '#347B70', light: '#CFE7D1', board: '#D9E8DF', bg: '#F0F6F0', ink: '#2F5149', muted: '#627D73', petal: '#A0C6B8', key:62,bpm:76 },
    { name: 'Fluisterbos', line: 'Volg Mosi naar de verborgen paden van het bos.', label: 'MEER VERTAKKINGEN', color: '#526F58', light: '#E0DFB4', board: '#DFE6D3', bg: '#F5F6ED', ink: '#354E40', muted: '#687663', petal: '#9CB18B', key:65,bpm:82 },
    { name: 'Zandbloei', line: 'Pico kent een geheime weg door de woestijn.', label: 'LICHTPOORTEN', color: '#A55F39', light: '#F1D39E', board: '#EBDEC5', bg: '#FCF4E7', ink: '#614C3B', muted: '#88725D', petal: '#D6BA95', key:57,bpm:74 },
    { name: 'Nachtkas', line: 'Onder de glazen koepel verzamelt Nova het licht.', label: 'CIRKELS', color: '#DBBAEC', light: '#F1DCA6', board: '#3C4154', bg: '#292E40', ink: '#F7F0E0', muted: '#C3BFD1', petal: '#8B8CAA', key:59,bpm:70 },
    { name: 'Sterrenweide', line: 'Bij Kiki komen alle kleine ontdekkingen samen.', label: 'HET GROTE GEHEEL', color: '#467A69', light: '#E7E5AC', board: '#DDE7D5', bg: '#F2F6E9', ink: '#355344', muted: '#677E67', petal: '#AEC6AE', key:64,bpm:86 }
  ];
  function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rotate(mask, turns = 1) { const q = ((turns % 4) + 4) % 4; return q === 0 ? mask : ((mask << q) | (mask >> (4 - q))) & 15; }
  function degree(mask) { return DIRS.reduce((s, d) => s + ((mask & d.bit) ? 1 : 0), 0); }
  function neighbour(i, d, n) { const x = i % n + d.dx, y = Math.floor(i / n) + d.dy; return x < 0 || x >= n || y < 0 || y >= n ? -1 : y * n + x; }
  function shuffle(a, random) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function distanceToSolution(mask, turns) { for (let k = 0; k < 4; k++) if (rotate(mask, turns + k) === mask) return k; return 0; }
  function evaluate(level, turns) {
    const masks = level.solution.map((m, i) => rotate(m, turns[i] || 0));
    const lit = new Set([level.source]), queue = [level.source];
    while (queue.length) {
      const i = queue.shift();
      for (const d of DIRS) {
        if (!(masks[i] & d.bit)) continue;
        const j = neighbour(i, d, level.n);
        if (j >= 0 && (masks[j] & d.opp) && !lit.has(j)) { lit.add(j); queue.push(j); }
      }
      if (level.portals.includes(i)) {
        const j = level.portals.find(p => p !== i);
        if (j !== undefined && !lit.has(j)) { lit.add(j); queue.push(j); }
      }
    }
    let leaks = 0;
    masks.forEach((m, i) => { for (const d of DIRS) if (m & d.bit) { const j = neighbour(i, d, level.n); if (j < 0 || !(masks[j] & d.opp)) leaks++; } });
    const active = level.solution.filter(Boolean).length;
    const flowers = level.flowers.filter(i => lit.has(i)).length;
    return { lit, masks, leaks, active, flowers, won: lit.size === active && leaks === 0 };
  }
  function buildTutorial(index) {
    const n = 3, paths = index === 0 ? [[3,4],[4,5]] : index === 1 ? [[6,3],[3,4],[4,1],[1,2]] : [[6,3],[3,0],[0,1],[1,4],[4,5],[5,2]];
    const solution = Array(9).fill(0);
    for (const [a,b] of paths) { const d = DIRS.find(d => neighbour(a,d,n) === b); solution[a] |= d.bit; solution[b] |= d.opp; }
    const source = index === 0 ? 3 : 6, end = index === 0 ? 5 : 2;
    const initial = Array(9).fill(0), locked = [source,end];
    if (index === 0) initial[4] = 1;
    if (index === 1) { initial[3] = 3; initial[4] = 3; }
    if (index === 2) { initial[0] = 3; initial[1] = 2; initial[4] = 3; }
    return finalize({ id: index, n, solution, initial, locked, source, flowers: [end], portals: [], world: 0, seed: index + 1 });
  }
  function finalize(level) {
    level.par = level.initial.reduce((s, q, i) => s + distanceToSolution(level.solution[i], q), 0);
    level.active = level.solution.filter(Boolean).length;
    return level;
  }
  function generate(id, opts = {}) {
    if (!Number.isInteger(id) || id < 0 || id > 71) throw new RangeError('Level must be between 0 and 71.');
    if (id < 3 && !opts.seed) return buildTutorial(id);
    const world = opts.world !== undefined ? Math.max(0, Math.min(5, opts.world)) : Math.floor(id / 12);
    const local = id % 12;
    const n = opts.n || (world === 0 ? 3 : world === 1 ? 4 : world === 2 ? (local < 6 ? 4 : 5) : world < 5 ? 5 : 6);
    if (!Number.isInteger(n) || n < 3 || n > 6) throw new RangeError('Board must be between 3 and 6.');
    const seed = (opts.seed || (73961 + id * 48271)) >>> 0, random = rng(seed);
    const solution = Array(n*n).fill(0), visited = new Set();
    const source = (n - 1) * n, stack = [source]; visited.add(source);
    // A randomized depth-first spanning tree guarantees a known solution.
    while (stack.length) {
      const a = stack[stack.length - 1];
      const choices = DIRS.map(d => [neighbour(a,d,n),d]).filter(([b]) => b >= 0 && !visited.has(b));
      if (!choices.length) { stack.pop(); continue; }
      const [b,d] = choices[Math.floor(random() * choices.length)];
      solution[a] |= d.bit; solution[b] |= d.opp; visited.add(b); stack.push(b);
    }
    const portals = [], locked = [source];
    if (world === 3 || world === 5) {
      // Split the tree into two connected regions; a paired light gate rejoins them.
      const candidates = [];
      solution.forEach((m,a) => DIRS.forEach(d => { const b = neighbour(a,d,n); if (b > a && (m & d.bit) && degree(m) > 1 && degree(solution[b]) > 1) candidates.push([a,b,d]); }));
      shuffle(candidates,random);
      for (const [a,b,d] of candidates) {
        solution[a] ^= d.bit; solution[b] ^= d.opp;
        const region = new Set([source]), q = [source];
        while (q.length) { const c = q.pop(); DIRS.forEach(t => { const k = neighbour(c,t,n); if (solution[c] & t.bit && k >= 0 && !region.has(k)) { region.add(k); q.push(k); } }); }
        const other = [...Array(n*n).keys()].filter(i => !region.has(i));
        if (region.size >= 3 && other.length >= 3) {
          const one = [...region].filter(i => i !== source).sort((i,j) => degree(solution[j])-degree(solution[i]));
          other.sort((i,j) => degree(solution[j])-degree(solution[i]));
          portals.push(one[0],other[0]); locked.push(...portals); break;
        }
        solution[a] |= d.bit; solution[b] |= d.opp;
      }
    }
    if (world === 4 || (world === 5 && local >= 6)) {
      const candidates = [];
      solution.forEach((m,a) => DIRS.forEach(d => { const b = neighbour(a,d,n); if (b > a && !(m & d.bit) && degree(m) > 1 && degree(solution[b]) > 1 && !portals.includes(a) && !portals.includes(b)) candidates.push([a,b,d]); }));
      // Additional loops create alternate routes in the later worlds.
      for (const [a,b,d] of shuffle(candidates,random).slice(0,world === 4 ? 1 + (local > 5 ? 1 : 0) : 1)) { solution[a] |= d.bit; solution[b] |= d.opp; }
    }
    if (world >= 1) {
      const anchors = shuffle([...Array(n*n).keys()].filter(i => !locked.includes(i) && degree(solution[i]) > 1),random);
      locked.push(...anchors.slice(0,world === 1 ? 2 : 1));
    }
    const initial = Array(n*n).fill(0);
    const free = shuffle([...Array(n*n).keys()].filter(i => !locked.includes(i) && degree(solution[i]) < 4),random);
    const count = opts.seed ? free.length : world === 0 ? Math.min(free.length,2 + Math.floor(local * 0.65)) : Math.ceil(free.length * (0.55 + local * 0.035));
    free.slice(0,count).forEach(i => { initial[i] = 1 + Math.floor(random() * 3); if (rotate(solution[i],initial[i]) === solution[i]) initial[i] = 1; });
    const flowers = solution.map((m,i) => degree(m) === 1 && i !== source && !portals.includes(i) ? i : -1).filter(i => i >= 0);
    const level = finalize({ id, n, solution, initial, source, locked, portals, flowers, world, seed });
    if (evaluate(level,initial).won) { initial[free[0]] = 1; finalize(level); }
    return level;
  }
  function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function daily(date = dateKey()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError('Invalid daily date.');
    const d = new Date(`${date}T12:00:00`);
    if (!Number.isFinite(d.getTime()) || dateKey(d) !== date) throw new TypeError('Invalid daily date.');
    const seed = Number(date.replace(/-/g,''));
    const world = seed % 6;
    return generate(world * 12 + 5, { seed, n: 5, world });
  }
  function grade(moves,hints,par) { return hints > 0 ? 1 : moves <= par ? 3 : 2; }
  const engine = { DIRS, WORLDS, rng, rotate, degree, neighbour, distanceToSolution, evaluate, generate, daily, dateKey, grade };
  root.LumaEngine = engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
})(typeof window !== 'undefined' ? window : globalThis);

/* Original procedural score. No samples, downloads, or external services. */
class LumaAudio {
  constructor(getSettings) { this.getSettings = getSettings; this.ctx = null; this.theme = 0; this.step = 0; this.next = 0; this.timer = null; this.energy = 0; this.available = true; }
  async unlock() {
    try {
      if (!this.ctx) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) { this.available = false; return; }
        this.ctx = new Audio();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.7;
        const limiter = this.ctx.createDynamicsCompressor(); limiter.threshold.value = -12; limiter.knee.value = 18; limiter.ratio.value = 5;
        this.master.connect(limiter); limiter.connect(this.ctx.destination);
        this.music = this.ctx.createGain(); this.fx = this.ctx.createGain(); this.music.connect(this.master); this.fx.connect(this.master);
        const delay = this.ctx.createDelay(1); delay.delayTime.value = 0.32;
        const feedback = this.ctx.createGain(); feedback.gain.value = 0.22;
        const wet = this.ctx.createGain(); wet.gain.value = 0.14;
        this.music.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(this.master);
        this.next = this.ctx.currentTime + 0.1;
        this.timer = setInterval(() => this.schedule(), 100);
      }
      if (this.ctx.state !== 'running') await this.ctx.resume();
      this.sync();
    } catch (_) { this.available = false; }
  }
  sync() {
    if (!this.ctx) return;
    const s = this.getSettings(), now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted || document.hidden ? 0 : 0.7, now, 0.12);
    this.music.gain.setTargetAtTime(s.music ? 0.7 : 0,now,0.2);
    this.fx.gain.setTargetAtTime(s.sound ? 0.65 : 0,now,0.05);
  }
  setTheme(theme) { if (this.theme !== theme) { this.theme = theme; this.step = 0; if (this.ctx) this.next = this.ctx.currentTime + 0.1; } }
  tone(midi,time,duration,gain,bus,type='sine',bright=false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator(), env = this.ctx.createGain();
    osc.type = type; osc.frequency.value = 440 * Math.pow(2,(midi-69)/12);
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(gain,time+0.015);
    env.gain.exponentialRampToValueAtTime(0.0001,time+duration);
    osc.connect(env); env.connect(bus); osc.start(time); osc.stop(time+duration+0.025);
    osc.onended = () => { osc.disconnect(); env.disconnect(); };
    if (bright) this.tone(midi+12,time,Math.min(duration,0.23),gain*0.18,bus,'sine');
  }
  schedule() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const s = this.getSettings();
    if (!s.music || s.muted || document.hidden) { this.next = this.ctx.currentTime + 0.15; return; }
    if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + 0.05;
    const theme = LumaEngine.WORLDS[this.theme], eighth = 60/theme.bpm/2;
    const scale = [0,2,4,7,9,12,14,16], melodies = [[0,4,2,5,1,4,3,2],[0,2,4,1,5,3,2,4],[2,4,5,3,0,2,4,1],[0,3,1,4,2,5,4,2],[0,4,3,1,5,2,4,3],[0,2,5,4,3,1,4,2]];
    while (this.next < this.ctx.currentTime + 0.25) {
      const step = this.step, bar = Math.floor(step/16)%4, progression = [0,-5,-3,-5], base = theme.key + progression[bar];
      if (step % 16 === 0) {
        [0,7,16].forEach((note,i) => this.tone(base+note,this.next+i*0.045,eighth*18,0.028,this.music));
        this.tone(base-24,this.next,eighth*12,0.08,this.music);
      }
      if (step % 2 === 0 || this.energy > 0.5) {
        const m = melodies[this.theme][Math.floor(step/2)%8];
        this.tone(base+12+scale[m],this.next,eighth*2.9,step%4===0 ? 0.058 : 0.035,this.music,'sine',true);
      }
      if (this.energy > 0.75 && step%4 === 2) this.tone(base+31,this.next,0.15,0.015,this.music,'triangle');
      this.next += eighth; this.step++;
    }
  }
  effect(kind, amount=0) {
    if (!this.ctx || this.ctx.state !== 'running' || !this.getSettings().sound || this.getSettings().muted) return;
    const t = this.ctx.currentTime, key = LumaEngine.WORLDS[this.theme].key;
    if (kind === 'turn') { this.tone(key+12+[0,2,4,7,9][amount%5],t,0.16,0.085,this.fx,'sine',true); this.tone(key-5,t,0.025,0.05,this.fx,'triangle'); }
    if (kind === 'bloom') [12,16,19].forEach((v,i)=>this.tone(key+v,t+i*0.07,0.75,0.055,this.fx,'sine',true));
    if (kind === 'win') [0,4,7,12,16,19,24].forEach((v,i)=>this.tone(key+v,t+i*0.10,1.2,0.08,this.fx,'sine',true));
    if (kind === 'tap') this.tone(key+19,t,0.07,0.04,this.fx);
    if (kind === 'hint') [19,16].forEach((v,i)=>this.tone(key+v,t+i*0.09,0.35,0.05,this.fx));
    if (kind === 'undo') this.tone(key+7,t,0.13,0.055,this.fx);
  }
  pause() { if (this.ctx) { this.sync(); this.ctx.suspend().catch(()=>{}); } }
}

/* Original Luma character system: one silhouette, six worlds, no image/font services. */
const LumaArt = (() => {
  const paths = {
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back:'<path d="m14 6-6 6 6 6"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
    sound:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    settings:'<path d="M4 7h7m5 0h4M4 17h3m5 0h8"/><circle cx="13" cy="7" r="3"/><circle cx="9" cy="17" r="3"/>',
    worlds:'<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2V5Zm6-2v15m6-12v15"/>',
    garden:'<path d="M12 21v-9m0 6C5 18 3 14 4 10c5 0 8 3 8 8Zm0-4c0-6 3-9 8-9 1 5-2 9-8 9Z"/>',
    home:'<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
    undo:'<path d="m8 5-5 5 5 5M3 10h10a6 6 0 0 1 0 12"/>',
    restart:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    hint:'<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3.5h.01"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20 14.5A9 9 0 0 1 9.5 4 9 9 0 1 0 20 14.5Z"/>',
    sparkle:'<path d="M12 3c0 6-3 9-9 9 6 0 9 3 9 9 0-6 3-9 9-9-6 0-9-3-9-9Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    share:'<path d="M12 15V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',
    infinity:'<path d="M12 12c-3-5-8-6-9-2-2 6 5 10 9 2 4-8 11-4 9 2-1 4-6 3-9-2Z"/>',
    leaf:'<path d="M5 20c0-9 7-14 15-16 1 12-5 19-13 13m-3 4 10-11"/>',
    portal:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><circle cx="12" cy="12" r="4"/>',
    flower:'<path d="M12 6c4-8 11-2 6 3 9 0 7 9 1 8 3 8-6 11-8 4-6 5-12-2-6-6-9-3-4-11 2-8 0-7 8-7 5-1Z"/><circle cx="12" cy="12" r="3"/>',
    touch:'<path d="M9 14V6a2 2 0 0 1 4 0v6c5-3 8-1 7 4l-1 5H9l-5-7a2 2 0 0 1 3-2l2 2Z"/>',
    pin:'<path d="m12 4 8 8-8 8-8-8Z"/>',
    volume:'<path d="M4 15V9m5 10V5m6 12V7m5 8V9"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    heart:'<path d="M12 20S2 14 3 8c1-5 7-5 9-1 2-4 8-4 9 1 1 6-9 12-9 12Z"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };
  function icon(name,cls=''){return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.sparkle}</svg>`;}
  function petalPaths(cx=50,cy=50,r=23,count=6,color='currentColor'){return Array.from({length:count},(_,i)=>`<ellipse cx="${cx}" cy="${cy-r*.58}" rx="${r*.48}" ry="${r*.64}" transform="rotate(${i*360/count} ${cx} ${cy})" fill="${color}"/>`).join('');}
  function face(mood='happy'){
    return `<g class="luma-face"><g class="luma-blush" fill="#EE9B83" opacity=".63"><ellipse cx="82" cy="125" rx="11" ry="7"/><ellipse cx="158" cy="125" rx="11" ry="7"/></g><g class="open-eyes"><g class="blink-eyes" fill="#414638"><ellipse cx="102" cy="109" rx="6.5" ry="10"/><ellipse cx="138" cy="109" rx="6.5" ry="10"/><g fill="#FFFCED"><circle cx="100" cy="105" r="2.1"/><circle cx="136" cy="105" r="2.1"/></g></g></g><g class="happy-eyes" fill="none" stroke="#414638" stroke-width="4" stroke-linecap="round"><path d="M95 111q7-9 14 0m22 0q7-9 14 0"/></g><g class="sleep-eyes" fill="none" stroke="#414638" stroke-width="4" stroke-linecap="round"><path d="M95 110q7 7 14 0m22 0q7 7 14 0"/></g><path class="luma-smile" d="M112 130q8 10 16 0" fill="none" stroke="#414638" stroke-width="3.5" stroke-linecap="round"/><ellipse class="luma-nose" cx="120" cy="120" rx="3" ry="2" fill="#DFA87B"/></g>`;
  }
  function character(world=0,mood='calm',props=true){
    const scarf=world===4||world===5;
    return `<g class="luma-character mood-${mood}"><g class="luma-body"><ellipse cx="106" cy="213" rx="17" ry="9" fill="#466D56" transform="rotate(-13 106 213)"/><ellipse cx="145" cy="213" rx="17" ry="9" fill="#466D56" transform="rotate(13 145 213)"/><path d="M107 169q-16 8-14 23c4 18 42 22 56 5 8-16-8-27-17-28Z" fill="#7CA077"/><path d="M113 184q7 13 21 15" stroke="#AAC499" stroke-width="3" fill="none" stroke-linecap="round"/><g class="luma-left-arm"><path d="M95 183c-31 0-44-18-43-33 24 1 40 11 43 33Z" fill="#90AE81"/><path d="m66 161 25 20" stroke="#C0D1A7" stroke-width="2" stroke-linecap="round"/></g><g class="luma-right-arm"><path d="M143 182c33-1 47-20 44-36-25 4-41 16-44 36Z" fill="#7CA077"/><path d="m151 178 23-21" stroke="#C0D1A7" stroke-width="2" stroke-linecap="round"/></g></g><g class="luma-head"><g transform="translate(0 3)" fill="#DD9871">${petalPaths(120,108,69,6,'#DD9871')}</g>${petalPaths(120,106,69,6,'#EFB285')}<path d="M103 31q18-15 35 1" stroke="#F7CDA1" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/><ellipse cx="120" cy="108" rx="56" ry="55" fill="#FFEDB8"/><path d="M78 91q8-29 42-28" fill="none" stroke="#FFF6D9" stroke-width="4" stroke-linecap="round"/>${face(mood)}</g>${scarf&&props?`<g fill="${world===4?'#A699CA':'#D29176'}"><path d="M99 167q24 12 45-1l2 11q-24 12-47 0Z"/><path d="m136 174 8 3 6 27-12 2-5-26Z"/></g>`:''}${world===2&&props?'<g transform="translate(162 57) rotate(22)"><path d="M-5 6q-10-17 3-22Q8-9-5 6Z" fill="#6E997D"/><circle cx="0" cy="0" r="8" fill="#FFF6DD"/><circle cx="0" cy="0" r="3" fill="#D0A663"/></g>':''}</g>`;
  }
  function mascot(world=0,mood='calm',cls=''){return LumaWorlds.portrait(LumaWorlds.host(world),mood,'mascot '+cls);}
  function head(world=0){return LumaWorlds.symbol(LumaWorlds.host(world),'source');}
  function logo(){return `<svg class="logo" viewBox="0 0 184 72" role="img" aria-label="Luma"><g fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 23v26q0 10 14 10M42 35v13q0 11 11 11t11-11V35M81 59V44q0-11 10-11t10 11v15m0-15q0-11 10-11t10 11v15M161 36v23m0-12c0-18-24-18-24 0s24 18 24 0"/></g><path d="M78 29q-16-1-17-19 17 0 17 19Z" fill="#9BB579"/><path d="M80 29q-1-18 17-21 1 17-17 21Z" fill="#799F70"/></svg>`;}
  function miniPlant(x,y,color='#E9B18B',r=12,faceOn=false){return `<g><path d="M${x} ${y+46}Q${x-8} ${y+20} ${x} ${y}" fill="none" stroke="#7C9B70" stroke-width="3" stroke-linecap="round"/><path d="M${x} ${y+29}q-22 0-20-17q18-1 20 17Z" fill="#A8BD8A"/>${petalPaths(x,y,r,6,color)}<circle cx="${x}" cy="${y}" r="${r*.48}" fill="#FFF1BF"/>${faceOn?`<circle cx="${x-3}" cy="${y}" r="1.3" fill="#42563F"/><circle cx="${x+3}" cy="${y}" r="1.3" fill="#42563F"/>`:''}</g>`;}
  function scenery(world=0,mode='home',count=0){return LumaWorlds.scenery(world,mode==='hello'?'home':mode);}
  function hero(world=0){return scenery(world,'hello');}
  function scene(world=0,cls=''){return `<div class="${cls}">${scenery(world)}</div>`;}
  function flower(world=0,cls='',happy=true){return mascot(world,happy?'joy':'calm',cls);}
  function worldMark(i){return LumaWorlds.thumbnail(i);}
  function garden(world,completed){return LumaWorlds.scenery(world,'garden',completed);}
  function lights(n,large=false){return `<div class="light-dots${large?' large':''}" aria-label="${n} van 3 lichtjes">${[0,1,2].map(i=>icon('sparkle',i<n?'':'off')).join('')}</div>`;}
  function appIcon(){return LumaWorlds.appIcon();}
  return {icon,petalPaths,face,character,mascot,head,logo,miniPlant,hero,scene,scenery,flower,worldMark,garden,lights,appIcon};
})();

/* App controller */
(function () {
  'use strict';
  const E=LumaEngine, A=LumaArt, W=LumaWorlds, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
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
  let gardenWorld=0, greetingCount=0, waterTimer=null;
  let state=readSave(), page='home', world=state.lastWorld, game=null, winTimer=null, toastTimer=null, selectedSize=4, pendingInstall=null, winData=null;
  const audio=new LumaAudio(()=>state.settings);
  function save() { try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){storageOkay=false;if(!storageWarned){storageWarned=true;toast('Opslaan is geblokkeerd in deze browser. Je kunt wel blijven spelen.');}} }
  function completedCount(){return Object.keys(state.completed).length;}
  function lightCount(){return Object.values(state.completed).reduce((n,x)=>n+x.stars,0);}
  function nextLevel(){for(let i=0;i<72;i++)if(!state.completed[i])return i;return 0;}

  function theme(i=0) {
    const w=E.WORLDS[i], root=document.documentElement;
    const blend=(a,b,t)=>'#'+[1,3,5].map(k=>Math.round(parseInt(a.slice(k,k+2),16)*(1-t)+parseInt(b.slice(k,k+2),16)*t).toString(16).padStart(2,'0')).join('');
    // iOS home-screen status text is white with black-translucent: use a dark,
    // world-specific band only behind that status area, never white-on-pastel.
    const status=blend(w.color,i===4?'#161824':w.ink,.72);
    for(const [key,val] of Object.entries({bg:w.bg,ink:w.ink,accent:w.color,light:w.light,board:w.board,muted:w.muted,petal:w.petal,chrome:w.bg,'status-bg':status})) root.style.setProperty('--'+key,val);
    root.style.setProperty('--line',i===4?'rgba(241,236,223,.17)':'rgba(48,45,59,.12)');
    root.style.setProperty('--surface',i===4?'rgba(255,255,255,.07)':'rgba(255,255,255,.57)');
    root.style.setProperty('--button-bg',i===4?'#EBC49E':'#355B43');
    root.style.setProperty('--button-ink',i===4?'#293340':'#FFFCF0');
    const paints=[
      ['#E7EDDF','#EFF2E6','#ACC0AC','#5D856B','#D7E1CB','#B8D8A5','#B9C7AF','#E5E9D9'],
      ['#E0ECE6','#EBF3EA','#A3C0BA','#3D827D','#CEDDD5','#BCE0D4','#B3C9C1','#E1EBE4'],
      ['#E4E9DB','#EEF1E3','#AFBCA4','#68845D','#D8DFCA','#D1DEA8','#BCC8A7','#E6E9D8'],
      ['#EEDFCB','#F5E8D6','#C5B79D','#A57B55','#E4D5BC','#F2D9AB','#CFC0A5','#EEE2CC'],
      ['#383F53','#40495C','#67758A','#BAABCE','#7E8BA0','#F0DCA8','#7D879A','#A4AABD'],
      ['#E1EBE0','#ECF2E4','#B0C5AF','#5C8B78','#D7E2CD','#D5E3AD','#BCCBAF','#E6ECDB']
    ][i];
    ['board','tile-rest','pipe-rest','pipe-lit','inlay-rest','inlay-lit','token-rest','token-core'].forEach((key,n)=>root.style.setProperty('--'+key,paints[n]));
    root.style.setProperty('--tile-lit',i===4?'#444C5C':['#E9EEDD','#E3F0E6','#E8EBD6','#F3E6CF','#444C5C','#E6EEDB'][i]);
    root.style.setProperty('--card',i===4?'#343B50':'#FEFDF7');
    root.style.setProperty('--card-selected',i===4?'#D9D1E7':'#426751');
    root.style.setProperty('--card-selected-ink',i===4?'#30354B':'#FFFCED');

    root.style.colorScheme=i===4?'dark':'light';
    root.dataset.world=String(i);
    // Explicit backgrounds are important for modern Safari's edge sampling.
    root.style.backgroundColor=w.bg;
    document.body.style.backgroundColor=w.bg;
    $('meta[name="theme-color"]').content=w.bg;
    audio.setTheme(i);
    document.body.classList.toggle('contrast',state.settings.contrast);
    document.body.classList.toggle('reduce-motion',state.settings.motion);
  }
  function soundButton(){return `<button class="icon-button sound-button ${!state.settings.muted?'sound-on':''}" data-act="mute" aria-label="${state.settings.muted?'Geluid inschakelen':'Geluid dempen'}" aria-pressed="${!state.settings.muted}">${A.icon(state.settings.muted?'mute':'sound')}</button>`;}

  function header(active='home') {
    return `<header class="app-header"><div class="header-inner"><button class="logo-button" data-act="home" aria-label="Luma, naar start">${A.logo()}</button><nav class="desktop-nav" aria-label="Hoofdnavigatie">${[['home','Thuis'],['worlds','De reis'],['garden','Ons tuintje']].map(([p,t])=>`<button data-act="${p}" class="${active===p?'active':''}" ${active===p?'aria-current="page"':''}>${t}</button>`).join('')}</nav><div class="top-actions">${soundButton()}<button class="icon-button" data-act="settings" aria-label="Instellingen">${A.icon('settings')}</button></div></div></header>`;
  }
  function bottomNav(active) {return `<nav class="bottom-nav" aria-label="Hoofdnavigatie"><div class="tab-tray">${[['home','home','Thuis'],['worlds','worlds','De reis'],['garden','garden','Ons tuintje']].map(([p,i,t])=>`<button data-act="${p}" class="${active===p?'active':''}" ${active===p?'aria-current="page"':''}>${A.icon(i)}<span>${t}</span></button>`).join('')}</div></nav>`;}

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
    const date=E.dateKey(),done=state.daily[date],count=completedCount();
    const next=state.resume?.mode==='campaign'?state.resume.id:nextLevel();
    const activeWorld=state.resume?.world??(count?Math.floor(next/12):0);theme(activeWorld);
    const w=E.WORLDS[activeWorld],label=state.resume?'Verder spelen':count?'Samen weer op pad':'Op pad met Luma';
    const sub=state.resume?.mode==='daily'?'Je dagpuzzel wacht op je':state.resume?.mode==='zen'?'Je vrije puzzel wacht op je':w.name+' / Lichtpuntje '+(next+1);
    const dateLabel=new Date(date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'});
    app.innerHTML=`${header('home')}<div class="shell home-shell view-enter"><section class="home-story" aria-labelledby="home-title"><div class="home-intro"><p class="eyebrow">KLEINE PUZZELS. GROOT GEZELSCHAP.</p><h1 id="home-title">${count?'Daar ben je weer.':'Een wereld die opbloeit.'}</h1><p>Laat het licht stromen.<br>Je nieuwe vrienden wachten op je.</p></div><button class="hello-luma scene-frame" data-act="hello" aria-label="Zeg hallo tegen Luma en de plantenvrienden"><span class="scene-location">${A.icon('sun')}${w.name}</span><span class="luma-whisper" id="luma-whisper">Zullen we samen?</span>${W.scenery(activeWorld,'home')}<span class="scene-hint">Tik voor een kleine groet</span></button><div class="home-action"><button class="primary hero-cta" data-act="continue"><span>${label}</span>${A.icon('arrow')}</button><p class="continue-detail">${sub}</p></div><section class="home-extras" aria-label="Nog een klein moment"><button class="daily-row" data-act="daily"><span class="daily-symbol">${A.icon(done?'check':'sun')}</span><span><strong>${done?'Je dagpuzzel is opgebloeid':'Een lichtpuntje voor vandaag'}</strong><small>${dateLabel}${done?' / nog eens spelen':' / elke dag een nieuwe puzzel'}</small></span>${A.icon('back','row-arrow')}</button><button class="free-play-link" data-act="zen">${A.icon('infinity')}Liever vrij spelen?</button></section></section></div>${bottomNav('home')}`;
  }
  function renderWorlds(){
    theme(world);state.lastWorld=world;save();const w=E.WORLDS[world],f=W.friend(W.host(world));
    const n=Object.keys(state.completed).filter(i=>Math.floor(Number(i)/12)===world).length;
    const resumeId=state.resume?.mode==='campaign'&&Math.floor(state.resume.id/12)===world?state.resume.id:null;
    const suggested=resumeId??Array.from({length:12},(_,j)=>world*12+j).find(id=>!state.completed[id]);
    const cards=Array.from({length:12},(_,j)=>{
      const id=world*12+j,done=state.completed[id],current=id===suggested;
      return `<button class="level-button ${done?'completed':''} ${current?'recommended':''}" data-act="level" data-level="${id}" ${current?'aria-current="step"':''} aria-label="Lichtpuntje ${id+1}${done?', voltooid met '+done.stars+' lichtjes':''}${current?', aanbevolen om verder te spelen':''}"><span class="level-number">${String(j+1).padStart(2,'0')}</span><span class="level-state">${done?A.lights(done.stars):current?(id===resumeId?'Verder':'Start'):'Ontdek'}</span><span class="level-corner" aria-hidden="true">${current?A.icon('arrow'):done?A.icon('check'):''}</span></button>`;
    }).join('');
    app.innerHTML=`${header('worlds')}<div class="shell worlds-shell view-enter"><div class="world-top"><span class="eyebrow">JOUW KLEINE ONTDEKKINGSREIS</span><span class="world-count">${world+1} / 6</span></div><nav class="world-tabs" aria-label="Kies een wereld">${E.WORLDS.map((w,i)=>`<button class="world-tab ${world===i?'active':''}" data-act="world" data-world="${i}" aria-label="${w.name}" aria-pressed="${world===i}">${A.worldMark(i)}<span>${w.name}</span></button>`).join('')}</nav><section class="world-panel"><div class="world-panel-copy"><p class="eyebrow">OP PAD MET ${f.name.toUpperCase()}</p><h1>${w.name}</h1><p>${w.line}</p><button class="world-art-button scene-frame" data-act="meet" data-friend="${f.id}" aria-label="Ontmoet ${f.name}">${W.scenery(world,'world')}<span class="scene-hint">Ontmoet ${f.name}</span></button><div class="chapter-progress"><div class="chapter-meter" role="progressbar" aria-label="Voortgang in ${w.name}" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${n}">${Array.from({length:12},(_,j)=>`<i class="${state.completed[world*12+j]?'filled':''}" aria-hidden="true"></i>`).join('')}</div><p class="world-progress-label">${n} van 12 lichtpuntjes gevonden</p></div></div><div class="world-levels"><div class="levels-heading"><span>Twaalf kleine ontdekkingen</span>${A.icon('sparkle')}</div><div class="level-grid" aria-label="Levels in ${w.name}">${cards}</div><div class="world-mechanic">${W.symbolSVG(f.id,'flower')}<span>${['Draai de paadjes. Breng licht naar elke bloem.','Vaste tegels geven je iets om op te bouwen.','Volg de vertakkingen naar alle bloemknoppen.','Lichtpoorten brengen twee delen samen.','Ook in een kring vindt het licht zijn weg.','Alles wat je hebt ontdekt, komt hier samen.'][world]}</span></div><p class="world-note">Geen haast. Je mag in elke wereld beginnen.</p></div></section></div>${bottomNav('worlds')}`;
    requestAnimationFrame(()=>{const rail=$('.world-tabs'),tab=$('.world-tab.active');if(rail&&tab)rail.scrollLeft=tab.offsetLeft-rail.offsetLeft-(rail.clientWidth-tab.clientWidth)/2;});
  }
  function renderGarden(){
    const count=completedCount(),w=E.WORLDS[gardenWorld],local=Object.keys(state.completed).filter(k=>Math.floor(Number(k)/12)===gardenWorld).length;theme(gardenWorld);
    const cast=W.collection(state.completed);
    app.innerHTML=`${header('garden')}<div class="shell garden-shell view-enter"><section class="garden-intro"><p class="eyebrow">EEN BEETJE LICHT. EEN BEETJE LIEFDE.</p><h1>Ons tuintje leeft.</h1><p>${count?'Elk lichtpuntje heeft hier een eigen plekje.':'Kleine sprietjes nu. Een tuin vol vrienden straks.'}</p></section><nav class="garden-switcher" aria-label="Bekijk een andere tuin">${E.WORLDS.map((w,i)=>`<button data-act="garden-world" data-world="${i}" class="${i===gardenWorld?'active':''}" aria-pressed="${i===gardenWorld}" aria-label="Tuin ${w.name}">${A.worldMark(i)}<span>${w.name}</span></button>`).join('')}</nav><div class="garden-main"><div class="garden-stage"><div class="garden-canvas scene-frame">${A.garden(gardenWorld,state.completed)}<div class="garden-spots">${Array.from({length:12},(_,j)=>{const id=gardenWorld*12+j,done=state.completed[id],f=W.friend(W.plantForLevel(gardenWorld,j)),x=277+(j%3)*240,y=337+Math.floor(j/3)*160;return `<button class="garden-spot ${done?'grown':'unplanted'}" style="left:${x/9.6}%;top:${(y+8)/10.2}%" data-act="${done?'meet':'level'}" data-friend="${f.id}" data-level="${id}" aria-label="${done?f.name+', geplant met lichtpuntje '+(id+1):'Plant hier een vriend: speel lichtpuntje '+(id+1)}"></button>`;}).join('')}</div><span class="garden-weather" aria-hidden="true">${A.icon(gardenWorld===4?'moon':'sun')}${w.name}</span></div><div class="garden-caption"><span>${local} / 12 plekjes in bloei</span><button data-act="water" class="water-button">${A.icon('garden')}Even verzorgen</button></div><p class="garden-hint">Tik op een sprietje om iets te planten.</p></div><div class="garden-aside"><h2>${local===12?'Wat hebben we veel laten groeien.':local?'Nog een plekje voor een vriend.':'Elk begin mag klein zijn.'}</h2><p>${local===12?'Je tuin is in volle bloei. Ga eens op bezoek bij de andere werelden.':'Los een nieuw lichtpuntje op. Op dat plekje verschijnt vanzelf een plantenvriend.'}</p><button class="primary" data-act="grow-garden">${local===12?'Naar de andere werelden':'Laat iets opbloeien'}${A.icon('arrow')}</button><p class="garden-total">${count} van 72 lichtpuntjes gevonden</p></div></div><section class="friends-section" aria-labelledby="friends-title"><div class="friends-heading"><div><p class="eyebrow">JE KLEINE GEZELSCHAP</p><h2 id="friends-title">Maak kennis.</h2></div><span>${cast.filter(f=>f.unlocked).length} / 7 vrienden</span></div><div class="friend-collection">${cast.map(f=>`<button class="friend-card ${f.unlocked?'unlocked':'not-yet'}" data-act="meet" data-friend="${f.id}" aria-label="Ontmoet ${f.name}${f.unlocked?'':', nog te verwelkomen'}"><span class="friend-avatar" style="--friend-color:${f.color}">${W.portrait(f.id)}</span><strong>${f.name}</strong><small>${f.unlocked?f.type:'3 puzzels in '+E.WORLDS[f.world].name}</small></button>`).join('')}</div><p class="collection-note">Na drie verschillende puzzels in een wereld komt de bewoner je gezelschap houden. Luma is er vanaf het begin.</p></section></div>${bottomNav('garden')}`;
  }
  function meetFriend(id){
    const f=W.friend(id),unlocked=W.collection(state.completed).find(x=>x.id===f.id).unlocked;
    showDialog(f.name,`<div class="friend-profile"><div class="profile-portrait" style="--friend-color:${f.color}">${W.portrait(f.id,'joy')}</div><p class="eyebrow">${f.type} / ${E.WORLDS[f.world].name}</p><h3>${f.line}</h3><p>${f.bio}</p>${unlocked?'<p class="friend-welcome">Al een vriend van jouw tuin.</p>':`<p class="friend-welcome">Los drie verschillende puzzels in ${E.WORLDS[f.world].name} op om ${f.name} te verwelkomen.</p>`}<button class="primary" data-act="world" data-world="${f.world}">Op bezoek in ${E.WORLDS[f.world].name}${A.icon('arrow')}</button></div>`);
  }
  function waterGarden(){
    const canvas=$('.garden-canvas');if(!canvas)return;
    canvas.classList.remove('is-watered');void canvas.offsetWidth;canvas.classList.add('is-watered');audio.effect('bloom');
    clearTimeout(waterTimer);waterTimer=setTimeout(()=>canvas.classList.remove('is-watered'),2400);
    toast('Een fris momentje voor je tuin. Nieuwe planten groeien door puzzels op te lossen.');
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
  function levelTitle(){
    if(game.mode==='daily')return 'Een lichtpuntje voor vandaag';if(game.mode==='zen')return 'Nergens anders hoeven zijn';
    const titles=[['De eerste vonk','Om het hoekje','Volg het licht','Hallo, bloemetje','Een klein ommetje','Samen op pad','Zachtjes verder','Alle tijd','Een nieuw begin','Bijna thuis','Nog een bochtje','Goedemorgen, wereld'],['Aan de waterkant','Een zachte stroom','Vaste grond','Met de stroom mee','Even dobberen','Onder de brug','Kleine golfjes','Aan de overkant','Van oever tot oever','Een rustig ritme','De laatste druppel','Alles stroomt'],['Een groene groet','Tussen de blaadjes','Een beetje groeien','Zon op je gezicht','Kleine takjes','Alles mag bloeien','Een geheime tuin','Nieuwe blaadjes','In volle bloei','Een krans van licht','Ruimte om te groeien','Een tuin vol vrienden'],['Een gouden randje','Achter de heuvel','Een andere deur','Het lange licht','Ver weg, dichtbij','Een warme omweg','Van hier naar daar','Door het avondlicht','Twee kleine poortjes','Vang de laatste zon','Thuis voor het donker','Tot morgen, zon'],['Een zacht lampje','De wereld slaapt','Om de maan','Sterren kijken','Een rondje dromen','Op kousenvoeten','Het stille pad','Een kring van licht','Nachtbloemetjes','Een kleine nachtwandeling','Vlak voor de ochtend','Welterusten, wereld'],['Een nieuw uitzicht','Kleur in de lucht','Verwonder je maar','Bijna aan de horizon','Volg de glinstering','Een lange zachte lijn','De wereld is groot','Een beetje van alles','Het komt samen','Helemaal op je plek','Nog een klein stukje','Kijk wat we hebben gemaakt']];
    return titles[world][game.level.id%12];
  }
  function renderGame(){
    const g=game,l=g.level,w=E.WORLDS[world],title=levelTitle();
    const subtitle=g.mode==='campaign'?w.name:g.mode==='daily'?'Dagpuzzel / '+new Date(g.date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'}):'Vrij spelen / '+l.n+' x '+l.n;
    app.innerHTML=`<header class="app-header game-topbar"><div class="header-inner"><button class="icon-button" data-act="game-back" aria-label="Terug naar ${g.mode==='campaign'?'de reis':'thuis'}">${A.icon('back')}</button><div class="game-top-title"><span>${subtitle}</span>${g.mode==='campaign'?`<small>${l.id%12+1} / 12</small>`:''}</div><button class="icon-button" data-act="settings" aria-label="Instellingen">${A.icon('more')}</button></div></header><section class="game-layout view-enter" style="--n:${l.n}"><div class="game-heading"><p class="eyebrow">${g.mode==='campaign'?'LICHTPUNTJE '+String(l.id+1).padStart(2,'0'):'ALLE TIJD VAN DE WERELD'}</p><h1>${title}</h1></div><div class="game-center"><div class="game-status"><div class="moves-stat"><span class="count" id="move-count">${g.moves}</span><span class="caption">draaien</span></div><div class="bloom-status">${A.icon('garden')}<span id="bloom-count"></span></div></div><div class="board-wrap terrain-${world}"><div class="board" id="board" style="--n:${l.n}" role="group" aria-label="Puzzel van ${l.n} bij ${l.n}. Draai de tegels om alle lichtpaden te verbinden."></div></div><div class="board-caption" id="board-caption"></div></div><aside class="game-controls" aria-label="Spelbediening"><div class="companion"><button class="companion-pet" id="companion-pet" data-act="hello" aria-label="${W.friend(W.host(world)).name} geeft je gezelschap">${W.symbolSVG(W.host(world),'source','companion-avatar')}</button><div class="companion-copy"><span class="companion-label">${W.friend(W.host(world)).name.toUpperCase()}</span><p class="game-instruction" id="instruction"></p></div></div><div class="game-tools"><button class="tool" data-act="undo" id="undo-button" aria-label="Laatste draai ongedaan maken">${A.icon('undo')}<span>Terug</span></button><button class="tool" data-act="restart" aria-label="Deze puzzel opnieuw beginnen">${A.icon('restart')}<span>Opnieuw</span></button><button class="tool hint-tool" data-act="hint">${A.icon('hint')}<span>Help me</span></button></div><button class="game-help" data-act="help">Hoe werkt het?</button></aside></section>`;
    buildBoard();updateBoard(true);
    if(g.mode==='campaign'&&l.id===0)$('.tile[data-index="4"]')?.classList.add('hint');
  }
  function pipePath(mask){
    if(mask===3)return 'M50 -1V26Q50 50 74 50H101';
    if(mask===6)return 'M101 50H74Q50 50 50 74V101';
    if(mask===12)return 'M50 101V74Q50 50 26 50H-1';
    if(mask===9)return 'M-1 50H26Q50 50 50 26V-1';
    if(mask===5)return 'M50 -1V101';if(mask===10)return 'M-1 50H101';
    return E.DIRS.filter(d=>mask&d.bit).map(d=>`M50 50L${50+d.dx*51} ${50+d.dy*51}`).join('');
  }
  function marker(i){
    const l=game.level;
    if(i===l.source)return `<svg class="marker source-marker" viewBox="0 0 100 100" aria-hidden="true">${W.symbol(W.host(world),'source')}</svg>`;
    if(l.portals.includes(i))return `<svg class="marker portal-marker" viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(45 50 50)"><rect x="29" y="29" width="42" height="42" rx="12" fill="var(--board)" stroke="var(--pipe-lit)" stroke-width="5"/><rect x="39" y="39" width="22" height="22" rx="7" fill="var(--inlay-lit)"/></g><path d="M46 45h8v10h-8Z" fill="var(--pipe-lit)"/></svg>`;
    if(l.flowers.includes(i))return `<svg class="marker bloom-marker" viewBox="0 0 100 100" aria-hidden="true">${W.symbol(W.plantForLevel(world,l.flowers.indexOf(i)),'flower')}</svg>`;
    return '';
  }
  function buildBoard(){
    const l=game.level,first=l.solution.findIndex((m,i)=>m&&!l.locked.includes(i));
    $('#board').innerHTML=l.solution.map((m,i)=>{
      if(!m)return `<span class="empty-tile" aria-hidden="true"><span class="empty-dot"></span></span>`;
      const locked=l.locked.includes(i),p=pipePath(m);
      // The clip belongs to the stationary cell, not the rotating SVG.
      // All branches share one path per opaque paint layer; no alpha seams.
      return `<button class="tile ${locked?'locked':''}" data-act="rotate" data-index="${i}" data-turn="${game.turns[i]}" ${locked?'aria-disabled="true"':''} tabindex="${i===first?0:-1}"><span class="pipe-clip"><svg class="pipe" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style="transform:rotate(${game.turns[i]*90}deg)"><path class="pipe-line" d="${p}"/><path class="pipe-inlay" d="${p}"/></svg></span>${marker(i)}${locked?'<svg class="lock-pin" viewBox="0 0 10 10" aria-hidden="true"><path d="m5 1 4 4-4 4-4-4Z"/></svg>':''}<span class="hint-ring"></span>${A.icon('restart','hint-arrow')}</button>`;
    }).join('');
  }
  function updateBoard(initial=false){
    if(!game)return;const g=game,l=g.level,result=E.evaluate(l,g.turns),old=g.result;g.result=result;
    $$('.tile').forEach(el=>{
      const i=Number(el.dataset.index),isLit=result.lit.has(i),flower=l.flowers.includes(i),locked=l.locked.includes(i);
      el.classList.toggle('powered',isLit);el.dataset.turn=g.turns[i];
      $('.pipe',el).style.transform=`rotate(${g.turns[i]*90}deg)`;
      const dirs=E.DIRS.filter(d=>result.masks[i]&d.bit).map(d=>({1:'boven',2:'rechts',4:'onder',8:'links'}[d.bit])).join(', ');
      el.setAttribute('aria-label',`Rij ${Math.floor(i/l.n)+1}, kolom ${i%l.n+1}. ${i===l.source?W.friend(W.host(world)).name+', de lichtbron. ':flower?'Bloemknop. ':l.portals.includes(i)?'Lichtpoort. ':''}${locked?'Vast. ':''}Verbindingen: ${dirs}. ${isLit?'Verlicht.':'Nog donker.'}${locked?'':' Tik om rechtsom te draaien.'}`);
    });
    $('#move-count').textContent=String(g.moves);
    $('#bloom-count').textContent=l.flowers.length?`${result.flowers} / ${l.flowers.length} in bloei`:`${result.lit.size} / ${result.active} verbonden`;
    $('#undo-button').disabled=!g.history.length||g.won;
    $('#board-caption').innerHTML=l.locked.length>1?`${A.icon('pin')}Een ruitje betekent: deze tegel staat vast.`:'Verbind alle paden. Laat geen losse eindjes over.';
    if(!g.hintText)$('#instruction').innerHTML=instruction();
    audio.energy=result.lit.size/result.active;
    if(!initial && old && result.flowers>old.flowers){audio.effect('bloom');vibrate([8,30,8]);reactLuma('joy');}
    if(!initial && old && result.flowers!==old.flowers)live.textContent=`${result.flowers} van ${l.flowers.length} bloemen verlicht.`;
    if(result.won&&!g.won)win();
  }
  function instruction(){
    const g=game,l=g.level;
    if(g.mode==='campaign'&&l.id===0)return '<strong>Tik op het middelste paadje.</strong> Breng mijn licht naar het bloemetje.';
    if(g.mode==='campaign'&&l.id===1)return 'Ook een bochtje kun je draaien. Zullen we het licht verder helpen?';
    if(l.portals.length)return 'Die twee zeshoeken horen bij elkaar. Het licht springt van de ene naar de andere.';
    if(g.result?.flowers===l.flowers.length&&g.result?.lit.size<g.result?.active)return 'De bloemen zijn wakker. Nu de rest van de paadjes nog.';
    if(l.world===4)return 'Een rondje mag ook. Als alle paadjes maar licht krijgen.';
    if(l.world===1)return 'Zie je die kleine ruitjes? Die paadjes staan vast. Draai de rest eromheen.';
    return 'Volg het licht vanaf mij. Elk paadje hoort erbij, ook de kleine omweggetjes.';
  }
  function reactLuma(mood='joy'){
    const characters=$$('.companion .plant-character,.hello-luma .plant-character,.world-art-button .plant-character,.garden-canvas .plant-character');
    characters.forEach(el=>{el.classList.remove('mood-calm','mood-joy','mood-sleep');el.classList.add('mood-'+mood,'greet');});
    setTimeout(()=>characters.forEach(el=>{el.classList.remove('greet','mood-'+mood);el.classList.add('mood-calm');}),1700);
  }
  function helloLuma(){
    const f=W.friend(game?W.host(world):'luma');reactLuma('joy');audio.effect('bloom');
    const whisper=$('#luma-whisper'),line=greetingCount++%2?f.line:f.greeting;
    if(whisper){whisper.textContent=line;whisper.classList.add('whisper-show');setTimeout(()=>whisper.classList.remove('whisper-show'),2500);}
    else toast(line);
  }
  function vibrate(pattern=7){if(state.settings.haptic && navigator.vibrate)try{navigator.vibrate(pattern);}catch(_){}}
  function turn(i){
    if(!game||game.won||!Number.isInteger(i)||!game.level.solution[i])return;
    if(game.level.locked.includes(i)){toast(i===game.level.source?'Hier ben ik. Draai de paadjes om mijn licht verder te brengen.':'Deze tegel staat vast. Verbind de paden eromheen.');return;}
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
    g.hintText=`Ik denk dat dit paadje helpt. <strong>${turns===1?'Nog 1 draai':turns+' draaien'} rechtsom.</strong>`;
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
    reactLuma('joy');audio.effect('win');vibrate([10,60,15]);
    winData={stars,moves:g.moves,hints:g.hints,par:g.level.par,world:g.level.world,id:g.level.id,mode:g.mode,date:g.date,seed:g.level.seed,n:g.level.n,fresh};
    winTimer=setTimeout(()=>{if(game===g&&g.won)showWin();},state.settings.motion?350:850);
  }
  function showWin(){
    const d=winData;if(!d)return;closeDialogs();
    const end=d.mode==='campaign'&&(d.id+1)%12===0;
    const title=d.mode==='campaign'&&d.id===71?'Een wereld vol licht.':end?'Wat een mooie reis.':'Kijk, het bloeit.';
    const newFriend=W.collection(state.completed).filter(f=>f.id!=='luma'&&f.world===d.world&&Object.keys(state.completed).filter(k=>Math.floor(Number(k)/12)===d.world).length===3);
    const text=d.mode==='campaign'&&d.fresh&&newFriend.length?newFriend.map(f=>f.name).join(' en ')+' komt in je tuin wonen!':d.mode==='zen'?'Even niets moeten. En toch iets moois gemaakt.':d.mode==='daily'?'Een klein lichtpuntje, speciaal voor vandaag.':d.fresh?'Er staat een nieuwe plantenvriend in je tuin.':'Weer een beetje licht in de wereld.';
    const nextLabel=d.mode==='zen'?'Nog een vrije puzzel':d.mode==='daily'||d.id===71?'Naar ons tuintje':end?'Op naar een nieuwe wereld':'Nog een lichtpuntje';
    modalRoot.innerHTML=`<dialog id="win-dialog" class="win-dialog" aria-labelledby="win-title"><button class="win-close icon-button" data-act="win-exit" aria-label="Even pauze, terug naar thuis">${A.icon('close')}</button><div class="win-art">${A.scenery(d.world,'celebrate')}</div><p class="eyebrow">${d.mode==='daily'?'JOUW MOMENT VOOR VANDAAG':d.mode==='zen'?'FIJN DAT JE ER WAS':'LICHTPUNTJE '+String(d.id+1).padStart(2,'0')}</p><h2 id="win-title">${title}</h2><p class="win-copy">${text}</p>${d.mode!=='zen'?`<div class="win-rating">${A.lights(d.stars,true)}<span>${d.moves} ${d.moves===1?'draai':'draaien'}</span><button data-act="score-info" aria-label="Uitleg over lichtjes">${A.icon('help')}</button></div>`:`<p class="zen-win-note">Helemaal op jouw tempo.</p>`}<button class="primary" data-act="next">${nextLabel}${A.icon('arrow')}</button><div class="win-secondary"><button data-act="share">${A.icon('share')}Deel je lichtpuntje</button><button data-act="win-exit">Even pauze</button></div></dialog>`;
    const dialog=$('#win-dialog');dialog.addEventListener('cancel',e=>{e.preventDefault();navigate('home');});dialog.showModal();
    if(!state.settings.motion)confetti(d.world);
  }
  function showDialog(title,content){
    closeDialogs();modalRoot.innerHTML=`<dialog id="sheet" aria-labelledby="dialog-title"><header class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-act="close" aria-label="Sluiten">${A.icon('close')}</button></header>${content}</dialog>`;
    const d=$('#sheet');const dismiss=()=>{closeDialogs();if(game?.won)showWin();};d.addEventListener('cancel',e=>{e.preventDefault();dismiss();});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}});
    d.showModal();
  }
  function settings(){
    const s=state.settings,rows=[['music','Muziek','Een zachte melodie voor elke wereld.'],['sound','Speelgeluiden','Een klein geluid bij elke ontdekking.'],...(navigator.vibrate?[['haptic','Voelbare tikjes','Een zachte reactie op je aanraking.']]:[]),['motion','Minder beweging','Zonder zweven, knipperen en confetti.'],['contrast','Meer contrast','Lichtpaden duidelijker onderscheiden.']];
    showDialog('Voel je thuis.',`<div class="settings-greeting">${A.mascot(game?.level.world??0,'calm')}<p>Een beetje zachter?<br>Helemaal zoals jij het fijn vindt.</p></div><div class="setting-group">${rows.map(([k,t,d])=>`<div class="setting-row"><div><strong id="setting-label-${k}">${t}</strong><small>${d}</small></div><button class="switch" role="switch" aria-checked="${s[k]}" aria-labelledby="setting-label-${k}" data-act="toggle" data-setting="${k}"></button></div>`).join('')}</div><div class="settings-links"><button data-act="install">${A.icon('download')}Luma op je beginscherm${A.icon('back','row-arrow')}</button><button data-act="backup">${A.icon('heart')}Bewaar je lichtpuntjes${A.icon('back','row-arrow')}</button><button data-act="help">${A.icon('help')}Hoe werkt Luma?${A.icon('back','row-arrow')}</button><button data-act="about">${A.icon('flower')}Over Luma${A.icon('back','row-arrow')}</button></div><p class="settings-footnote">${s.muted?'Het geluid is gedempt. Via de luidspreker op het startscherm zet je het weer aan. ':''}${storageOkay?'Je voortgang wordt op dit apparaat bewaard.':'Je browser blokkeert het bewaren van voortgang.'}</p>`);
  }
  function backup(){
    showDialog('Bewaar wat er groeit.',`<p class="zen-copy">Je lichtpuntjes staan alleen op dit apparaat. Met een reservekopie kun je ze bewaren of meenemen naar een ander apparaat.</p><div class="backup-actions"><button class="primary" data-act="export-save">${A.icon('download')}Reservekopie bewaren</button><label class="import-label">Reservekopie terugzetten<input type="file" id="save-import" accept="application/json,.json"></label></div><p class="settings-footnote">Terugzetten voegt gevonden lichtpuntjes samen. Je bestaande bloemen gaan niet verloren.</p>`);
    $('#save-import').addEventListener('change',async ev=>{
      const file=ev.target.files?.[0];if(!file)return;
      try{
        if(file.size>500000)throw Error();
        const raw=JSON.parse(await file.text());if(raw.version!==1||!raw.completed||typeof raw.completed!=='object'||Array.isArray(raw.completed))throw Error();
        for(const [id,v] of Object.entries(raw.completed))if(/^\d+$/.test(id)&&Number(id)<72&&v&&Number.isInteger(v.stars)&&v.stars>=1&&v.stars<=3){const old=state.completed[id];state.completed[id]={stars:Math.max(v.stars,old?.stars||0),moves:Math.max(0,Math.min(Number(v.moves)||0,old?.moves??Infinity))};}
        for(const [date,v] of Object.entries(raw.daily||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&v&&Number.isInteger(v.stars)&&v.stars>=1&&v.stars<=3){const old=state.daily[date];state.daily[date]={stars:Math.max(v.stars,old?.stars||0),moves:Math.max(0,Math.min(Number(v.moves)||0,old?.moves??Infinity))};}
        save();closeDialogs();if(game?.won)showWin();else if(!game)navigate('garden');toast('Je lichtpuntjes zijn veilig teruggezet.');
      }catch(_){toast('Dit is geen geldige Luma-reservekopie. Er is niets verwijderd.');}
    });
  }
  function exportSave(){
    persistGame();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Luma-lichtpuntjes-'+E.dateKey()+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Je reservekopie staat klaar.');
  }
  function help(){
    showDialog('Een kleine draai.',`<div class="help-step">${A.icon('touch')}<div><h3>Tik om te draaien.</h3><p>Elke tik draait een tegel een kwartslag rechtsom. Begin bij Luma en volg de paden.</p></div></div><div class="help-step">${A.icon('flower')}<div><h3>Breng alles tot leven.</h3><p>Verbind alle paden met Luma, zonder losse uiteinden. De bloemen gaan vanzelf bloeien.</p></div></div><div class="help-step">${A.icon('pin')}<div><h3>Sommige dingen blijven.</h3><p>Luma en tegels met een klein ruitje staan vast. In Zandbloei komen lichtpoorten: licht springt van de ene zeshoek naar de andere.</p></div></div><div class="help-step">${A.icon('sparkle')}<div><h3>Je eigen kleine uitdaging.</h3><p>Je krijgt 1 lichtje voor oplossen, 2 zonder hints, 3 zonder hints binnen de richtlijn. Die richtlijn is een haalbaar aantal draaien, niet altijd het minimum. Terugdraaien mag altijd.</p></div></div><div class="help-keyboard">Op een toetsenbord: pijltjes om een tegel te kiezen, Enter of spatie om te draaien. Z is terug, H is een hint, R is opnieuw. Esc opent de instellingen. Er is geen tijdslimiet.</div><button class="primary" style="width:100%;margin-top:22px" data-act="close">Laat het licht stromen${A.icon('arrow')}</button>`);
  }
  function about(){showDialog('Een klein lichtpuntje.',`<div style="width:100px;margin:auto">${A.flower(0)}</div><div class="about-copy"><p>Luma is een rustige, volledig speelbare HTML5-puzzelgame. Een reis van 72 puzzels, zes werelden, een dagelijkse puzzel en vrij spel.</p><p>Alle illustraties zijn vectorvormen. De originele muziek en geluiden worden ter plekke gemaakt met Web Audio. Geen advertenties, account, tracking of externe downloads.</p><p>Je voortgang staat alleen in deze browser. Verwijder je de browsergegevens, dan verdwijnt ook je tuin. Luma is een zelfstandig ontwerp, niet verbonden aan Apple en geen bekroond product.</p><p><strong>Versie 4.1.0</strong> / Een rustigere wereld</p><p>Een gedeelde vormentaal voor zeven plantvrienden. Eenvoudige botanische speelstukken, naadloze lichtpaden en heldere levelkaarten. Alle 72 puzzels en je bestaande voortgang blijven behouden.</p></div>`);}
  function showZen(){showDialog('Volg je gevoel.',`<p class="zen-copy">Een nieuwe puzzel, speciaal voor dit moment. Kies de ruimte die bij je past.</p><div class="zen-sizes" aria-label="Formaat van je puzzel">${[3,4,5,6].map(n=>`<button class="${n===selectedSize?'active':''}" data-act="size" data-size="${n}" aria-pressed="${n===selectedSize}">${n} x ${n}</button>`).join('')}</div><p class="zen-copy">Geen score om na te jagen. Gewoon spelen.</p><button class="primary" style="width:100%;margin-top:25px" data-act="start-zen">Maak een lichtpuntje${A.icon('arrow')}</button>`);}
  function showInstall(){
    if(pendingInstall){pendingInstall.prompt();pendingInstall.userChoice.finally(()=>{pendingInstall=null;});return;}
    showDialog('Altijd een lichtpuntje.',`<div class="about-copy"><p>${window.LUMA_STANDALONE||location.protocol==='file:'?'Dit is de losse HTML-versie. Voor installatie op je beginscherm gebruik je de webapp-map op een HTTPS-webadres.':'Open Luma in Safari op je iPhone of iPad. Tik op de deelknop en kies "Zet op beginscherm". Laat "Open als webapp" aan staan als die optie wordt getoond. Op Android vind je "App installeren" of "Toevoegen aan startscherm" in het browsermenu.'}</p><p>De webapp-versie heeft een eigen app-icoon en kan na het succesvol opslaan van alle spelbestanden ook zonder internet werken. Je voortgang blijft lokaal bewaard; er is geen synchronisatie tussen apparaten.</p></div>`);
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
    const w=E.WORLDS[world],colors=[w.color,w.petal,w.light,w.board],parts=Array.from({length:24},(_,i)=>({x:W/2,y:H*.46,vx:(Math.random()-.5)*9,vy:-4-Math.random()*8,r:3+Math.random()*4,a:Math.random()*6,color:colors[i%4]}));
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
      case 'hello':helloLuma();break;
      case 'meet':meetFriend(b.dataset.friend);break;
      case 'water':waterGarden();break;
      case 'grow-garden':{let id=Array.from({length:12},(_,i)=>gardenWorld*12+i).find(i=>!state.completed[i]);if(id===undefined){world=(gardenWorld+1)%6;navigate('worlds');}else startGame({id});break;}
      case 'backup':backup();break;
      case 'export-save':exportSave();break;
      case 'score-info':showDialog('Een beetje extra licht.',`<p class="zen-copy">Elke opgeloste puzzel telt. Zonder hulp verdien je twee lichtjes; met maximaal ${winData?.par||0} draaien zijn het er drie. Met een hint krijg je een lichtje. De bloem in je tuin groeit altijd.</p><button class="primary" data-act="back-win">Terug naar je bloemetje${A.icon('arrow')}</button>`);break;
      case 'garden-world':gardenWorld=Number(b.dataset.world);renderGarden();break;
      case 'home':navigate('home');break;
      case 'worlds':navigate('worlds');break;
      case 'garden':gardenWorld=game?.level.world??state.lastWorld;navigate('garden');break;
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
        const k=b.dataset.setting;if(!Object.hasOwn(state.settings,k))break;state.settings[k]=!state.settings[k];b.setAttribute('aria-checked',String(state.settings[k]));save();theme(game?game.level.world:page==='worlds'?world:page==='garden'?gardenWorld:0);await audio.unlock();audio.sync();break;
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
  if(!window.LUMA_STANDALONE&&'serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
      reg.update().catch(()=>{});
      const ready=()=>{if(reg.waiting)toast('Een nieuwe versie staat klaar. Heropen Luma wanneer je klaar bent.');};
      ready();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)ready();});});
    }).catch(()=>{});
  });
  // Resizing changes only CSS. A rotated iPad never regenerates the puzzle.
  let viewportFrame=0;
  function fitViewport(){
    cancelAnimationFrame(viewportFrame);
    viewportFrame=requestAnimationFrame(()=>{
      const viewport=window.visualViewport;
      if(viewport && Math.abs(viewport.scale-1)>.01)return;
      const height=Math.round(viewport?.height||window.innerHeight);
      document.documentElement.style.setProperty('--viewport-height',height+'px');
    });
  }
  window.addEventListener('resize',fitViewport,{passive:true});
  window.visualViewport?.addEventListener('resize',fitViewport,{passive:true});
  window.addEventListener('orientationchange',fitViewport,{passive:true});
  fitViewport();
  theme(0);
  const params=new URLSearchParams(location.search);
  try{
    if(params.has('daily')){E.daily(params.get('daily'));startGame({mode:'daily',date:params.get('daily')});}
    else if(params.has('level')&&/^\d+$/.test(params.get('level'))&&Number(params.get('level'))>=1&&Number(params.get('level'))<=72)startGame({id:Number(params.get('level'))-1});
    else if(location.hash==='#play'&&restoreGame()){}
    else navigate(['#worlds','#garden'].includes(location.hash)?location.hash.slice(1):'home',false);
  }catch(_){navigate('home',false);toast('Die puzzel kon niet worden geopend. Begin hier een nieuwe reis.');}
})();
