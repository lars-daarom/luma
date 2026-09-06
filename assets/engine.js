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


if (typeof window !== "undefined") window.LumaAudio = LumaAudio;
