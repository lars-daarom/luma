/* Luma 4.1.0: scoped, versioned offline app shell. Never touches saved progress. */
const VERSION='4.1.0';
const CACHE='luma-v'+VERSION+'-pages-'+self.registration.scope;
const FILES=[
 './','./index.html','./manifest.webmanifest',
 './assets/app.css?v=4.1.0','./assets/worlds.js?v=4.1.0','./assets/app.js?v=4.1.0','./assets/paper.png?v=4.1.0',
 './icons/icon.svg?v=4.1.0','./icons/icon-192.png?v=4.1.0','./icons/icon-512.png?v=4.1.0',
 './icons/icon-maskable.png?v=4.1.0','./icons/apple-touch-icon.png?v=4.1.0'
];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('luma-')&&key.endsWith(self.registration.scope)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 // Diagnostics must see the actual network, never an old offline shell.
 if(url.searchParams.has('luma-check')||['controle.html','release.json'].includes(url.pathname.split('/').pop()))return;
 if(event.request.mode==='navigate'){
  const shell=new URL('./index.html',self.registration.scope).href;
  const network=fetch(event.request);
  event.waitUntil(network.then(async response=>{
   if(!response.ok)return;
   const body=await response.clone().text();
   // Do not poison the v4 offline shell with the HTML of an incomplete future release.
   if(body.includes('name="app-version" content="'+VERSION+'"')){
    const cache=await caches.open(CACHE);await cache.put(shell,response.clone());
   }
  }).catch(()=>{}));
  event.respondWith(network.then(async response=>response.ok?response:(await (await caches.open(CACHE)).match(shell))||response).catch(async()=> (await (await caches.open(CACHE)).match(shell))||Response.error()));
  return;
 }
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(cached=>cached||fetch(event.request)));
});
