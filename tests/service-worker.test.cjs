/* Unit-level lifecycle/fetch test with Cache/Fetch API adapters.
   This is not a browser installation or real offline-navigation test. */
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const scope='https://luma.example/play/';
const handlers={}, stores=new Map();
const normalize=x=>new URL(typeof x==='string'?x:x.url,scope).href;
const caches={
  async open(name){
    if(!stores.has(name))stores.set(name,new Map());
    const map=stores.get(name);
    return {
      async addAll(paths){for(const path of paths)map.set(normalize(path),new Response('installed shell'));},
      async put(key,value){map.set(normalize(key),value.clone());},
      async match(key){return map.get(normalize(key))?.clone();}
    };
  },
  async keys(){return [...stores.keys()];},
  async delete(key){return stores.delete(key);},
  async match(key){for(const map of stores.values()){const r=map.get(normalize(key));if(r)return r.clone();}}
};
let offline=false, claimed=false;
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8'),{
  URL,Response,caches,
  fetch:async()=>{if(offline)throw new Error('offline');return new Response('fresh shell');},
  self:{registration:{scope},location:{origin:'https://luma.example'},clients:{claim:async()=>{claimed=true;}},skipWaiting:async()=>{},addEventListener:(type,fn)=>handlers[type]=fn}
});
async function run(type,request){const promises=[];let answer;handlers[type]({request,waitUntil:p=>promises.push(p),respondWith:p=>answer=p});const response=await answer;await Promise.all(promises);return response;}
(async()=>{
  await run('install');
  const key=[...stores.keys()][0];assert.equal(stores.get(key).size,8);
  stores.set('luma-old-'+scope,new Map());stores.set('luma-old-https://luma.example/other/',new Map());stores.set('other-app',new Map());
  await run('activate');assert.ok(claimed);assert.ok(!stores.has('luma-old-'+scope));assert.ok(stores.has('other-app'));assert.ok(stores.has('luma-old-https://luma.example/other/'));
  const request={url:scope+'index.html?level=5',method:'GET',mode:'navigate'};
  assert.equal(await(await run('fetch',request)).text(),'fresh shell');
  offline=true;
  assert.equal(await(await run('fetch',request)).text(),'fresh shell');
  assert.equal(await(await run('fetch',{url:scope+'icons/icon.svg',method:'GET',mode:'cors'})).text(),'installed shell');
  assert.equal(await run('fetch',{url:'https://elsewhere.example/',method:'GET',mode:'navigate'}),undefined);
  assert.equal(await run('fetch',{url:scope+'index.html',method:'POST',mode:'navigate'}),undefined);
  console.log('PASS: service-worker install, scope-safe cache cleanup, network refresh, offline fallback, asset cache, and ignored requests (API adapters).');
})().catch(e=>{console.error(e);process.exitCode=1;});
