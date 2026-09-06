"""Render real game screenshots, not an independently designed mock-up.
Requires Python Playwright. This test uses a Storage API adapter on about:blank.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT.parent/'Luma.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.evaluate('''()=>{const map=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},configurable:true});}''')
    page.set_content(HTML,wait_until='load')
    page.wait_for_timeout(450)
    page.screenshot(path=str(ROOT.parent/'luma-preview-home.png'))
    for id,name in [(29,'puzzle'),(41,'portals'),(52,'night')]:
        page.evaluate('''id=>{
          document.querySelector('[data-act="game-back"]')?.click();
          document.querySelector('[data-act="worlds"]').click();
          document.querySelector('[data-act="world"][data-world="'+Math.floor(id/12)+'"]').click();
          document.querySelector('[data-act="level"][data-level="'+id+'"]').click();
          const E=LumaEngine,l=E.generate(id);
          const leave=l.flowers.find(i=>l.initial[i]&&!l.locked.includes(i));
          l.solution.forEach((mask,i)=>{if(i===leave||l.locked.includes(i))return;let k=E.distanceToSolution(mask,l.initial[i]);while(k--)document.querySelector('.tile[data-index="'+i+'"]').click();});
        }''',id)
        page.wait_for_timeout(650)
        page.screenshot(path=str(ROOT.parent/f'luma-preview-{name}.png'))
    browser.close()
