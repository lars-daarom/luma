"""Production UI exercised with inline assets and a TEST-ONLY storage adapter.
URL navigation is restricted in this runner; this is not an offline/PWA test.
"""
import re,json,base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent; OUT=Path(__file__).resolve().parent/'visual-output'
def document(save=None):
 html=(ROOT/'index.html').read_text()
 html=re.sub(r'<link[^>]*>','',html); html=re.sub(r'<script defer[^>]*></script>','',html)
 css=(ROOT/'assets/app.css').read_text().replace('./paper.png?v=4.1.0','data:image/png;base64,'+base64.b64encode((ROOT/'assets/paper.png').read_bytes()).decode())
 html=html.replace('</head>','<style>'+css+'</style></head>')
 default={'version':1,'completed':{},'daily':{},'resume':None,'lastWorld':0,'settings':{'motion':True,'music':False,'sound':False,'muted':True,'contrast':False,'haptic':False}}
 adapter='window.LUMA_STANDALONE=true;const testStore='+json.dumps({'luma.save.v1':json.dumps(save or default)})+';Object.defineProperty(window,"localStorage",{value:{getItem:k=>testStore[k]||null,setItem:(k,v)=>testStore[k]=String(v),removeItem:k=>delete testStore[k],clear:()=>Object.keys(testStore).forEach(k=>delete testStore[k])}});'
 return html.replace('</body>','<script>'+adapter+'</script><script>'+(ROOT/'assets/worlds.js').read_text()+'</script><script>'+(ROOT/'assets/app.js').read_text()+'</script></body>')
def click(page,selector):
 page.locator(selector).filter(visible=True).first.click(timeout=5000)
def act(page,name):
 page.evaluate('(a)=>{const b=[...document.querySelectorAll(`[data-act="${a}"]`)].find(b=>b.getClientRects().length); if(!b)throw Error("Missing "+a);b.click();}',name)
def level(page,id):
 if page.locator('.game-topbar').count():act(page,'game-back')
 if not page.locator('.world-tabs').count():act(page,'worlds')
 page.locator(f'[data-act="world"][data-world="{id//12}"]').click()
 page.locator(f'[data-act="level"][data-level="{id}"]').click()
def saved(page):return page.evaluate('JSON.parse(localStorage.getItem("luma.save.v1"))')
def geometry(page,label):
 page.wait_for_timeout(65)
 return page.evaluate('''label=>{let root=document.documentElement;let board=document.querySelector('.board');let issues=[];for(const el of document.querySelectorAll('button')){const r=el.getBoundingClientRect();if(!r.width||!r.height||el.closest('dialog:not([open])'))continue;if(r.width<43.9||r.height<43.9)issues.push({text:el.getAttribute('aria-label')||el.textContent.trim(),w:r.width,h:r.height});}return {label,width:innerWidth,height:innerHeight,scrollWidth:root.scrollWidth,scrollHeight:root.scrollHeight,board:board?board.getBoundingClientRect().toJSON():null,smallTargets:issues};}''',label)
def solve(page):
 return page.evaluate('''()=>{const r=JSON.parse(localStorage.getItem('luma.save.v1')).resume;const E=LumaEngine;const l=r.mode==='daily'?E.daily(r.date):r.mode==='zen'?E.generate(r.id,{seed:r.seed,n:r.n,world:r.world}):E.generate(r.id);let taps=0;for(let i=0;i<l.solution.length;i++){if(l.locked.includes(i))continue;const n=E.distanceToSolution(l.solution[i],r.turns[i]);for(let j=0;j<n;j++){document.querySelector(`.tile[data-index="${i}"]`)?.click();taps++;}}return {id:r.id,taps,won:document.querySelector('.board').classList.contains('won')};}''')
