/** Reproducible, opaque PNG icons. Only Node standard-library modules. */
import {deflateSync} from 'node:zlib';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function crc32(b){let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc]);}
function segmentDistance(x,y,x1,y1,x2,y2){const t=Math.max(0,Math.min(1,((x-x1)*(x2-x1)+(y-y1)*(y2-y1))/((x2-x1)**2+(y2-y1)**2)));return Math.hypot(x-x1-t*(x2-x1),y-y1-t*(y2-y1));}
function paint(x,y){
 const bg=[250,248,241],coral=[204,90,67],sage=[120,157,128];
 if(Math.hypot(x-336,y-160)<=42)return sage;
 if(Math.hypot(x-176,y-160)<=42||segmentDistance(x,y,176,160,176,292)<=28||segmentDistance(x,y,336,212,336,292)<=28||(y>=292&&Math.abs(Math.hypot(x-256,y-292)-80)<=28))return coral;
 return bg;
}
export function png(size){const raw=Buffer.alloc((size*3+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){let c=[0,0,0];for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++){const p=paint((x+(dx+.5)/3)*512/size,(y+(dy+.5)/3)*512/size);c=c.map((v,i)=>v+p[i]);}for(let i=0;i<3;i++)raw[y*(size*3+1)+1+x*3+i]=Math.round(c[i]/9);}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=2;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
await mkdir(resolve(root,'icons'),{recursive:true});
for(const n of [180,192,512])await writeFile(resolve(root,'icons/studio-'+n+'.png'),png(n));
console.log('Luma icons: 180, 192 and 512 px generated.');
