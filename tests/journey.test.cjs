const {test}=require('node:test');
const assert=require('node:assert/strict');
const J=require('../assets/journey.js');
function done(...ids){return Object.fromEntries(ids.map(id=>[id,{stars:3,moves:1}]));}
test('campaign unlocks exactly the first unfinished level, plus completed replays',()=>{
  assert.equal(J.frontier({}),0);
  assert(J.levelUnlocked(0,{}));assert(!J.levelUnlocked(1,{}));
  const c=done(0,1,2);assert.equal(J.frontier(c),3);assert(J.levelUnlocked(0,c));assert(J.levelUnlocked(3,c));assert(!J.levelUnlocked(4,c));
  c[8]={stars:2,moves:7};assert(J.levelUnlocked(8,c),'legacy completed levels remain replayable');assert.equal(J.frontier(c),3);
});
test('new worlds open only when progression reaches them or old progress exists there',()=>{
  assert(J.worldUnlocked(0,{}));assert(!J.worldUnlocked(1,{}));
  const firstWorld=done(...Array.from({length:12},(_,i)=>i));assert(J.worldUnlocked(1,firstWorld));assert(!J.worldUnlocked(2,firstWorld));
  const legacy=done(28);assert(J.worldUnlocked(2,legacy));
});
test('world map route contains eleven segments and completed segments light up',()=>{
  const s=J.mapSegments(done(0,1,2),0);assert.equal((s.match(/journey-route-segment/g)||[]).length,11);assert.equal((s.match(/ open/g)||[]).length,3);assert((s.match(/ locked/g)||[]).length>=8);
});
test('locked campaign deep links are removed before the game boot script reads them',()=>{
  let replaced='';const fake={location:{href:'https://example.test/luma/?level=7#worlds'},history:{replaceState(_a,_b,url){replaced=url;}}};
  assert(J.cleanLockedDeepLink(fake,done(0,1)));assert.equal(replaced,'/luma/#worlds');
  replaced='';fake.location.href='https://example.test/luma/?level=3';assert(!J.cleanLockedDeepLink(fake,done(0,1)));assert.equal(replaced,'');
});
test('progress and star totals use the existing version-1 completion bucket',()=>{
  const c=done(0,1,12);c[1].stars=2;c[12].stars=1;assert.equal(J.progress(c,0),2);assert.equal(J.progress(c,1),1);assert.equal(J.starCount(c),6);
});
