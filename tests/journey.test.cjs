const {test}=require('node:test');
const assert=require('node:assert/strict');
const J=require('../assets/journey.js');
function done(...ids){return Object.fromEntries(ids.map(id=>[id,{stars:3,moves:1}]));}
function seq(n){return done(...Array.from({length:n},(_,i)=>i));}
test('fresh campaign exposes only level 1',()=>{
  assert.equal(J.frontier({}),0);assert(J.levelUnlocked(0,{}));assert(!J.levelUnlocked(1,{}));
});
test('normal progression exposes exactly the next unfinished level plus completed replays',()=>{
  const c=seq(3);assert.equal(J.contiguousFrontier(c),3);assert.equal(J.frontier(c),3);assert(J.levelUnlocked(0,c));assert(J.levelUnlocked(3,c));assert(!J.levelUnlocked(4,c));
});
test('legacy non-contiguous progress never sends an existing player backwards',()=>{
  const c=done(8);assert.equal(J.highestCompleted(c),8);assert.equal(J.frontier(c),9);assert(J.levelUnlocked(8,c));assert(J.levelUnlocked(9,c));assert(!J.levelUnlocked(10,c));
});
test('a valid legacy campaign resume is respected even when earlier gaps exist',()=>{
  const c=seq(20),resume={mode:'campaign',id:42};assert.equal(J.frontier(c,resume),42);assert(J.levelUnlocked(42,c,resume));assert(!J.levelUnlocked(43,c,resume));c[42]={stars:2,moves:7};assert.equal(J.frontier(c,resume),43);assert(J.levelUnlocked(43,c,resume));
});
test('world gates follow the furthest legitimate campaign point and old world progress',()=>{
  assert(J.worldUnlocked(0,{}));assert(!J.worldUnlocked(1,{}));const first=seq(12);assert(J.worldUnlocked(1,first));assert(!J.worldUnlocked(2,first));const legacy=done(28);assert(J.worldUnlocked(2,legacy));assert(!J.worldUnlocked(3,legacy));
});
test('progress, stars and level state use existing version-1 completion records',()=>{
  const c=done(0,1,12);c[1].stars=2;c[12].stars=1;assert.equal(J.progress(c,0),2);assert.equal(J.progress(c,1),1);assert.equal(J.starCount(c),6);assert.equal(J.levelState(0,c),'complete');assert.equal(J.levelState(13,c),'current');assert.equal(J.levelState(14,c),'locked');
});
