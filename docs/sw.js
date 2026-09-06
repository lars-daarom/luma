/* Offline shell. Cache is scoped to this installation, not other websites/apps. */
const CACHE='luma-v1.0.1-pages-'+self.registration.scope;
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable.png','./icons/apple-touch-icon.png','./icons/icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('luma-')&&k.endsWith(self.registration.scope)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
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
   event.respondWith(network.catch(()=>caches.match(shell)).then(response=>response||Response.error()));return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
