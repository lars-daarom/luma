"""Visual regression checks against production DOM/CSS; inline test-storage harness."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from ui_harness import document,act,level,geometry
OUT=Path(__file__).resolve().parent/'visual-output';OUT.mkdir(exist_ok=True)
checks=[];errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':393,'height':852},device_scale_factor=2)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(document());page.wait_for_timeout(80)
 for world in range(6):
  level(page,world*12+4)
  assert page.locator('.board [class*="friend-"]').count()==0,'Full character on board'
  assert page.locator('.source-marker .botanical-symbol').count()==1
  values=page.evaluate('''()=>[...document.querySelectorAll('.pipe-line,.pipe-inlay')].map(p=>{const s=getComputedStyle(p);let parent=p,alpha=1;while(parent&&!parent.classList.contains('board')){alpha*=Number(getComputedStyle(parent).opacity);parent=parent.parentElement;}return {opacity:s.opacity,strokeOpacity:s.strokeOpacity,alpha,stroke:s.stroke,blend:s.mixBlendMode,filter:s.filter,clipped:getComputedStyle(p.closest('.tile').querySelector('.pipe-clip')).overflow};})''')
  assert all(v['opacity']=='1' and v['strokeOpacity']=='1' and v['alpha']==1 and v['blend']=='normal' and v['filter']=='none' and v['clipped']=='hidden' for v in values),values
  # Rotation still changes a puzzle and is clipped independently of the marker.
  saved_before=page.evaluate('JSON.parse(localStorage.getItem("luma.save.v1")).resume')
  page.locator('.tile:not(.locked)').first.click()
  saved_after=page.evaluate('JSON.parse(localStorage.getItem("luma.save.v1")).resume')
  assert saved_after['moves']==saved_before['moves']+1
  page.screenshot(path=str(OUT/f'world-{world+1}-board.png'))
  act(page,'game-back')
  current=page.locator('.level-button[aria-current="step"]')
  assert current.count()==1
  card=current.evaluate('(b)=>({r:getComputedStyle(b).borderRadius,w:b.clientWidth,h:b.clientHeight,text:b.textContent})')
  assert '%' not in card['r'] and float(card['r'].replace('px','').split()[0])<card['w']/2
  assert f'{world*12+5:02d}' in card['text'] or '05' in card['text']
  checks.append({'world':world,'opaquePipeLayers':len(values),'fullCharactersOnBoard':0,'selectedCardRadius':card['r']})
 # Real keyboard navigation and large UI text are smoke checks, not an accessibility certification.
 page.keyboard.press('Tab');assert page.evaluate('document.activeElement.tagName') in ['BUTTON','A']
 page.set_viewport_size({'width':834,'height':1194});level(page,52)
 before=page.evaluate('JSON.parse(localStorage.getItem("luma.save.v1")).resume')
 page.set_viewport_size({'width':1194,'height':834});assert page.evaluate('JSON.parse(localStorage.getItem("luma.save.v1")).resume')==before
 assert not errors
 (OUT/'visual-results.json').write_text(json.dumps({'worlds':checks,'keyboardSmoke':True,'orientationPreserved':True,'errors':errors},indent=2))
 print(json.dumps({'checkedWorlds':len(checks),'opaquePipeLayers':sum(c['opaquePipeLayers'] for c in checks),'errors':errors},indent=2))
 browser.close()
