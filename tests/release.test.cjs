/* Release contract: static artifact-root deployment, versions, assets and saved-level compatibility. */
const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.join(__dirname,'..'), js=fs.readFileSync(path.join(ROOT,'assets/engine.js'),'utf8'),css=fs.readFileSync(path.join(ROOT,'assets/studio.css'),'utf8'),html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
test('GitHub project path deployment, version 5.0 assets and standalone-free production',()=>{
 assert(html.includes('assets/engine.js?v=5.0.0'));assert(html.includes('assets/studio.js?v=5.0.0'));assert(html.includes('assets/studio.css?v=5.0.0'));
 assert(!css.includes('paper.png'));assert(fs.readFileSync(path.join(ROOT,'assets/studio.js'),'utf8').includes("KEY='luma.save.v1'"));
 assert(!html.includes('testStore'));assert(!html.includes('window.LUMA_STANDALONE=true'));
 const m=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.webmanifest'),'utf8'));
 assert.equal(m.scope,'./');assert(m.start_url.startsWith('./'));assert.equal(m.display,'standalone');
 for(const i of m.icons){assert(!i.src.startsWith('/'));assert(fs.existsSync(path.join(ROOT,i.src.split('?')[0])));}
 assert(!/[\p{Extended_Pictographic}\uFE0F\u20E3]/u.test(js+css+html));
});
test('All 72 saved campaign layouts retain their 2.0 signatures',()=>{
 let ctx=vm.createContext({});vm.runInContext(js.split('/* Original procedural score.')[0],ctx);
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/legacy-campaign-signatures.json'),'utf8'));
 for(let id=0;id<72;id++){const l=ctx.LumaEngine.generate(id);const signature=crypto.createHash('sha256').update(JSON.stringify([l.n,l.solution,l.initial,l.locked,l.source,l.flowers,l.portals,l.world,l.seed,l.par])).digest('hex');assert.equal(signature,expected[id]);}
});
