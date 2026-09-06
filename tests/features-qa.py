from pathlib import Path
from playwright.sync_api import sync_playwright
import json,base64,re
root=Path(__file__).resolve().parent.parent;out=Path(__file__).resolve().parent/'feature-output';out.mkdir(exist_ok=True)
checks=[];errors=[]
def doc(save=None):
 s=(root/'index.html').read_text();s=re.sub(r'<link[^>]*>','',s);s=re.sub(r'<script defer[^>]*></script>','',s)
 css=(root/'assets/app.css').read_text().replace('./paper.png?v=4.1.0','data:image/png;base64,'+base64.b64encode((root/'assets/paper.png').read_bytes()).decode())
 s=s.replace('</head>','<style>'+css+'</style></head>')
 save=save or {'version':1,'completed':{},'daily':{},'resume':None,'lastWorld':0,'settings':{'motion':True,'music':False,'sound':False,'muted':True,'contrast':False,'haptic':False}}
 adapter='window.LUMA_STANDALONE=true;const testStore='+json.dumps({'luma.save.v1':json.dumps(save)})+';Object.defineProperty(window,"localStorage",{value:{getItem:k=>testStore[k]||null,setItem:(k,v)=>testStore[k]=String(v),removeItem:k=>delete testStore[k]}});'
 return s.replace('</body>','<script>'+adapter+'</script><script>'+(root/'assets/worlds.js').read_text()+'</script><script>'+(root/'assets/app.js').read_text()+'</script></body>')
def act(p,a):p.evaluate('(a)=>{const b=[...document.querySelectorAll(`[data-act="${a}"]`)].find(b=>b.getClientRects().length);if(!b)throw Error(a);b.click()}',a)
def save(p):return p.evaluate('JSON.parse(localStorage.getItem("luma.save.v1"))')
def solve(p):
 p.evaluate('''()=>{const r=JSON.parse(localStorage.getItem('luma.save.v1')).resume,l=LumaEngine.generate(r.id);for(let i=0;i<l.solution.length;i++){if(l.locked.includes(i))continue;let n=LumaEngine.distanceToSolution(l.solution[i],r.turns[i]);for(let j=0;j<n;j++)document.querySelector(`.tile[data-index="${i}"]`).click();}}''')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 p=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=2);p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(doc());p.wait_for_timeout(120)
 p.screenshot(path=str(out/'iphone-home.png'),timeout=10000)
 act(p,'garden');assert p.locator('.garden-spot.unplanted').count()==12
 p.locator('.garden-spot[data-level="0"]').click();assert save(p)['resume']['id']==0
 solve(p);p.wait_for_timeout(430);act(p,'next');solve(p);p.wait_for_timeout(430);act(p,'next');solve(p);p.wait_for_timeout(430)
 assert 'Pippa' in p.locator('.win-copy').inner_text();checks.append('Third solved garden puzzle welcomes Pippa')
 act(p,'win-exit');act(p,'garden');assert p.locator('.garden-spot.grown').count()==3;assert p.locator('.friend-card.unlocked').count()==2;checks.append('Three solved levels create exactly three planted plots')
 before=save(p);act(p,'water');assert p.locator('.garden-canvas.is-watered').count()==1;assert save(p)==before;checks.append('Watering is cosmetic and never changes progress')
 p.wait_for_timeout(2500)
 for id in ['luma','pippa','nori','mosi','pico','nova','kiki']:
  p.locator(f'.friend-collection [data-friend="{id}"]').click();assert p.locator('.profile-portrait .friend-'+id).count()==1;act(p,'close')
 checks.append('All seven character sheets open and close correctly')
 p.evaluate('window.scrollTo(0,0)');p.screenshot(path=str(out/'iphone-garden.png'),timeout=10000)
 for width in [320,375,393,834,1194]:
  p.set_viewport_size({'width':width,'height':834 if width>900 else 1194 if width>600 else 852});p.wait_for_timeout(100)
  overlaps=p.evaluate('''()=>{const rr=[...document.querySelectorAll('.garden-spot')].map(b=>b.getBoundingClientRect());let o=[];for(let i=0;i<rr.length;i++)for(let j=i+1;j<rr.length;j++)if(Math.min(rr[i].right,rr[j].right)-Math.max(rr[i].left,rr[j].left)>.1&&Math.min(rr[i].bottom,rr[j].bottom)-Math.max(rr[i].top,rr[j].top)>.1)o.push([i,j]);return o;}''')
  assert not overlaps,(width,overlaps)
 checks.append('Garden hit areas do not overlap at five phone/iPad widths')
 act(p,'worlds');p.locator('[data-act=world][data-world="3"]').click();p.locator('[data-level="36"]').click()
 assert p.locator('.companion .botanical-pico').count()==1;assert p.locator('.source-marker .botanical-pico').count()==1;checks.append('Desert level uses Pico as source and companion')
 before=save(p)['resume'];p.set_viewport_size({'width':834,'height':1194});p.wait_for_timeout(120);assert save(p)['resume']==before
 p.screenshot(path=str(out/'ipad-portrait-play.png'),timeout=10000)
 p.set_viewport_size({'width':1194,'height':834});p.wait_for_timeout(120);assert save(p)['resume']==before;p.screenshot(path=str(out/'ipad-landscape-play.png'),timeout=10000)
 act(p,'game-back');p.locator('[data-act=world][data-world="4"]').click();assert p.locator('meta[name=theme-color]').get_attribute('content')==p.evaluate('LumaEngine.WORLDS[4].bg');checks.append('Safari theme-color follows selected world')
 p.screenshot(path=str(out/'ipad-night-world.png'),timeout=10000)
 # A local SVG scene snapshot, not an image mockup. All strokes and characters are live DOM.
 act(p,'garden');p.locator('[data-act=garden-world][data-world="0"]').click();p.screenshot(path=str(out/'ipad-garden.png'),timeout=10000)
 act(p,'home');p.screenshot(path=str(out/'ipad-home.png'),timeout=10000)
 checks.append('Orientation preserves turns and session')
 (out/'feature-results.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2));print(json.dumps({'checks':checks,'errors':errors},indent=2))
 assert not errors
 browser.close()
