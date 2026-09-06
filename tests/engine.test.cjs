const assert = require('node:assert/strict');
const E = require('../src/engine.js');
let tested=0;
function validate(l) {
 assert.ok(E.evaluate(l,Array(l.n*l.n).fill(0)).won,'known solution must win');
 assert.ok(!E.evaluate(l,l.initial).won,'starting board must be unsolved');
 assert.ok(l.par>0);
 assert.ok(l.flowers.length>0,'at least one bloom');
 assert.ok(l.locked.every(i=>l.initial[i]===0),'fixed pieces are correct');
 const turns=l.initial.slice();let moves=0;
 l.solution.forEach((m,i)=>{const k=E.distanceToSolution(m,turns[i]);moves+=k;turns[i]+=k;});
 assert.equal(moves,l.par);assert.ok(E.evaluate(l,turns).won);
 assert.equal(new Set(l.portals).size,l.portals.length);assert.ok(l.portals.length===0||l.portals.length===2);
 tested++;
}
for(let id=0;id<72;id++){const l=E.generate(id);validate(l);assert.deepEqual(l,E.generate(id));}
for(let d=1;d<=365;d++){const date=new Date(2026,0,d);validate(E.daily(E.dateKey(date)));}
for(let w=0;w<6;w++)for(let n=3;n<=6;n++)for(let s=1;s<=30;s++)validate(E.generate(w*12+5,{seed:9341*s,world:w,n}));
assert.equal(E.rotate(1),2);assert.equal(E.rotate(8),1);assert.equal(E.rotate(5),10);
assert.equal(E.grade(10,0,10),3);assert.equal(E.grade(11,0,10),2);assert.equal(E.grade(1,1,10),1);
assert.throws(()=>E.generate(-1));assert.throws(()=>E.daily('2026-02-31'));
console.log(`PASS: ${tested} campaign, daily, and free-play puzzles; determinism, connectivity, solvability, scoring, and input validation.`);
