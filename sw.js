// The Wave Academy – service worker: fast loading
// App files: network first (3 s limit, then saved copy). Libraries & fonts: saved copy first (they never change).
const C='wave-v2',L='wave-libs-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==L).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const LIB=/^https:\/\/(www\.gstatic\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(LIB.test(r.url)){
    e.respondWith(caches.open(L).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone()).catch(()=>{});return res}))));
    return;
  }
  if(new URL(r.url).origin!==location.origin)return;
  e.respondWith(
    Promise.race([fetch(r),new Promise((_,no)=>setTimeout(no,3000))])
      .then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{});return res})
      .catch(()=>caches.match(r).then(x=>x||fetch(r)))
  );
});
