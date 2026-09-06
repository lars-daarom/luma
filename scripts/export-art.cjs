const fs=require('node:fs'),path=require('node:path');
const W=require('../assets/worlds.js');
const root=path.join(__dirname,'..');
fs.writeFileSync(path.join(root,'icons/icon.svg'),W.appIcon());
fs.writeFileSync(path.join(root,'branding/luma-appicon.svg'),W.appIcon());
for(const f of W.friends){
 fs.writeFileSync(path.join(root,'branding',f.id+'.svg'),W.portrait(f.id).replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'));
 fs.writeFileSync(path.join(root,'branding',f.id+'-symbol.svg'),W.symbolSVG(f.id).replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'));
}
