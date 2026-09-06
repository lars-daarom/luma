/* Luma 4.1: original vector cast and opaque, continuous environments.
   Scenes always start with a full-viewport sky. Terrain paths end beyond
   the viewport; no masks, transparent holes, or detached ground islands. */
(function(root){
'use strict';
const friends=[
 {id:'luma',name:'Luma',type:'Zonnebloem',world:0,color:'#F0AC79',line:'Een kleine draai kan je hele dag laten bloeien.',bio:'Een zonnige vriend die nooit haast heeft. Luma neemt je mee en vindt zelfs het kleinste lichtpuntje bijzonder.',greeting:'Ha, daar ben je. Zullen we samen op pad?'},
 {id:'pippa',name:'Pippa',type:'Tulp',world:0,color:'#DB878D',line:'Voor elk nieuw begin een klein dansje.',bio:'Pippa probeert het gewoon nog een keer. Ze wiegt op de muziek en danst als het licht haar blaadjes raakt.',greeting:'Een bochtje hier, een dansje daar!'},
 {id:'nori',name:'Nori',type:'Waterlelie',world:1,color:'#AECED0',line:'Een omweg is soms het rustigste pad.',bio:'Nori drijft het liefst tussen de regendruppels. Ze helpt je langs de vaste tegels en houdt van kabbelende melodietjes.',greeting:'Adem maar uit. We volgen het water.'},
 {id:'mosi',name:'Mosi',type:'Paddenstoel',world:2,color:'#BA8CBA',line:'Onder elk blaadje wacht een ontdekking.',bio:'Mosi is een beetje verlegen. In het Fluisterbos weet hij de weg naar alle verborgen vertakkingen.',greeting:'Psst... achter dat bochtje is nog een pad.'},
 {id:'pico',name:'Pico',type:'Cactus',world:3,color:'#83AA80',line:'Ook in het zand groeit iets bijzonders.',bio:'Stekelig van buiten, zacht van binnen. Pico kent de lichtpoorten van de woestijn en zet graag zijn mooiste bloemetje op.',greeting:'Van de ene poort naar de andere. Daar gaan we!'},
 {id:'nova',name:'Nova',type:'Maanbloem',world:4,color:'#B5AEDB',line:'Sommige bloemen bloeien pas als het stil is.',bio:'Nova houdt de nachtkas wakker. Ze verzamelt sterrenlicht en laat zien hoe een kring ook een mooi pad kan zijn.',greeting:'Zie je dat? Zelfs de nacht kan bloeien.'},
 {id:'kiki',name:'Kiki',type:'Klaver',world:5,color:'#A6BB76',line:'Geluk groeit als je het deelt.',bio:'Kiki brengt alle vrienden samen in de Sterrenweide. Een beetje regen, een beetje zon en heel veel kleine ontdekkingen.',greeting:'Wat fijn dat je er bent. We maken iets moois.'}
];
const themes=[
 {name:'Zonnetuin',host:'luma',sky:'#E2F0DE',glow:'#F7EFCF',far:'#BCD3AB',mid:'#98BA91',ground:'#D0DDA4',front:'#ADC48B',detail:'#709879',water:'#ADD5C6',flower:'#F2B77F'},
 {name:'Regendauw',host:'nori',sky:'#DCEDED',glow:'#F0F4E1',far:'#A3C5C3',mid:'#7BAAA7',ground:'#BDD4BB',front:'#95BEA6',detail:'#5D958E',water:'#9BC9CB',flower:'#E6BDBB'},
 {name:'Fluisterbos',host:'mosi',sky:'#E6EBD7',glow:'#F8EACC',far:'#B0C6A3',mid:'#79A38C',ground:'#C5D3A9',front:'#98B287',detail:'#4C806F',water:'#A6C9AE',flower:'#D2B6D0'},
 {name:'Zandbloei',host:'pico',sky:'#F8E8CC',glow:'#FFECC7',far:'#E6BB91',mid:'#CE9E7D',ground:'#E9C7A0',front:'#DAB38C',detail:'#9D8C6A',water:'#A9C6AF',flower:'#DF977D'},
 {name:'Nachtkas',host:'nova',sky:'#333B56',glow:'#505574',far:'#566780',mid:'#526E77',ground:'#6B8887',front:'#466D70',detail:'#90AF99',water:'#748DAD',flower:'#D5C5E6'},
 {name:'Sterrenweide',host:'kiki',sky:'#DFEAE4',glow:'#F0E5D7',far:'#BCCAB8',mid:'#96B4AA',ground:'#CED7AF',front:'#A5BE95',detail:'#669485',water:'#BCD4CA',flower:'#E7D291'}
];
let serial=0;
const friend=id=>friends.find(f=>f.id===id)||friends[0];
const host=w=>themes[w]?.host||'luma';
// Shared outlines for the mascot, app icon and the quiet gameplay symbols.
function rosette(cx,cy,r,n=6,depth=.14,phase=-Math.PI/2){
 const count=n*24,pts=[];
 for(let i=0;i<count;i++){const t=i*Math.PI*2/count,delta=((t+Math.PI/n)%(Math.PI*2/n))-Math.PI/n; const profile=n===6?(.58*Math.cos(delta)+Math.sqrt(.42*.42-.58*.58*Math.sin(delta)**2)):(1-depth+depth*Math.cos(n*t)); const rad=r*profile;pts.push([cx+rad*Math.cos(t+phase),cy+rad*Math.sin(t+phase)]);}
 const fmt=v=>Number(v.toFixed(3));let d=`M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
 for(let i=0;i<count;i++){
  const a=pts[(i-1+count)%count],b=pts[i],c=pts[(i+1)%count],e=pts[(i+2)%count];
  d+=`C${fmt(b[0]+(c[0]-a[0])/6)} ${fmt(b[1]+(c[1]-a[1])/6)} ${fmt(c[0]-(e[0]-b[0])/6)} ${fmt(c[1]-(e[1]-b[1])/6)} ${fmt(c[0])} ${fmt(c[1])}`;
 }
 return d+'Z';
}
const petal=(x,y,r,n,c)=>`<path d="${rosette(x,y,r*1.28,n,.15)}" fill="${c}"/>`;
const shapes={
 luma:{fill:'#EBA875',edge:'#C5865D',core:'#FFF0C3',d:rosette(50,50,34,6,.14)},
 pippa:{fill:'#DFA09E',edge:'#B47E86',core:'#F8D5C3',d:'M20 28C22 24 31 31 34 35L46 19Q50 12 54 19L66 35C72 28 78 25 80 29L80 48C80 69 67 83 50 85C32 83 20 69 20 48Z'},
 nori:{fill:'#B5C9D0',edge:'#7F9EAF',core:'#FFF0CB',d:'M50 16C55 19 62 27 64 36C73 28 80 26 84 28C87 36 84 45 79 51C87 54 90 59 89 64C80 79 66 85 50 85C34 85 20 79 11 64C10 59 13 54 21 51C16 45 13 36 16 28C20 26 27 28 36 36C38 27 45 19 50 16Z'},
 mosi:{fill:'#B6A0C8',edge:'#8777A0',core:'#F5E8D3',d:'M39 66H22Q12 65 16 52C22 26 32 19 50 19C69 19 80 30 85 52Q89 65 78 66H61L64 79Q65 85 55 85H45Q35 85 36 79Z'},
 pico:{fill:'#93B091',edge:'#648A72',core:'#CAD7AE',d:'M49 17C70 16 77 28 77 43V50Q85 50 85 41V36Q85 27 91 29Q96 29 96 37V45Q96 66 77 65V72Q77 83 66 84H35Q24 84 24 72V63Q6 63 6 47V40Q6 33 12 33Q18 33 18 40V46Q18 51 24 51V41C24 28 34 18 49 17Z'},
 nova:{fill:'#C7BEDF',edge:'#9387B1',core:'#F5E6BF',d:rosette(50,50,35,5,.22)},
 kiki:{fill:'#A8BD87',edge:'#7E995F',core:'#E4E6B4',d:'M50 29C22 0 3 27 26 48C1 70 23 97 49 72C76 99 98 72 75 51C101 25 75 1 50 29Z'}
};
function symbol(id='luma',role='flower'){
 const x=shapes[id]||shapes.luma;
 let detail='';
 if(id==='pippa')detail='<path class="symbol-detail" d="M50 29v41M32 45q18 6 18 25 0-19 18-25" fill="none" stroke="'+x.core+'" stroke-width="3" stroke-linecap="round"/>';
 else if(id==='nori')detail='<path class="symbol-detail" d="M50 32v38m-23-22 23 22 23-22" stroke="'+x.core+'" stroke-width="3" fill="none" stroke-linecap="round"/>';
 else if(id==='mosi')detail='<path class="symbol-core" d="M39 66h22l3 13q1 6-9 6H45q-10 0-9-6Z" fill="'+x.core+'"/><g class="symbol-detail" fill="'+x.core+'"><circle cx="35" cy="44" r="4"/><circle cx="62" cy="40" r="5"/></g>';
 else if(id==='pico')detail='<path class="symbol-detail" d="M43 31v34m12-34v34" fill="none" stroke="'+x.core+'" stroke-width="3" stroke-linecap="round"/>';
 else detail='<circle class="symbol-core" cx="50" cy="50" r="'+(id==='kiki'?10:13)+'" fill="'+x.core+'"/>';
 const seed=role==='source'?'<path class="source-spark" d="M50 40Q51 49 59 50Q51 51 50 60Q49 51 41 50Q49 49 50 40Z" fill="#9C713F"/>':'';
 const sourceCore=role==='source'&&['pico','mosi','pippa','nori'].includes(id)?'<circle class="symbol-core" cx="50" cy="50" r="13" fill="#FFF0C3"/>':'';
 return `<g class="botanical-symbol botanical-${id} symbol-${role}" data-symbol="${id}"><path class="symbol-outline" d="${x.d}" fill="${x.fill}"/>${detail}${sourceCore}${seed}</g>`;
}
function symbolSVG(id,role='flower',cls=''){return `<svg class="botanical-svg ${cls}" viewBox="0 0 100 100" aria-hidden="true">${symbol(id,role)}</svg>`;}
function appIcon(){
 const d=rosette(512,460,317,6,.135);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><linearGradient id="icon-field" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#9EBBA0"/><stop offset="1" stop-color="#507866"/></linearGradient><linearGradient id="icon-petal" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#F6BE88"/><stop offset="1" stop-color="#E7A071"/></linearGradient><linearGradient id="icon-face" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF4CE"/><stop offset="1" stop-color="#FCE6AD"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#icon-field)"/><g transform="rotate(-8 512 490)"><path d="M522 807C418 821 327 784 308 710C412 685 492 721 522 807Z" fill="#C2D2A4"/><path d="M522 807C526 723 600 676 699 692C690 771 628 814 522 807Z" fill="#D9DFB0"/><path d="M402 756q72 25 118 52m112-74-108 74" stroke="#91AE84" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" transform="translate(0 13)" fill="#CB8C68"/><path d="${d}" fill="url(#icon-petal)"/><circle cx="512" cy="460" r="194" fill="url(#icon-face)"/><g fill="#EBA78D"><ellipse cx="383" cy="508" rx="38" ry="25"/><ellipse cx="641" cy="508" rx="38" ry="25"/></g><g fill="#374F3B"><ellipse cx="448" cy="453" rx="20" ry="28"/><ellipse cx="576" cy="453" rx="20" ry="28"/></g><g fill="#FFFDF0"><circle cx="442" cy="443" r="7"/><circle cx="570" cy="443" r="7"/></g><path d="M487 529q25 29 50 0" stroke="#374F3B" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M385 388q41-62 115-61" stroke="#FFFAE2" stroke-width="12" fill="none" stroke-linecap="round"/></g></svg>`;
}
function face(x,y,mood='calm',s=1){return `<g transform="translate(${x} ${y}) scale(${s})" class="plant-face mood-${mood}"><g fill="#EC9B8A" opacity=".64"><ellipse cx="-22" cy="8" rx="8" ry="5"/><ellipse cx="22" cy="8" rx="8" ry="5"/></g><g class="plant-eyes"><g class="friend-blink" fill="#344B3C"><ellipse cx="-13" cy="-5" rx="4.5" ry="6.5"/><ellipse cx="13" cy="-5" rx="4.5" ry="6.5"/><g fill="#FFFCEB"><circle cx="-14.2" cy="-7.2" r="1.5"/><circle cx="11.8" cy="-7.2" r="1.5"/></g></g></g><g class="plant-joy-eyes" fill="none" stroke="#344B3C" stroke-width="3" stroke-linecap="round"><path d="M-18-3q5-7 10 0m16 0q5-7 10 0"/></g><g class="plant-sleep-eyes" fill="none" stroke="#344B3C" stroke-width="2.6" stroke-linecap="round"><path d="M-18-3q5 4 10 0m16 0q5 4 10 0"/></g><path d="M-6 12q6 7 12 0" fill="none" stroke="#344B3C" stroke-width="3" stroke-linecap="round"/></g>`;}
function leafyBody(c='#79A07A'){return `<g class="plant-body"><ellipse cx="64" cy="170" rx="15" ry="8" transform="rotate(-13 64 170)" fill="#416E55"/><ellipse cx="98" cy="170" rx="15" ry="8" transform="rotate(13 98 170)" fill="#416E55"/><path d="M71 112c-16 11-23 35-11 46 14 14 43 3 43-11 0-15-11-28-19-35Z" fill="${c}"/><path d="M70 132q5 16 21 20" stroke="#B9CC9E" stroke-width="3" fill="none" stroke-linecap="round"/><g class="friend-arm"><path d="M95 142q4-33 31-38c4 22-7 35-31 38Z" fill="${c}"/><path d="m100 137 17-22" stroke="#B9CC9E" stroke-width="2.5" fill="none" stroke-linecap="round"/></g><path d="M62 141q-30 0-32-25c22-1 31 7 32 25Z" fill="#98B88A"/></g>`;}
function figure(id='luma',mood='calm'){
 let b='',head='';
 if(id==='luma'||id==='nova'){
  b=leafyBody(id==='nova'?'#76969C':'#7AA178');
  const c=id==='nova'?'#D6D1EC':'#EFAA7A',ctr=id==='nova'?'#F5E7BB':'#FFF0BB';
  head=`${petal(80,69,48,6,c)}<circle cx="80" cy="69" r="38" fill="${ctr}"/><path d="M53 55q8-18 28-17" fill="none" stroke="#FFF9E4" stroke-width="3.5" stroke-linecap="round"/>${face(80,74,mood)}`;
  if(id==='nova')b+='<path d="M62 115q21 13 39-2l3 10q-23 11-40 0Z" fill="#A0A5D0"/><path d="m96 123 9 3 1 27-11-3Z" fill="#A0A5D0"/>';
 }else if(id==='pippa'){
  b=leafyBody('#6F9D78');
  head=`<path d="M29 40q5-9 24 11L76 17q7-8 14 2l20 31q18-19 23-14c11 50-8 80-51 80-41 0-62-30-53-76Z" fill="#DD8D91"/><path d="M80 22q-22 24-27 58 14-13 27-12 16 0 32 13-5-34-32-59Z" fill="#EEA7A2"/><path d="M33 52q-1 43 28 50" stroke="#F0B3A8" stroke-width="4" fill="none" stroke-linecap="round"/>${face(81,84,mood,.94)}`;
 }else if(id==='nori'){
  b='<ellipse cx="80" cy="168" rx="61" ry="12" fill="#709E8D"/><path d="M19 168q27-31 62-8 28-25 60 3-22 29-59 10l-8-11Z" fill="#9EBF98"/><path d="M65 112q-18 29-5 45 14 14 39 0 9-17-9-45Z" fill="#88B6AC"/><g class="friend-arm"><path d="M100 136q3-25 24-31 5 25-24 31Z" fill="#93BFAE"/></g>';
  head=`${Array.from({length:7},(_,i)=>`<path d="M80 83Q45 52 80 19q34 32 0 64Z" transform="rotate(${i*360/7} 80 73)" fill="${i%2?'#DBD9E8':'#BECEDB'}"/>`).join('')}<circle cx="80" cy="77" r="33" fill="#FFF0C7"/>${face(80,80,mood,.86)}`;
 }else if(id==='mosi'){
  b='<ellipse cx="61" cy="173" rx="18" ry="8" fill="#82758E"/><ellipse cx="98" cy="173" rx="18" ry="8" fill="#82758E"/><path d="M52 84q6 25-4 61c-7 28 74 29 65 1-9-35-4-58-8-63Z" fill="#F5E8CA"/><path d="M56 108q-14 5-16 22" fill="none" stroke="#E2CEB2" stroke-width="9" stroke-linecap="round"/><g class="friend-arm"><path d="M106 115q16-1 20-15" fill="none" stroke="#F1DDC2" stroke-width="9" stroke-linecap="round"/></g>';
  head=`<path d="M13 83C12 48 36 20 76 20c47 0 72 32 72 62 0 19-136 18-135 1Z" fill="#B18BB5"/><path d="M14 83q67 26 133-1" fill="none" stroke="#96739D" stroke-width="7" stroke-linecap="round"/><g fill="#E3C9DD"><ellipse cx="45" cy="48" rx="12" ry="8" transform="rotate(-28 45 48)"/><ellipse cx="105" cy="50" rx="11" ry="9" transform="rotate(30 105 50)"/><circle cx="76" cy="31" r="6"/><circle cx="74" cy="72" r="7"/></g>${face(80,118,mood,.93)}`;
 }else if(id==='pico'){
  b='<ellipse cx="62" cy="171" rx="18" ry="8" fill="#72855B"/><ellipse cx="96" cy="171" rx="18" ry="8" fill="#72855B"/><path d="M49 128H32q-16 0-16-20V85q0-18 16-18t16 18v12h5Z" fill="#77A382"/><g class="friend-arm"><path d="M105 108h18q18 0 18-22V64q0-16-14-16t-14 16v16h-10Z" fill="#80AC88"/></g>';
  head=`<rect x="47" y="39" width="66" height="126" rx="33" fill="#95B990"/><path d="M65 53q-10 26-7 46m3 39 5 13M93 51q11 25 9 44m-2 40-7 17" fill="none" stroke="#B2CD9F" stroke-width="3" stroke-linecap="round"/><g stroke="#527E65" stroke-width="2" stroke-linecap="round"><path d="m24 93 5 2m97-30 5-2M55 58l-3-4m54 62 4-2M53 139l-3 2"/></g>${petal(90,38,16,5,'#EDB5A2')}<circle cx="90" cy="38" r="6" fill="#F6DEAA"/>${face(80,103,mood,.86)}`;
 }else{
  b=leafyBody('#87AA71');
  head=`${[0,90,180,270].map(r=>`<path d="M80 79C12 69 28 15 54 26c15-21 51-8 40 21Z" transform="rotate(${r} 80 75)" fill="${r%180?'#A8C086':'#98B578'}"/>`).join('')}<circle cx="80" cy="77" r="28" fill="#E5E5AA"/>${face(80,80,mood,.78)}`;
 }
 return `<g class="plant-character friend-${id} mood-${mood}">${b}<g class="plant-head">${head}</g></g>`;
}
function portrait(id,mood='calm',cls=''){return `<svg class="friend-portrait ${cls}" viewBox="0 0 160 190" aria-hidden="true">${figure(id,mood)}</svg>`;}
function stamp(id,mood='calm'){return symbol(id,'flower');}
function tree(x,y,s,c){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v-79" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M0-29c-55-5-56-62-34-71-19-35 43-52 51-18 38-7 54 43 22 57 11 16-14 32-39 32Z" fill="${c}"/></g>`;}
function landscapeBase(w,mode,id){
 const t=themes[w],night=w===4;let deco='';
 if(w===2)deco=`${tree(65,370,2.8,t.mid)}${tree(920,355,2.3,t.mid)}${tree(183,340,1.2,t.far)}`;
 if(w===3)deco='<g fill="#9DB493"><path d="M779 348V229q0-30 21-30t21 30v119Z"/><path d="M790 289h-34q-19 0-19-19v-37q0-16 13-16t13 16v24h27Zm22-22h28q20 0 20-24v-31q0-14-13-14t-13 14v29h-22Z"/></g>';
 if(w===4)deco=`<g fill="#F7EABD">${Array.from({length:22},(_,j)=>`<circle cx="${43+j*41}" cy="${29+(j*37)%180}" r="${j%3===0?2.4:1.4}"/>`).join('')}</g>`;
 const greenhouse=(w===4||mode==='garden')?`<g transform="translate(${mode==='garden'?83:701} ${mode==='garden'?150:206})"><path d="M0 125V62a78 78 0 0 1 156 0v63Z" fill="${night?'#B1CAB3':'#F7F0D7'}" opacity=".75"/><path d="M0 125V62a78 78 0 0 1 156 0v63ZM78-16v142M0 56h156M21 16q18 26 18 108m78 0q0-84 18-108" stroke="${night?'#809F9D':'#94AD91'}" stroke-width="7" fill="none"/><path d="M60 125V89q18-20 36 0v36" fill="${t.detail}"/><path d="M73 121v-19m11 19v-19" stroke="#BCD4A5" stroke-width="3"/></g>`:'';
 return `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="${t.sky}"/><stop offset="1" stop-color="${t.glow}"/></linearGradient><linearGradient id="${id}-ground" x2="0" y2="1"><stop stop-color="${t.ground}"/><stop offset="1" stop-color="${t.front}"/></linearGradient></defs><rect class="scene-sky" width="960" height="1200" fill="url(#${id}-sky)"/>${night?'<path d="M797 52c-40-7-62 43-31 69 23 20 62 8 66-20-34 11-55-23-35-49Z" fill="#F5E3B1"/>':`<circle cx="784" cy="112" r="48" fill="#F6D997"/>`}<g class="scene-clouds" fill="${night?'#7A809B':'#FFFBE8'}" opacity="${night?'.26':'.88'}"><path d="M74 138c-10-21 6-39 28-33 6-27 44-26 53-1 20-8 39 8 34 28l-2 6Z"/><path d="M591 79c-3-13 9-22 22-16 7-16 33-15 38 3 16-4 23 3 25 13Z"/><path d="M846 182c-3-18 12-25 23-17 6-26 46-28 49 1 21-4 31 7 25 16Z"/></g>${deco}<path d="M-20 330Q107 171 302 285q191-152 347-56 145-116 331 21V1200H-20Z" fill="${t.far}"/><g opacity=".6">${tree(518,290,.75,t.detail)}${tree(560,278,.60,t.detail)}${tree(633,250,.67,t.detail)}${tree(680,261,.48,t.detail)}</g><path d="M-20 316q183-44 351 41 212-165 377-28 106-62 272-52V1200H-20Z" fill="${t.mid}"/>${greenhouse}${w===1?`<path d="M350 328q225-85 520 52L665 552H199Z" fill="${t.water}"/><g fill="none" stroke="#DDECDD" stroke-width="3" opacity=".7"><path class="pond-ripple" d="M659 370q34-9 68 0m-160 42q40-9 80 0"/><path d="M709 457q27-8 54 0"/></g>`:`<path d="M662 301h86q7 0 7 8v27h-22v-17h-30v26h-20v-24h-28v25h-16v-27q0-18 23-18Z" fill="${night?'#899690':'#EEE7C9'}"/>`}<path d="M-20 397q195-123 441 3 202-46 559-19V1200H-20Z" fill="url(#${id}-ground)"/>`;
}
function placed(id,x,y,s=1,mood='calm',delay=0){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="80" cy="178" rx="48" ry="8" fill="#345642" opacity=".10"/><g class="friend-sway" style="--delay:${delay}s">${figure(id,mood)}</g></g>`;}
function sprouts(w){const t=themes[w];return Array.from({length:22},(_,j)=>{const x=18+j*44,y=474+(j*41)%140;return `<g transform="translate(${x} ${y})" fill="${j%3===0?t.flower:t.detail}" opacity="${j%3===0?'.9':'.48'}">${j%3===0?petal(0,0,7,5,t.flower):'<path d="M0 10q-14-1-13-15Q-1-5 0 10q0-16 11-20 6 14-11 20Z"/>'}</g>`;}).join('');}
function scenery(w=0,mode='home',completed={}){
 const t=themes[w],id='environment-'+serial++;let inhabitants='';
 if(mode==='garden'){
  // Distinct garden: greenhouse, connected path and individual planting beds.
  const plots=Array.from({length:12},(_,j)=>{const x=277+(j%3)*240,y=337+Math.floor(j/3)*160,done=Boolean(completed[w*12+j]);return `<g><ellipse cx="${x}" cy="${y+48}" rx="66" ry="20" fill="${w===4?'#465A65':'#AFAB7E'}" opacity=".55"/><ellipse cx="${x}" cy="${y+44}" rx="60" ry="17" fill="${w===3?'#C49777':w===4?'#53676B':'#B7BE8B'}"/>${done?placed(plantForLevel(w,j),x-52,y-80,.66,'calm',-j*.31):`<g transform="translate(${x} ${y+29})"><path d="M0 12V-1" stroke="${t.detail}" stroke-width="3" stroke-linecap="round"/><path d="M0 4q-19 0-17-13Q-1-10 0 4q0-18 15-19 4 15-15 19Z" fill="${t.detail}" opacity=".8"/></g>`}</g>`;}).join('');
  inhabitants=`<path d="M118 1040C164 780 185 554 192 367C192 317 166 302 134 275" fill="none" stroke="${w===4?'#B1ADA0':'#EFE7C9'}" stroke-width="46"/>${plots}${placed('luma',10,314,1.18)}<g class="garden-rain" fill="${w===4?'#BDDDE4':'#70AEB1'}">${Array.from({length:24},(_,j)=>`<path d="m${212+(j*71)%690} ${255+(j*33)%278}-5 13q-2 6 4 6t4-6Z" style="--delay:${-(j%7)*.13}s"/>`).join('')}</g>`;
 }else if(mode==='celebrate'){
  inhabitants=placed(host(w),306,173,2.1,'joy')+placed(w===0?'pippa':'luma',146,353,1.0,'joy',-.7)+placed(w===3?'kiki':'pippa',684,369,.95,'joy',-1.2);
 }else{
  const center=mode==='world'?host(w):'luma';
  inhabitants=placed(center,310,175,2.08,'calm')+placed(w===2?'kiki':'pippa',129,352,1.04,'calm',-.8)+placed(w===0?'mosi':w===2?'mosi':host(w),694,344,1.1,'calm',-1.7)+placed(w===1?'nori':'kiki',49,416,.72,'calm',-2.1)+placed(w===3?'pico':'nori',819,423,.68,'calm',-2.8);
 }
 const mote=`<g class="scene-motes" fill="${w===4?'#FFF3BA':'#FFF9D2'}">${Array.from({length:9},(_,j)=>`<circle cx="${66+j*98}" cy="${203+(j*43)%201}" r="${j%3===0?3:2}"/>`).join('')}</g>`;
 return `<svg class="landscape landscape-${mode}" data-environment="${w}" viewBox="0 0 960 ${mode==='garden'?1020:620}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${landscapeBase(w,mode,id)}${inhabitants}${mode==='garden'?'<g transform="translate(0 400)">'+sprouts(w)+'</g>':sprouts(w)}<g transform="translate(0 ${mode==='garden'?400:0})"><path d="M-10 620v-110q85-28 106 23-53-11-43 36 77-15 124 51Zm980 0V486q-80-11-98 28 46-6 42 45-74-16-103 61Z" fill="${t.detail}" opacity=".72"/>${mote}</g></svg>`;
}
function plantForLevel(w,j){const pool=[['pippa','luma','kiki'],['nori','pippa','nori'],['mosi','kiki','mosi'],['pico','luma','pico'],['nova','mosi','nova'],['kiki','nova','pippa']][w];return pool[j%pool.length];}
function thumbnail(w){const t=themes[w],id='world-emblem-'+serial++;return `<svg class="world-emblem" viewBox="0 0 100 92" aria-hidden="true"><defs><clipPath id="${id}"><rect x="1" y="1" width="98" height="90" rx="23"/></clipPath></defs><g clip-path="url(#${id})"><rect width="100" height="92" fill="${t.sky}"/><path d="M0 78Q30 61 52 77T100 73V92H0Z" fill="${t.far}"/><g transform="translate(9 0) scale(.82)">${symbol(host(w),'flower')}</g></g></svg>`;}
function collection(completed){return friends.map(f=>({...f,unlocked:f.id==='luma'||Object.keys(completed).filter(k=>Math.floor(Number(k)/12)===f.world).length>=3}));}
root.LumaWorlds={friends,themes,friend,host,figure,portrait,stamp,scenery,thumbnail,plantForLevel,collection,symbol,symbolSVG,shapes,rosette,appIcon};
if(typeof module!=='undefined'&&module.exports)module.exports=root.LumaWorlds;
})(typeof window!=='undefined'?window:globalThis);
