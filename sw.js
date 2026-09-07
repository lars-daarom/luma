/* Luma 5.1.0: versioned, scope-local offline shell. No saved-game deletion. */
const VERSION='5.1.0',CACHE='luma-v'+VERSION+'-pages-'+self.registration.scope;
const FILES=['./index.html','./manifest.webmanifest?v=5.1.0','./assets/studio.css?v=5.1.0','./assets/atlas.css?v=5.1.0','./assets/engine.js?v=5.1.0','./assets/studio-art.js?v=5.1.0','./assets/atlas-art.js?v=5.1.0','./assets/studio.js?v=5.1.0','./icons/studio.svg?v=5.1.0','./icons/studio-180.png?v=5.1.0','./icons/studio-192.png?v=5.1.0','./icons/studio-512.png?v=5.1.0'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('luma-')&&k.endsWith(self.registration.scope)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;
 if(u.searchParams.has('luma-check')||['controle.html','release.json'].includes(u.pathname.split('/').pop()))return;
 if(e.request.mode==='navigate'){
  const shell=new URL('./index.html',self.registration.scope).href;
  e.respondWith(fetch(e.request).then(async r=>{
   if(r.ok){const html=await r.clone().text();if(html.includes('name="app-version" content="'+VERSION+'"')){const c=await caches.open(CACHE);await c.put(shell,r.clone());}return r;}
   return (await (await caches.open(CACHE)).match(shell))||r;
  }).catch(async()=> (await (await caches.open(CACHE)).match(shell))||Response.error()));return;
 }
 e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(r=>r||fetch(e.request)));
});
