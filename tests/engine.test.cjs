/* Run: node --test tests/*.test.cjs. No third-party packages required. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8');
const context=vm.createContext({});
vm.runInContext(source.split('/* Original procedural score.')[0],context);
const E=context.LumaEngine;
function validate(l){
 assert(E.evaluate(l,Array(l.n*l.n).fill(0)).won,'Known solution must solve');
 assert(!E.evaluate(l,l.initial).won,'Puzzle must not start solved');
 for(const i of l.locked)assert.equal(E.rotate(l.solution[i],l.initial[i]),l.solution[i]);
 assert(l.n>=3&&l.n<=6);
}
test('72 campaign puzzles have valid, nontrivial solutions',()=>{
 for(let id=0;id<72;id++)validate(E.generate(id));
});
test('240 generated puzzles across six worlds and four board sizes',()=>{
 for(let w=0;w<6;w++)for(let n=3;n<=6;n++)for(let s=1;s<=10;s++)validate(E.generate(w*12+5,{world:w,n,seed:72580+s}));
});
test('365 daily puzzles',()=>{
 for(let i=0;i<365;i++){const d=new Date(Date.UTC(2026,0,1+i));validate(E.daily(d.toISOString().slice(0,10)));}
});
test('grading and validation',()=>{
 assert.equal(E.grade(4,0,4),3);assert.equal(E.grade(5,0,4),2);assert.equal(E.grade(3,1,4),1);
 assert.throws(()=>E.generate(-1));assert.throws(()=>E.generate(72));assert.throws(()=>E.daily('2026-02-30'));
});
test('No Unicode emoji in application source',()=>{
 assert(!/[\p{Extended_Pictographic}\uFE0F\u20E3]/u.test(source));
});
