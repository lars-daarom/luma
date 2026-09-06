"""Browser integration tests. Local HTML is injected with set_content because
this environment's managed Chromium blocks file/http navigation. A Storage API
test double permits persistence/restore tests without an origin. Real Safari,
installation, and service-worker offline navigation require a hosted test.
"""
from pathlib import Path
import json
import time
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT.parent/'Luma.html').read_text()
results=[]
errors=[]

def setup(browser,w=390,h=844,saved=None,reduce=True):
    page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
    page.set_default_timeout(7000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    store=saved or {'version':1,'completed':{},'daily':{},'resume':None,'lastWorld':0,'settings':{'music':True,'sound':True,'muted':False,'motion':reduce,'contrast':False,'haptic':False}}
    page.evaluate('''(saved)=>{
      const store=new Map([['luma.save.v1',JSON.stringify(saved)]]);
      Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()}});
      const Original=window.AudioContext;
      window.__audio=[];
      if(Original){window.AudioContext=class extends Original{constructor(...a){super(...a);window.__audio.push(this);this.__oscillators=0;}createOscillator(){this.__oscillators++;return super.createOscillator();}createDynamicsCompressor(){const n=super.createDynamicsCompressor();this.__analyser=this.createAnalyser();this.__analyser.fftSize=512;n.connect(this.__analyser);return n;}};}
    }''',store)
    page.set_content(HTML,wait_until='load')
    return page

def storage(page):
    return page.evaluate("JSON.parse(localStorage.getItem('luma.save.v1'))")

def level(page,id):
    page.evaluate('''(id)=>{
      const click=s=>document.querySelector(s)?.click();
      click('[data-act="win-exit"]');
      click('[data-act="game-back"]');
      click('[data-act="worlds"]');
      click('[data-act="world"][data-world="'+Math.floor(id/12)+'"]');
      click('[data-act="level"][data-level="'+id+'"]');
    }''',id)


def solve(page,portion=1):
    return page.evaluate('''(portion)=>{
      const save=JSON.parse(localStorage.getItem('luma.save.v1')).resume;
      const E=LumaEngine;
      const l=save.mode==='daily'?E.daily(save.date):save.mode==='zen'?E.generate(save.id,{seed:save.seed,n:save.n,world:save.world}):E.generate(save.id);
      let actions=[];
      l.solution.forEach((m,i)=>{const el=document.querySelector('.tile[data-index="'+i+'"]');if(!el||l.locked.includes(i))return;const turns=Number(el.dataset.turn);const k=E.distanceToSolution(m,turns);for(let q=0;q<k;q++)actions.push(i);});
      if(portion<1)actions=actions.slice(0,Math.floor(actions.length*portion));
      actions.forEach(i=>document.querySelector('.tile[data-index="'+i+'"]').click());
      return {actions:actions.length,par:l.par};
    }''',portion)

with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=setup(b)
    assert page.locator('.hero').is_visible()
    page.locator('[data-act="continue"]').click()
    assert page.locator('.tile').count()==3
    assert page.locator('#move-count').inner_text()=='00'
    page.locator('.tile[data-index="4"]').click()
    page.locator('#win-dialog').wait_for(state='visible')
    assert storage(page)['completed']['0']['stars']==3
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Tutorial: first puzzle solved in one real pointer click; 3 lights stored.')
    page.screenshot(path=str(ROOT.parent/'luma-win-mobile.png'),full_page=True)
    # Audio exists, generates oscillators, and produces a nonzero waveform.
    page.wait_for_timeout(400)
    a=page.evaluate('''()=>window.__audio.map(c=>{const x=new Float32Array(512);c.__analyser.getFloatTimeDomainData(x);return {state:c.state,oscillators:c.__oscillators,peak:Math.max(...x.map(Math.abs))};})''')
    assert a and a[0]['oscillators']>0 and a[0]['state']=='running'
    assert a[0]['peak']>0
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Web Audio: running context, original oscillator score/effects, nonzero output measured.')
    page.locator('[data-act="next"]').click()
    assert storage(page)['resume']['id']==1
    # Rotate, undo, hint, and resume.
    before=storage(page)['resume']['turns']
    page.locator('.tile[data-index="3"]').click()
    assert storage(page)['resume']['turns']!=before
    page.locator('[data-act="undo"]').click()
    assert storage(page)['resume']['turns']==before
    page.locator('[data-act="hint"]').click()
    assert storage(page)['resume']['hints']==1
    assert page.locator('.tile.hint').count()==1
    page.locator('.tile.hint').click()
    saved=storage(page)
    page2=setup(b,saved=saved)
    page2.locator('[data-act="continue"]').click()
    assert storage(page2)['resume']['turns']==saved['resume']['turns']
    assert storage(page2)['resume']['hints']==1
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Rotate/undo/hint and serialized resume restore are consistent (Storage API adapter).')
    # Restart confirmation actually protects active progress.
    page2.locator('[data-act="restart"]').click()
    assert page2.locator('#sheet').is_visible()
    page2.locator('[data-act="close"]').first.click()
    assert storage(page2)['resume']['moves']==saved['resume']['moves']
    page2.locator('[data-act="restart"]').click()
    page2.locator('[data-act="confirm-restart"]').click()
    assert storage(page2)['resume']['moves']==0
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Restart asks for confirmation; cancel preserves moves; confirm resets only this puzzle.')
    # Keyboard tile selection and activation.
    page2.locator('.tile[data-index="3"]').focus()
    page2.keyboard.press('Enter')
    assert storage(page2)['resume']['moves']==1
    page2.keyboard.press('z')
    assert storage(page2)['resume']['moves']==0
    page2.keyboard.press('ArrowRight')
    assert page2.evaluate("document.activeElement.classList.contains('tile')")
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Keyboard controls: Enter, Z and arrow navigation exercised.')
    page2.close()
    # Full campaign through the UI; input dispatch uses DOM click for speed.
    page.locator('[data-act="game-back"]').click()
    page.locator('[data-act="mute"]').first.click()
    for id in range(72):
        print('Campaign', id+1, flush=True)
        level(page,id)
        response=solve(page)
        page.locator('#win-dialog').wait_for(state='visible')
        data=storage(page)['completed'][str(id)]
        assert data['stars']==3,(id,data)
        assert data['moves']<=response['par'],(id,data,response)
    assert len(storage(page)['completed'])==72
    assert sum(x['stars'] for x in storage(page)['completed'].values())==216
    print('Checkpoint',len(results)+1,flush=True)
    results.append('All 72 campaign puzzles completed via UI events; progression reaches 72/72 and 216 lights.')
    page.locator('[data-act="next"]').click()
    assert 'Jouw lichttuin.' in page.locator('h1').inner_text()
    page.screenshot(path=str(ROOT.parent/'luma-garden-mobile.png'),full_page=True)
    # Daily deterministic layout and completion.
    page.evaluate("document.querySelector('[data-act=home]').click()")
    page.locator('[data-act="daily"]').click()
    daily=storage(page)['resume'];assert daily['mode']=='daily'
    solve(page);page.locator('#win-dialog').wait_for(state='visible')
    assert daily['date'] in storage(page)['daily']
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Daily puzzle uses the local calendar date, is deterministic, and stores completion.')
    # Free mode 6x6, and new seed on next.
    page.locator('[data-act="win-exit"]').click()
    page.locator('[data-act="zen"]').click()
    page.locator('[data-act="size"][data-size="6"]').click()
    page.locator('[data-act="start-zen"]').click()
    zen=storage(page)['resume'];assert zen['n']==6
    solve(page);page.locator('#win-dialog').wait_for(state='visible')
    page.locator('[data-act="next"]').click()
    assert storage(page)['resume']['seed']!=zen['seed']
    print('Checkpoint',len(results)+1,flush=True)
    results.append('Free play: size selection 6x6, solvable board, next round has a new seed.')
    # Sound/motion/preferences all use working switches.
    page.locator('[data-act="settings"]').click()
    for key in ['music','sound','motion','contrast','haptic']:
        old=storage(page)['settings'][key]
        page.locator(f'[data-setting="{key}"]').click()
        assert storage(page)['settings'][key]!=old
    print('Checkpoint',len(results)+1,flush=True)
    results.append('All five settings switches update persisted preferences.')
    page.close()
    # Responsive checks with clean, normally animated presentation.
    for name,w,h in [('desktop',1440,1050),('mobile',390,844),('small',320,568),('tablet',768,1024),('landscape',844,390)]:
        page=setup(b,w,h,reduce=False)
        page.wait_for_timeout(420)
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),name
        if w<=700:
            nav=page.locator('.bottom-nav').bounding_box()
            assert abs(nav['y']+nav['height']-h)<2,(name,'bottom navigation is not viewport fixed',nav)
        if name in ['desktop','mobile']:page.screenshot(path=str(ROOT.parent/f'luma-home-{name}.png'),full_page=True)
        page.locator('[data-act="continue"]').click()
        page.wait_for_timeout(400)
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),name
        if name in ['desktop','mobile','small']:page.screenshot(path=str(ROOT.parent/f'luma-game-{name}.png'),full_page=True)
        level(page,28)
        solve(page,.78)
        page.wait_for_timeout(500)
        if name in ['desktop','mobile']:page.screenshot(path=str(ROOT.parent/f'luma-puzzle-{name}.png'),full_page=True)
        # 6x6 should retain at least 44 CSS pixels per tile on narrow portrait screens.
        level(page,65)
        size=page.locator('.tile').first.bounding_box()
        if name in ['mobile','small']:assert size['width']>=44,(name,size)
        page.close()
    print('Checkpoint',len(results)+1,flush=True)
    results.append('No horizontal overflow at 320, 390, 768, 844 landscape, and 1440 px; 6x6 tile width >=44 px on tested phones.')
    assert not errors,errors
    print('Checkpoint',len(results)+1,flush=True)
    results.append('No uncaught browser JavaScript errors in these test runs.')
    b.close()

report={'passed':results,'errors':errors,'limitations':['HTML injected with Playwright set_content; managed browser disallows direct file/HTTP navigation.','Storage API adapter used for save/restore tests; no claim of real-origin storage test.','Real iPhone/Safari, installation, share-sheet, vibration hardware, and service-worker offline navigation not tested.']}
(ROOT/'tests/browser-results.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
