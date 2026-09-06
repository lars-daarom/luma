const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const W=require('../assets/worlds.js');
test('Seven original species, six different hosts, seven portraits',()=>{
 assert.equal(W.friends.length,7);assert.equal(new Set(W.friends.map(x=>x.id)).size,7);
 assert.equal(new Set(W.themes.map(x=>x.host)).size,6);
 for(const f of W.friends){const art=W.portrait(f.id);assert(art.includes('friend-'+f.id));assert(!art.includes('<image'));}
});
test('Every environment has an opaque full-size base and unique gradient ids',()=>{
 let ids=new Set();
 for(let i=0;i<6;i++)for(const m of ['home','world','garden','celebrate']){
  const art=W.scenery(i,m,{});
  assert(art.includes('class="scene-sky" width="960" height="1200"'));
  assert(!art.includes('mask='));
  for(const id of art.matchAll(/id="([^"]+)"/g)){assert(!ids.has(id[1]));ids.add(id[1]);}
 }
});
test('Collection follows existing completed level IDs without a new save format',()=>{
 assert.equal(W.collection({}).filter(x=>x.unlocked).length,1);
 const c={'0':{stars:1},'1':{stars:2},'2':{stars:3}};
 assert(W.collection(c).find(x=>x.id==='pippa').unlocked);
 assert(!W.collection(c).find(x=>x.id==='nori').unlocked);
 c['12']={stars:1};c['13']={stars:1};c['14']={stars:1};assert(W.collection(c).find(x=>x.id==='nori').unlocked);
 const full=Object.fromEntries(Array.from({length:72},(_,i)=>[i,{stars:1}]));assert.equal(W.collection(full).filter(x=>x.unlocked).length,7);
});
test('SVG artwork and runtime contain no Unicode emoji',()=>{
 const root=path.join(__dirname,'../assets');for(const f of ['app.js','worlds.js','app.css'])assert(!/[\p{Extended_Pictographic}\uFE0F\u20E3]/u.test(fs.readFileSync(path.join(root,f),'utf8')));
});
