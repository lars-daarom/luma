/* Luma 2.0.0. Static Pages deployment, scoped offline cache, no build tooling. */
const VERSION='2.0.0';
const CACHE='luma-v'+VERSION+'-pages-'+self.registration.scope;
const FILES=[
 './','./index.html','./manifest.webmanifest',
 './assets/app.css?v=2.0.0','./assets/app.js?v=2.0.0','./assets/paper.png?v=2.0.0',
 './icons/icon.svg?v=2.0.0','./icons/icon-192.png?v=2.0.0','./icons/icon-512.png?v=2.0.0',
 './icons/icon-maskable.png?v=2.0.0','./icons/apple-touch-icon.png?v=2.0.0'
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
 if(event.request.mode==='navigate'){
  const shell=new URL('./index.html',self.registration.scope).href;
  const network=fetch(event.request);
  event.waitUntil(network.then(response=>{
   if(!response.ok)return;
   const copy=response.clone();
   return caches.open(CACHE).then(cache=>cache.put(shell,copy));
  }).catch(()=>{}));
  event.respondWith(network.then(response=>response.ok?response:caches.match(shell).then(cached=>cached||response)).catch(()=>caches.match(shell)).then(response=>response||Response.error()));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
