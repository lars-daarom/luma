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
