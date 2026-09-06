"""Production UI exercised with inline assets and a TEST-ONLY storage adapter.
URL navigation is restricted in this runner; this is not an offline/PWA test.
"""
import re,json,base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent; OUT=Path(__file__).resolve().parent/'browser-output'; OUT.mkdir(exist_ok=True)
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
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=2)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def fresh(old,w,h,save=None):
  old.close();new=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=2);new.on('pageerror',lambda e:errors.append(str(e)));new.set_content(document(save),wait_until='load');return new
 page.set_content(document(),wait_until='load');page.wait_for_timeout(150)
 # Real pointer interactions: greeting, tutorial, celebration, score close, next.
 click(page,'[data-act="hello"]');assert page.locator('.whisper-show').count()==1
 page.wait_for_timeout(2300);page.screenshot(path=str(OUT/'iphone-home.png'))
 click(page,'[data-act="continue"]');click(page,'.tile[data-index="4"]');page.wait_for_timeout(400)
 assert page.locator('#win-dialog[open]').count()==1
 page.screenshot(path=str(OUT/'iphone-win.png'))
 click(page,'[data-act="score-info"]');page.keyboard.press('Escape');assert page.locator('#win-dialog[open]').count()==1
 click(page,'[data-act="next"]');assert saved(page)['resume']['id']==1
 click(page,'.tile[data-index="3"]');assert saved(page)['resume']['moves']==1
 click(page,'[data-act="undo"]');assert saved(page)['resume']['moves']==0
 click(page,'[data-act="hint"]');assert page.locator('.tile.hint').count()==1
 click(page,'.tile[data-index="3"]');click(page,'[data-act="restart"]');assert page.locator('#sheet[open]').count()==1
 click(page,'[data-act="close"]');assert saved(page)['resume']['moves']==1
 click(page,'[data-act="restart"]');click(page,'[data-act="confirm-restart"]');assert saved(page)['resume']['moves']==0
 # Orientation is layout only: save/board content unchanged.
 before=saved(page)['resume'];page.set_viewport_size({'width':1194,'height':834});page.wait_for_timeout(100)
 assert saved(page)['resume']==before
 # All campaign levels solved via actual DOM controls, engine unchanged.
 campaign=[]
 for id in range(72):
  if page.locator('dialog[open]').count():act(page,'win-exit')
  level(page,id);result=solve(page);assert result['won'],result;campaign.append(result)
  act(page,'game-back')
 assert len(saved(page)['completed'])==72
 complete=saved(page)
 # Daily / free play are also solvable through production tile buttons.
 act(page,'home');act(page,'daily');assert solve(page)['won'];page.wait_for_timeout(400);act(page,'win-exit')
 act(page,'zen');page.locator('[data-size="6"]').click();act(page,'start-zen');assert saved(page)['resume']['n']==6
 assert solve(page)['won'];page.wait_for_timeout(400);act(page,'win-exit')
 # Export download then merge import; invalid import does not delete progress.
 act(page,'settings');act(page,'backup')
 with page.expect_download() as ev:act(page,'export-save')
 dl=ev.value;dl.save_as(str(OUT/'backup-test.json'));assert len(json.loads((OUT/'backup-test.json').read_text())['completed'])==72
 page.locator('#save-import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{bad'})
 page.wait_for_timeout(100);assert len(saved(page)['completed'])==72
 page.locator('#save-import').set_input_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps({'version':1,'completed':{'0':{'stars':1,'moves':200}}}).encode()})
 page.wait_for_timeout(150);assert len(saved(page)['completed'])==72 and saved(page)['completed']['0']['stars']==3
 # Save compatibility across reload to fresh production code (test storage adapter).
 persisted=saved(page);page=fresh(page,1194,834,persisted);assert len(saved(page)['completed'])==72
 (OUT/'campaign-results.json').write_text(json.dumps({'campaign':campaign,'completed':len(saved(page)['completed']),'errors':errors},indent=2))
 print('Campaign and save checks passed',flush=True)
 # Screen matrix uses clean new-user state for size/overflow checks.
 sizes=[(320,568),(375,667),(393,852),(430,932),(620,1000),(768,1024),(834,1194),(1024,768),(1194,834),(1024,1366),(1366,1024)]
 matrix=[]
 for w,h in sizes:
  page=fresh(page,w,h);page.wait_for_timeout(100)
  matrix.append(geometry(page,'home'))
  act(page,'worlds');matrix.append(geometry(page,'worlds'))
  page.locator('[data-world="4"]').first.click();matrix.append(geometry(page,'worlds-dark'))
  act(page,'garden');matrix.append(geometry(page,'garden'))
  act(page,'settings');matrix.append(geometry(page,'settings'));act(page,'close')
  level(page,5);matrix.append(geometry(page,'play-3x3'))
  level(page,60);matrix.append(geometry(page,'play-6x6'))
  page.evaluate('document.querySelector("[data-act=game-back]").click()')
  print('Viewport',w,h,'passed',flush=True)
 overflows=[m for m in matrix if m['scrollWidth']>m['width']+1]
 report={'uiCampaignCount':len(campaign),'campaign':campaign,'geometryChecks':len(matrix),'matrix':matrix,'horizontalOverflow':overflows,'smallTargets':[m for m in matrix if m['smallTargets']],'javascriptErrors':errors,'checks':['tutorial pointer click','mascot greeting','win/score dialog','escape returns to win','next level','undo','hint','restart cancel and confirm','orientation preserves puzzle','all campaign levels','daily completion','zen completion','export download','invalid and valid import','merge keeps higher scores','reload retains saved progress']}
 (OUT/'browser-results.json').write_text(json.dumps(report,indent=2))
 print(json.dumps({'campaign':len(campaign),'matrix':len(matrix),'overflows':overflows,'smallTargets':[{'screen':m['label'],'size':[m['width'],m['height']],'targets':m['smallTargets']}for m in matrix if m['smallTargets']],'errors':errors},indent=2))
 assert not overflows and not report['smallTargets'] and not errors, 'UI regression detected; inspect browser-results.json'
 browser.close()
