/* LUMA - deterministic, dependency-free puzzle engine. Directions: N E S W. */
(function (root) {
  'use strict';
  const DIRS = [{ bit: 1, opp: 4, dx: 0, dy: -1 }, { bit: 2, opp: 8, dx: 1, dy: 0 }, { bit: 4, opp: 1, dx: 0, dy: 1 }, { bit: 8, opp: 2, dx: -1, dy: 0 }];
  const WORLDS = [
    { name: 'Ochtendgloren', line: 'Alles begint met een kleine vonk.', label: 'HET BEGIN', color: '#CC4833', light: '#F6C9AE', board: '#E7DDD0', bg: '#F7F3EA', ink: '#302D3B', muted: '#756C7D', petal: '#C0B2DC', key: 60, bpm: 78 },
    { name: 'Zachte golven', line: 'Vind je eigen ritme.', label: 'VASTE PUNTEN', color: '#21746B', light: '#ABD1C4', board: '#CEDFDC', bg: '#F0F5EF', ink: '#203F43', muted: '#526C71', petal: '#A3C0E5', key: 62, bpm: 76 },
    { name: 'Bloementuin', line: 'Geef iets kleins de ruimte.', label: 'MEER VERTAKKINGEN', color: '#9A456C', light: '#E9BDCD', board: '#E9D6DE', bg: '#FAF1EE', ink: '#4A2D48', muted: '#7E5F72', petal: '#E7B85B', key: 65, bpm: 82 },
    { name: 'Avondrood', line: 'Soms ligt de weg ergens anders.', label: 'LICHTPOORTEN', color: '#AD4E2F', light: '#F1C38C', board: '#EAD8C4', bg: '#FBF0DF', ink: '#4B352D', muted: '#886757', petal: '#CC9CB8', key: 57, bpm: 74 },
    { name: 'Maanlicht', line: 'Ook omwegen kunnen mooi zijn.', label: 'CIRKELS', color: '#BDB0F2', light: '#DDD5FC', board: '#36364C', bg: '#232536', ink: '#F1ECDF', muted: '#AAA1BC', petal: '#D9AF79', key: 59, bpm: 70 },
    { name: 'Noorderlicht', line: 'Laat alle stukjes samenkomen.', label: 'HET GROTE GEHEEL', color: '#236F62', light: '#B5D8BB', board: '#D3E1D3', bg: '#F0F3E4', ink: '#2C4038', muted: '#617468', petal: '#BBA5DD', key: 64, bpm: 86 }
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

/* All illustration and interface marks are original SVG paths, not emoji fonts. */
const LumaArt = (() => {
  const paths = {
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back:'<path d="m14 6-6 6 6 6"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    sound:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="sound-wave" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    settings:'<path d="M4 7h7m5 0h4M4 17h3m5 0h8"/><circle cx="13" cy="7" r="3"/><circle cx="9" cy="17" r="3"/>',
    home:'<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
    worlds:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    garden:'<path d="M12 21v-8M12 19c-5 0-7-3-7-6 5 0 7 3 7 6Zm0-2c5 0 7-3 7-6-5 0-7 3-7 6Z"/><path d="M12 13c-8-2-7-8-4-8 0-5 8-5 8 0 3 0 4 6-4 8Z"/>',
    undo:'<path d="m8 4-5 5 5 5M3 9h10a6 6 0 0 1 0 12h-3"/>',
    restart:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    hint:'<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3.5h.01"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20 14.5A9 9 0 0 1 9.5 4 9 9 0 1 0 20 14.5Z"/>',
    sparkle:'<path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    share:'<path d="M12 15V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',
    infinity:'<path d="M12 12c-3-5-8-6-9-2-2 6 5 10 9 2 4-8 11-4 9 2-1 4-6 3-9-2Z"/>',
    leaf:'<path d="M5 20c0-9 7-14 15-16 1 12-5 19-13 13m-3 4 10-11"/>',
    portal:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><circle cx="12" cy="12" r="4"/>',
    flower:'<g fill="currentColor" stroke="none"><ellipse cx="12" cy="8.5" rx="3.25" ry="4.6" transform="rotate(0 12 12)"/><ellipse cx="12" cy="8.5" rx="3.25" ry="4.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="8.5" rx="3.25" ry="4.6" transform="rotate(120 12 12)"/><ellipse cx="12" cy="8.5" rx="3.25" ry="4.6" transform="rotate(180 12 12)"/><ellipse cx="12" cy="8.5" rx="3.25" ry="4.6" transform="rotate(240 12 12)"/><ellipse cx="12" cy="8.5" rx="3.25" ry="4.6" transform="rotate(300 12 12)"/></g><circle cx="12" cy="12" r="3" fill="var(--bg)" stroke="none"/>',
    touch:'<path d="M9 14V6a2 2 0 0 1 4 0v6c5-3 8-1 7 4l-1 5H9l-5-7a2 2 0 0 1 3-2l2 2Z"/>',
    pin:'<path d="m12 3 9 9-9 9-9-9Z"/>',
    volume:'<path d="M4 15V9m5 10V5m6 12V7m5 8V9"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
  };
  function icon(name, cls = '') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`; }

  function logo() {
    return `<svg class="logo" viewBox="0 0 244 64" aria-label="Luma" role="img"><g>${petalPaths(32,32,21,6,'currentColor')}<circle cx="32" cy="32" r="9" fill="var(--light)"/></g><g fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"><path d="M80 12v29q0 11 11 11M106 28v12q0 12 12 12t12-12V28M147 52V39q0-12 11-12t11 12v13m0-13q0-12 11-12t11 12v13"/><circle cx="215" cy="40" r="12"/><path d="M227 28v24"/></g></svg>`;
  }
  function petalPaths(cx=50,cy=50,r=23,count=6,color='currentColor') { return Array.from({length:count},(_,i)=>`<ellipse cx="${cx}" cy="${cy-r*.56}" rx="${r*.48}" ry="${r*.73}" transform="rotate(${i*360/count} ${cx} ${cy})" fill="${color}"/>`).join(''); }
  function flower(world=0, cls='', happy=true) { const w=LumaEngine.WORLDS[world]; return `<svg class="${cls}" viewBox="0 0 160 160" aria-hidden="true"><g transform="translate(30 30)">${petalPaths(50,50,35,6,w.color)}<circle cx="50" cy="50" r="24" fill="${w.light}"/>${happy ? '<g fill="'+w.ink+'"><ellipse cx="43" cy="48" rx="2" ry="3"/><ellipse cx="57" cy="48" rx="2" ry="3"/></g><path d="M46 57q4 4 8 0" fill="none" stroke="'+w.ink+'" stroke-width="2" stroke-linecap="round"/>' : ''}</g><path d="m127 20 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="${w.petal}"/><circle cx="25" cy="117" r="4" fill="${w.petal}"/><circle cx="129" cy="123" r="3" fill="${w.color}"/></svg>`; }
  function hero() { return `<svg viewBox="0 0 550 460" aria-hidden="true">
    <circle cx="302" cy="221" r="186" fill="#D5C9E5"/>
    <path d="M171 391V176a79 79 0 0 1 158 0v215" fill="#B29DCC"/>
    <path d="M209 391V181a41 41 0 0 1 82 0v210" fill="#E9DEED"/>
    <path d="M100 351v-50q0-54 54-54h22" fill="none" stroke="#4F796C" stroke-width="35" stroke-linecap="round"/>
    <path d="M102 351v-50q0-54 54-54h20" fill="none" stroke="#A9C0A7" stroke-width="2" stroke-linecap="round" class="flow-line"/>
    <path d="M287 267v67q0 46 46 46h62q34 0 34-34v-40" fill="none" stroke="#EF825F" stroke-width="31" stroke-linecap="round"/>
    <path d="M287 267v67q0 46 46 46h62q34 0 34-34v-40" fill="none" stroke="#FFE7BD" stroke-width="3" stroke-linecap="round" class="flow-line"/>
    <g class="flower-spin">${petalPaths(290,207,80,6,'#CC4833')}</g>
    <circle cx="290" cy="207" r="56" fill="#F6D991"/>
    <g class="face-eyes" fill="#4A3938"><ellipse cx="277" cy="203" rx="3.2" ry="5.3"/><ellipse cx="303" cy="203" rx="3.2" ry="5.3"/></g>
    <path d="M282 220q8 7 16 0" fill="none" stroke="#4A3938" stroke-width="2.8" stroke-linecap="round"/>
    <g class="orb-float"><circle cx="101" cy="350" r="46" fill="#F8F0DD"/><circle cx="101" cy="350" r="30" fill="none" stroke="#C7BAD9" stroke-width="2"/><circle cx="101" cy="350" r="20" fill="#9DBACA"/><path d="M94 350h14m-7-7v14" stroke="#F8F0DD" stroke-width="2" stroke-linecap="round"/></g>
    <g class="orb-float alt"><path d="M430 315c-36-4-51-24-43-49 24-1 44 18 43 49Z" fill="#4F796C"/><path d="M430 315c-5-39 11-61 34-57 8 25-9 49-34 57Z" fill="#8AA889"/><path d="m426 310-20-28m24 28 16-29" stroke="#E3E5CA" stroke-width="1.6" fill="none"/></g>
    <g transform="translate(431 91) rotate(13)"><circle r="38" fill="#F4E6C5"/><circle r="31" stroke="#C8B694" fill="none" stroke-width="1"/><path d="M-10 0h20M0-10v20" stroke="#A8815E" stroke-width="2" stroke-linecap="round"/><circle r="5" fill="#F4E6C5" stroke="#A8815E" stroke-width="1.5"/></g>
    <g class="sparkle" fill="#75628E"><path d="M108 112c0 15-6 21-21 21 15 0 21 6 21 21 0-15 6-21 21-21-15 0-21-6-21-21Z"/></g>
    <g class="sparkle alt" fill="#F8F0DD"><path d="M415 180c0 11-4 15-15 15 11 0 15 4 15 15 0-11 4-15 15-15-11 0-15-4-15-15Z"/></g>
    <circle cx="194" cy="66" r="6" fill="#ED7853"/><circle cx="475" cy="221" r="4" fill="#75628E"/><circle cx="202" cy="352" r="4" fill="#F6D991"/>
    <path d="M167 415q23-10 46 0t46 0t46 0t46 0" fill="none" stroke="#9C88B6" stroke-width="1.4"/>
    <path d="M170 424q23-10 46 0t46 0t46 0t46 0" fill="none" stroke="#9C88B6" stroke-width="1.4" opacity=".5"/>
  </svg>`; }
  function scene(world=0,cls='') {
    const w=LumaEngine.WORLDS[world];
    return `<svg class="${cls}" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="106" r="89" fill="${w.board}"/><path d="M56 184v-63a52 52 0 0 1 104 0v63" fill="${w.petal}"/><path d="M83 184v-62a25 25 0 0 1 50 0v62" fill="${w.bg}"/><path d="M46 169h27q38 0 38-38V88" fill="none" stroke="${w.color}" stroke-width="11" stroke-linecap="round"/>${petalPaths(111,80,31,6,w.color)}<circle cx="111" cy="80" r="18" fill="${w.light}"/><g fill="${w.ink}"><circle cx="106" cy="78" r="1.5"/><circle cx="116" cy="78" r="1.5"/></g><path d="M151 183c-2-29 14-43 32-42 0 23-14 37-32 42Z" fill="${w.color}"/><circle cx="48" cy="68" r="8" fill="${w.light}"/><path d="m175 63 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="${w.color}"/><path d="M36 195h150" stroke="${w.muted}" stroke-width="1"/></svg>`;
  }
  function worldMark(i) { const w=LumaEngine.WORLDS[i]; return `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28" fill="${w.board}"/>${i===0?`<circle cx="30" cy="30" r="13" fill="${w.color}"/><circle cx="30" cy="30" r="7" fill="${w.light}"/>`:i===1?`<path d="M12 24q9-9 18 0t18 0M12 34q9-9 18 0t18 0" stroke="${w.color}" stroke-width="6" fill="none" stroke-linecap="round"/>`:i===2?petalPaths(30,30,15,6,w.color)+`<circle cx="30" cy="30" r="6" fill="${w.light}"/>`:i===3?`<path d="m30 11 17 10v19L30 49 13 40V21Z" fill="${w.color}"/><circle cx="30" cy="30" r="9" fill="${w.light}"/>`:i===4?`<circle cx="30" cy="30" r="16" fill="none" stroke="${w.color}" stroke-width="8"/><circle cx="35" cy="17" r="5" fill="${w.light}"/>`:`<path d="M14 38 24 19l9 20 12-22" fill="none" stroke="${w.color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`}</svg>`; }
  function garden(world,completed) {
    const w=LumaEngine.WORLDS[world];
    let flowers='';
    const coords=[[52,120],[90,80],[139,103],[183,68],[221,123],[76,155],[119,151],[166,142],[199,163],[43,72],[142,50],[237,78]];
    coords.forEach(([x,y],j)=> { const done=Boolean(completed[world*12+j]); flowers+=`<path d="M${x} 192Q${x-15} ${y+40} ${x} ${y}" fill="none" stroke="${done?w.color:w.muted}" stroke-width="${done?2:1}" opacity="${done?.6:.18}"/>`; if(done) flowers+=`<g>${petalPaths(x,y,11+(j%3)*2,6,w.color)}<circle cx="${x}" cy="${y}" r="5" fill="${w.light}"/></g>`; else flowers+=`<circle cx="${x}" cy="${y}" r="4" fill="${w.muted}" opacity=".2"/>`; });
    return `<svg viewBox="0 0 280 215" aria-hidden="true"><circle cx="218" cy="43" r="20" fill="${w.light}"/><path d="M0 188q70-20 140 0t140 0v27H0Z" fill="${w.petal}" opacity=".45"/>${flowers}<path d="M72 190h140l-19 25H91Z" fill="${w.color}" opacity=".75"/></svg>`;
  }
  function lights(n,large=false) { return `<div class="light-dots${large?' large':''}" aria-label="${n} van 3 lichtjes">${[0,1,2].map(i=>icon('sparkle',i<n?'':'off')).join('')}</div>`; }
  return { icon, logo, flower, hero, scene, worldMark, garden, lights, petalPaths };
})();

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
    const blend=(a,b,t)=>'#'+[1,3,5].map(k=>Math.round(parseInt(a.slice(k,k+2),16)*(1-t)+parseInt(b.slice(k,k+2),16)*t).toString(16).padStart(2,'0')).join('');
    // iOS home-screen status text is white with black-translucent: use a dark,
    // world-specific band only behind that status area, never white-on-pastel.
    const status=blend(w.color,i===4?'#161824':w.ink,.72);
    for(const [key,val] of Object.entries({bg:w.bg,ink:w.ink,accent:w.color,light:w.light,board:w.board,muted:w.muted,petal:w.petal,chrome:w.board,'status-bg':status})) root.style.setProperty('--'+key,val);
    root.style.setProperty('--line',i===4?'rgba(241,236,223,.17)':'rgba(48,45,59,.12)');
    root.style.setProperty('--surface',i===4?'rgba(255,255,255,.07)':'rgba(255,255,255,.5)');
    root.style.colorScheme=i===4?'dark':'light';
    root.dataset.world=String(i);
    // Explicit backgrounds are important for modern Safari's edge sampling.
    root.style.backgroundColor=w.board;
    document.body.style.backgroundColor=w.board;
    $('meta[name="theme-color"]').content=w.board;
    audio.setTheme(i);
    document.body.classList.toggle('contrast',state.settings.contrast);
    document.body.classList.toggle('reduce-motion',state.settings.motion);
  }
  function soundButton(){return `<button class="icon-button sound-button ${!state.settings.muted?'sound-on':''}" data-act="mute" aria-label="${state.settings.muted?'Geluid inschakelen':'Geluid dempen'}" aria-pressed="${!state.settings.muted}">${A.icon(state.settings.muted?'mute':'sound')}</button>`;}

  function header(active='home') {
    return `<header class="app-header"><div class="header-inner"><button class="logo-button" data-act="home" aria-label="Luma, naar start">${A.logo()}</button><nav class="desktop-nav" aria-label="Hoofdnavigatie">${[['home','Ontdek'],['worlds','Werelden'],['garden','Mijn tuin']].map(([p,t])=>`<button data-act="${p}" class="${active===p?'active':''}" ${active===p?'aria-current="page"':''}>${t}</button>`).join('')}</nav><div class="top-actions">${soundButton()}<button class="icon-button" data-act="settings" aria-label="Instellingen">${A.icon('settings')}</button></div></div></header>`;
  }
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
    app.innerHTML=`${header('home')}<div class="shell home-shell view-enter"><section class="hero" aria-labelledby="home-title"><div class="hero-copy"><div class="eyebrow"><span class="tiny-dot"></span> EEN MOMENT VOOR JEZELF</div><h1 id="home-title">Kleine draai.<br><span>Groot gevoel.</span></h1><p>Verbind het licht.<br>Laat je hoofd even los.</p></div><div class="hero-art">${A.hero()}</div><div class="hero-action"><button class="primary hero-cta" data-act="continue">${startLabel}${A.icon('arrow')}</button><div class="under-cta"><span>${A.icon('worlds')}72 puzzels</span><span>${A.icon('sun')}6 werelden</span><span>${A.icon('infinity')}Jouw tempo</span></div></div></section><section class="home-secondary" aria-label="Meer manieren om te spelen"><button class="feature-card daily" data-act="daily"><span class="card-icon">${A.icon(dailyDone?'check':'sun')}</span><span><span class="eyebrow">DAGPUZZEL</span><h2>${dailyDone?'Mooi gedaan.':'Even helemaal hier.'}</h2><p>${dailyDone?'Nog een keer spelen':dateLabel+' / een nieuw lichtpuntje'}</p></span>${A.icon('arrow','card-arrow')}</button><button class="feature-card zen" data-act="zen"><span class="card-icon">${A.icon('infinity')}</span><span><span class="eyebrow">VRIJ SPELEN</span><h2>Volg je gevoel.</h2><p>Een nieuwe puzzel. Jouw tempo.</p></span>${A.icon('arrow','card-arrow')}</button></section><footer class="quiet-footer"><span>Geen haast. Geen advertenties. Alleen jij.</span><span>${completedCount()?completedCount()+' van 72 lichtpuntjes verzameld':'Een kleine puzzel met een warm hart.'}</span></footer></div>${bottomNav('home')}`;
  }
  function renderWorlds(){
    theme(world);state.lastWorld=world;save();const w=E.WORLDS[world], n=Object.keys(state.completed).filter(i=>Math.floor(Number(i)/12)===world).length;
    app.innerHTML=`${header('worlds')}<div class="shell view-enter"><section class="section-heading"><div><div class="eyebrow">ZES WERELDEN. EEN KLEINE REIS.</div><h1>Volg het licht.</h1></div><p>Begin bij het begin. Of ergens anders.<br>Deze reis is van jou.</p></section><nav class="world-tabs" aria-label="Kies een wereld">${E.WORLDS.map((w,i)=>`<button class="world-tab ${world===i?'active':''}" data-act="world" data-world="${i}" aria-pressed="${world===i}">${A.worldMark(i)}<span>${w.name}</span></button>`).join('')}</nav><section class="world-panel"><div class="world-panel-copy"><div class="eyebrow">WERELD ${String(world+1).padStart(2,'0')} / ${w.label}</div><h2>${w.name}</h2><p>${w.line}<br>${n} van 12 lichtpuntjes gevonden.</p>${A.scene(world,'world-scene')}</div><div class="level-grid" aria-label="Levels in ${w.name}">${Array.from({length:12},(_,j)=>{const id=world*12+j,done=state.completed[id],current=id===nextLevel();return `<button class="level-button ${current?'recommended':''}" data-act="level" data-level="${id}" aria-label="Level ${id+1}${done?', voltooid met '+done.stars+' lichtjes':''}${current?', aanbevolen':''}">${current?'<span class="level-current-dot"></span>':''}<strong>${String(id+1).padStart(2,'0')}</strong>${A.lights(done?.stars||0)}</button>`;}).join('')}</div></section><p class="world-note">${A.icon('infinity')}Alle levels zijn vrij te spelen. De eerste drie laten je rustig kennismaken.</p></div>${bottomNav('worlds')}`;
    requestAnimationFrame(()=>{const tabs=$('.world-tabs'),active=$('.world-tab.active');if(tabs&&active)tabs.scrollLeft=Math.max(0,tabs.scrollLeft+active.getBoundingClientRect().left-tabs.getBoundingClientRect().left-tabs.clientWidth/2+active.clientWidth/2);});
  }
  function renderGarden(){
    theme(0); const count=completedCount();
    app.innerHTML=`${header('garden')}<div class="shell view-enter"><section class="section-heading"><div><div class="eyebrow">KLEINE MOMENTEN, SAMEN IETS MOOIS</div><h1>Jouw lichttuin.</h1></div><p>Elke opgeloste puzzel laat iets groeien.<br>Helemaal op jouw tempo.</p></section><div class="garden-summary"><div class="garden-stat"><strong>${count}<span style="font-size:14px;opacity:.5"> / 72</span></strong><small>Lichtpuntjes gevonden</small></div><div class="garden-stat"><strong>${lightCount()}</strong><small>Lichtjes verzameld</small></div><div class="garden-stat"><strong>${Object.keys(state.daily).length}</strong><small>Dagpuzzels opgelost</small></div></div><section class="garden-cards" aria-label="Je verzamelde bloemen per wereld">${E.WORLDS.map((w,i)=>{const n=Object.keys(state.completed).filter(k=>Math.floor(Number(k)/12)===i).length;return `<button class="garden-card" data-act="world" data-world="${i}" aria-label="${w.name}, ${n} van 12 bloemen, bekijk levels"><div class="garden-art" style="--card-bg:${w.board}">${A.garden(i,state.completed)}</div><div class="garden-info"><h2>${w.name}</h2><span>${n} / 12 bloemen</span></div></button>`;}).join('')}</section><p class="garden-empty">${count===0?'De eerste bloem begint met een kleine draai.':count===72?'Een tuin vol licht. Alle 72 puzzels zijn voltooid.':'Niets moet af. Ook een kleine tuin is een mooie tuin.'}</p></div>${bottomNav('garden')}`;
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
  function levelTitle(){if(game.mode==='daily')return 'Je dagelijkse lichtpuntje';if(game.mode==='zen')return 'Helemaal jouw tempo';return ['De eerste vonk','Om het hoekje','Volg je gevoel'][game.level.id]||E.WORLDS[world].name;}

  function renderGame(){
    const g=game,l=g.level,w=E.WORLDS[world],isIntro=g.mode==='campaign'&&l.id<3;
    const title=levelTitle(),badge=g.mode==='daily'?'DAGPUZZEL':g.mode==='zen'?'VRIJ SPELEN':'WERELD '+String(world+1).padStart(2,'0');
    const subtitle=g.mode==='campaign'?w.name+' / '+String(l.id+1).padStart(2,'0'):g.mode==='daily'?g.date:l.n+' x '+l.n+' / '+w.name;
    app.innerHTML=`<header class="app-header game-topbar"><div class="header-inner"><button class="icon-button" data-act="game-back" aria-label="Terug naar ${g.mode==='campaign'?'de werelden':'start'}">${A.icon('back')}</button><div class="game-top-title"><div class="eyebrow">${badge}</div><strong>${subtitle}</strong></div><div class="top-actions">${soundButton()}<button class="icon-button" data-act="settings" aria-label="Instellingen">${A.icon('settings')}</button></div></div></header><section class="game-layout view-enter" style="--n:${l.n}"><div class="game-heading"><div class="eyebrow">${g.mode==='daily'?'EEN MOMENT VOOR VANDAAG':w.label}</div><h1>${title}</h1><p>${isIntro?'Een kleine draai is alles wat je nodig hebt.':w.line}</p><div class="world-progress" aria-label="Je voortgang in deze wereld">${Array.from({length:12},(_,j)=>`<span class="${state.completed[world*12+j]?'done':''} ${l.id===world*12+j?'current':''}" aria-hidden="true"></span>`).join('')}</div></div><div class="game-center"><div class="game-status"><div class="moves-stat"><span class="count" id="move-count">${String(g.moves).padStart(2,'0')}</span><span class="caption">draaien</span></div><div class="bloom-status">${A.icon('flower')}<span id="bloom-count"></span></div></div><div class="board-wrap"><div class="board" id="board" style="--n:${l.n}" role="group" aria-label="Puzzel van ${l.n} bij ${l.n}. Draai de tegels om alle lichtpaden te verbinden."></div></div><div class="board-caption" id="board-caption"></div></div><aside class="game-controls" aria-label="Spelbediening"><p class="game-instruction" id="instruction"></p><div class="game-tools"><button class="tool" data-act="undo" id="undo-button" aria-label="Laatste draai ongedaan maken">${A.icon('undo')}Terug</button><button class="tool" data-act="restart" aria-label="Deze puzzel opnieuw beginnen">${A.icon('restart')}Opnieuw</button><button class="tool hint-tool" data-act="hint">${A.icon('hint')}Hint</button></div><div class="game-world-art">${A.scene(world,'mini-scene')}</div><button class="game-help" data-act="help">${A.icon('help')}Hoe speel je Luma?</button></aside></section>`;
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
    if(l.flowers.includes(i))return `<svg class="marker" viewBox="0 0 100 100" aria-hidden="true"><g class="bud-petals">${A.petalPaths(50,50,22,6,'inherit')}</g><circle class="bud-center" cx="50" cy="50" r="9"/></svg>`;
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
    $('#board-caption').innerHTML=g.mode==='zen'?`${A.icon('infinity')}Geen doel voor je draaien. Alleen jouw ritme.`:`${A.icon('sparkle')}3 lichtjes: ${l.par} draaien, zonder hint`;
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
  function about(){showDialog('Een klein lichtpuntje.',`<div style="width:100px;margin:auto">${A.flower(0)}</div><div class="about-copy"><p>Luma is een rustige, volledig speelbare HTML5-puzzelgame. Een reis van 72 puzzels, zes werelden, een dagelijkse puzzel en vrij spel.</p><p>Alle illustraties zijn vectorvormen. De originele muziek en geluiden worden ter plekke gemaakt met Web Audio. Geen advertenties, account, tracking of externe downloads.</p><p>Je voortgang staat alleen in deze browser. Verwijder je de browsergegevens, dan verdwijnt ook je tuin. Luma is een zelfstandig ontwerp, niet verbonden aan Apple en geen bekroond product.</p><p>Versie 2.0.0 / iPhone &amp; iPad</p></div>`);}
  function showZen(){showDialog('Volg je gevoel.',`<p class="zen-copy">Een nieuwe puzzel, speciaal voor dit moment. Kies de ruimte die bij je past.</p><div class="zen-sizes" aria-label="Formaat van je puzzel">${[3,4,5,6].map(n=>`<button class="${n===selectedSize?'active':''}" data-act="size" data-size="${n}" aria-pressed="${n===selectedSize}">${n} x ${n}</button>`).join('')}</div><p class="zen-copy">Geen score om na te jagen. Gewoon spelen.</p><button class="primary" style="width:100%;margin-top:25px" data-act="start-zen">Maak een lichtpuntje${A.icon('arrow')}</button>`);}
  function showInstall(){
    if(pendingInstall){pendingInstall.prompt();pendingInstall.userChoice.finally(()=>{pendingInstall=null;});return;}
    showDialog('Altijd een lichtpuntje.',`<div class="about-copy"><p>${window.LUMA_STANDALONE||location.protocol==='file:'?'Dit is de losse HTML-versie. Voor installatie op je beginscherm gebruik je de webapp-map op een HTTPS-webadres.':'Open Luma in Safari op je iPhone of iPad. Tik op de deelknop en kies "Zet op beginscherm". Laat "Open als webapp" aan staan als die optie wordt getoond. Op Android vind je "App installeren" of "Toevoegen aan startscherm" in het browsermenu.'}</p><p>De webapp-versie heeft een eigen app-icoon en werkt na de eerste volledige laadbeurt ook zonder internet. Je voortgang blijft lokaal bewaard; er is geen synchronisatie tussen apparaten.</p></div>`);
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
  if(!window.LUMA_STANDALONE&&'serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});});
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
