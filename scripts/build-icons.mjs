/** Canonical Luma 5.1 PNG generator for the premium light-path app icon. Node stdlib only. */
import {deflateSync} from 'node:zlib';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function crc32(b){let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc]);}
const clamp=x=>Math.max(0,Math.min(1,x));
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*clamp(t)));
const over=(a,b,t)=>a.map((v,i)=>Math.round(v*(1-clamp(t))+b[i]*clamp(t)));
const distSeg=(x,y,a,b)=>{const vx=b[0]-a[0],vy=b[1]-a[1],d=vx*vx+vy*vy,t=d?clamp(((x-a[0])*vx+(y-a[1])*vy)/d):0;return Math.hypot(x-(a[0]+t*vx),y-(a[1]+t*vy));};
const bez=(a,b,c,d,t)=>{const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
function routePoints(){const pts=[[154,138],[154,309]];for(let i=1;i<=16;i++)pts.push(bez([154,309],[154,361],[190,394],[239,394],i/16));pts.push([282,394]);for(let i=1;i<=18;i++)pts.push(bez([282,394],[334,394],[376,352],[376,300],i/18));pts.push([376,206]);return pts;}
const ROUTE=routePoints();
function routeDist(x,y,dy=0){let d=1e9;for(let i=1;i<ROUTE.length;i++)d=Math.min(d,distSeg(x,y-dy,ROUTE[i-1],ROUTE[i]));return d;}
function radial(x,y,cx,cy,r,inner,outer){return mix(inner,outer,Math.hypot(x-cx,y-cy)/r);}
function star(x,y,cx,cy,s){const dx=Math.abs(x-cx),dy=Math.abs(y-cy);return (dx<2.2&&dy<s)||(dy<2.2&&dx<s)||(dx+dy<s*.82);}
function paint(x,y){
 const teal0=[111,209,199],teal1=[58,143,162],teal2=[33,75,99];
 let t=clamp((x*.46+y*.54)/512),c=t<.46?mix(teal0,teal1,t/.46):mix(teal1,teal2,(t-.46)/.54);
 const halo=Math.hypot(x-146,y-95);if(halo<118)c=over(c,[184,255,241],.14*(1-halo/118));
 const dark=Math.hypot(x-430,y-437);if(dark<154)c=over(c,[16,46,73],.17*(1-dark/154));
 const bgArc=Math.abs(Math.hypot(x-256,y-590)-300);if(bgArc<13)c=over(c,[199,255,243],.08*(1-bgArc/13));
 const sh=routeDist(x,y,10);if(sh<45)c=over(c,[16,45,60],.32*(1-clamp((sh-35)/10)));
 const r=routeDist(x,y);if(r<39){c=mix([255,253,245],[233,221,196],clamp((x+y-200)/650));if(r<6&&x<310)c=over(c,[255,255,255],.7);}
 const nodes=[[154,136,[255,202,134],[201,76,66]],[376,203,[255,247,183],[232,156,47]]];
 for(const [cx,cy,inner,outer] of nodes){const d=Math.hypot(x-cx,y-cy);if(d<59){c=radial(x,y,cx,cy,59,inner,outer);if(d>41&&d<49)c=over(c,[255,235,179],.55);const hx=(x-(cx-18))/18,hy=(y-(cy-20))/12;if(hx*hx+hy*hy<1)c=over(c,[255,252,228],.72);}}
 if(star(x,y,400,143,25)||star(x,y,435,187,12))c=[255,253,235];
 return c;
}
export function png(size){const ss=3,W=size,H=size,stride=W*3+1,raw=Buffer.alloc(stride*H);for(let y=0;y<H;y++){raw[y*stride]=0;for(let x=0;x<W;x++){const acc=[0,0,0];for(let sy=0;sy<ss;sy++)for(let sx=0;sx<ss;sx++){const p=paint((x+(sx+.5)/ss)*512/W,(y+(sy+.5)/ss)*512/H);for(let i=0;i<3;i++)acc[i]+=p[i];}for(let i=0;i<3;i++)raw[y*stride+1+x*3+i]=Math.round(acc[i]/(ss*ss));}}const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=2;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
await mkdir(resolve(root,'icons'),{recursive:true});for(const n of [180,192,512])await writeFile(resolve(root,'icons/studio-'+n+'.png'),png(n));console.log('Luma 5.1 premium icons generated: 180, 192, 512.');
