/* Luma 5.3.0 - cohesive world illustration system.
 * One authored composition per world, shared across opening, map and collection crops.
 * No characters, external assets, raster backgrounds or pasted route artwork.
 */
(function(root){
'use strict';
const A=root.LumaStudioArt || (typeof require==='function'?require('./studio-art.js'):null);
if(!A)throw new Error('LumaStudioArt must load before atlas-art.js');
let serial=0;
const sceneNames=['zonnetuin','regendauw','fluisterbos','zandbloei','nachtkas','sterrenweide'];
const palettes=[
 {top:'#C8EEE5',bottom:'#F8E3BC',far:'#B7D89F',mid:'#7EAA7C',near:'#477868',accent:'#F0B34E',ink:'#31564E'},
 {top:'#CFEDEC',bottom:'#B8D9D3',far:'#8FC2B7',mid:'#5E9C96',near:'#337A80',accent:'#F1D58A',ink:'#2C6468'},
 {top:'#DCE9C7',bottom:'#B8D0A6',far:'#86A47C',mid:'#587E65',near:'#2F5C4D',accent:'#F2D9A1',ink:'#244D43'},
 {top:'#FBE7BE',bottom:'#EFB77C',far:'#DEA06D',mid:'#BC765A',near:'#7D5249',accent:'#F1B14F',ink:'#69463E'},
 {top:'#1C3452',bottom:'#304E68',far:'#3F6073',mid:'#274B5D',near:'#142F43',accent:'#F2D990',ink:'#EDE4C5'},
 {top:'#6D8098',bottom:'#A5C0B6',far:'#789B91',mid:'#477C78',near:'#295E67',accent:'#F1DB94',ink:'#E8E3C4'}
];
function escClass(v){return String(v||'').replace(/[^a-zA-Z0-9_ -]/g,'');}
const bodies=[
/* Zonnetuin - terraced orchard and a small sun gate, deliberately offset. */
`<circle cx="612" cy="156" r="72" fill="var(--sun)"/>
<path d="M0 405C126 302 254 331 361 382C474 435 602 307 768 328V1200H0Z" fill="var(--far)"/>
<path d="M0 596C139 480 286 494 402 550C526 609 638 515 768 504V1200H0Z" fill="var(--mid)"/>
<path d="M0 777C124 685 242 701 357 746C498 801 635 706 768 696V1200H0Z" fill="var(--near)"/>
<path d="M334 682C380 620 438 582 508 560C570 541 636 538 711 548" fill="none" stroke="#F5E6C2" stroke-width="42" stroke-linecap="round"/>
<path d="M432 543V431c0-67 101-67 101 0v112" fill="none" stroke="#F1CC91" stroke-width="34" stroke-linecap="round"/>
<path d="M449 544V433c0-43 67-43 67 0v111" fill="none" stroke="#4E7C64" stroke-width="19" stroke-linecap="round"/>
<g fill="#356B58"><path d="M99 712V489h24v223Z"/><path d="M60 561c0-67 26-132 51-156c30 28 50 93 38 156c-5 29-21 50-39 56c-27-9-50-27-50-56Z"/><path d="M646 728V572h18v156Z"/><path d="M615 619c0-47 18-92 39-113c23 22 37 68 29 113c-4 21-16 36-29 41c-20-7-39-19-39-41Z"/></g>
<g fill="#F7D071"><circle cx="165" cy="733" r="12"/><circle cx="202" cy="764" r="10"/><circle cx="596" cy="745" r="12"/></g>
<g fill="#E88D68"><circle cx="186" cy="721" r="9"/><circle cx="626" cy="774" r="9"/></g>
<path d="M0 1022C151 935 290 944 432 1002C562 1054 655 1024 768 983V1200H0Z" fill="#315E54"/>`,
/* Regendauw - water terraces and one continuous bridge. */
`<circle cx="601" cy="150" r="56" fill="#EAF3D8"/>
<path d="M0 432C129 330 273 362 389 401C505 441 620 347 768 354V1200H0Z" fill="var(--far)"/>
<path d="M0 640C175 540 295 581 420 622C535 660 637 605 768 563V1200H0Z" fill="var(--mid)"/>
<path d="M0 852C147 746 325 778 462 820C576 855 674 832 768 786V1200H0Z" fill="var(--near)"/>
<path d="M161 627V535c0-135 440-135 440 0v92" fill="none" stroke="#E9E6C8" stroke-width="58" stroke-linecap="square"/>
<path d="M161 625V535c0-135 440-135 440 0v90" fill="none" stroke="#789E91" stroke-width="28"/>
<path d="M187 637h388" stroke="#D9CFA9" stroke-width="13" stroke-linecap="round"/>
<g fill="none" stroke="#A9D6D1" stroke-width="7" stroke-linecap="round"><path d="M86 761h112"/><path d="M246 799h153"/><path d="M467 744h176"/><path d="M532 891h125"/></g>
<g fill="#477F74"><path d="M78 942c-9-77-5-139 21-184c24 42 28 105 11 184Z"/><path d="M669 920c-19-87-7-156 26-194c22 51 25 112 3 194Z"/></g>
<g fill="none" stroke="#7FB5B1" stroke-width="6" stroke-linecap="round" opacity=".7"><path d="m223 162-14 37"/><path d="m315 112-13 36"/><path d="m497 167-14 38"/><path d="m678 218-13 37"/></g>
<path d="M0 1041C141 983 296 982 433 1036C563 1086 682 1053 768 1016V1200H0Z" fill="#276D73"/>`,
/* Fluisterbos - canopy and luminous clearing. */
`<path d="M0 0h768v301C671 246 599 305 518 284C427 260 371 319 291 285C195 243 121 309 0 256Z" fill="#5A7D60"/>
<path d="M0 0h768v154C664 121 592 175 505 137C431 105 365 165 276 132C193 101 109 155 0 120Z" fill="#365E4D"/>
<path d="M0 467C131 375 238 407 353 448C475 492 606 405 768 420V1200H0Z" fill="var(--far)"/>
<path d="M0 674C137 566 257 593 395 646C508 689 630 627 768 600V1200H0Z" fill="var(--mid)"/>
<path d="M0 895C128 784 264 802 393 854C510 901 636 858 768 815V1200H0Z" fill="var(--near)"/>
<g fill="#294F43"><path d="M72 0h73l-10 845l-49 71Z"/><path d="M641 0h75l-27 854l-53 74Z"/></g>
<g fill="#4B755B"><path d="M105 0h16l-8 826l-16 47Z"/><path d="M674 0h15l-24 829l-13 49Z"/></g>
<path d="M280 947C321 861 400 811 499 804C571 799 634 815 703 847" fill="none" stroke="#EAD9A7" stroke-width="42" stroke-linecap="round"/>
<ellipse cx="395" cy="567" rx="122" ry="80" fill="#D7DAA7" opacity=".72"/>
<path d="M383 647V529c0-43 33-58 48-58s48 15 48 58v118" fill="none" stroke="#496950" stroke-width="24"/>
<g fill="#D58A72"><path d="M201 799c0-28 23-49 51-49s51 21 51 49Z"/><path d="M535 864c0-23 19-41 42-41s42 18 42 41Z"/></g>
<g fill="#F1D79C"><circle cx="308" cy="520" r="7"/><circle cx="526" cy="605" r="6"/><circle cx="401" cy="716" r="5"/></g>`,
/* Zandbloei - canyon terraces, modest portal, clear negative space. */
`<circle cx="594" cy="171" r="76" fill="var(--sun)"/>
<path d="M0 405L108 351l78-92l120 33l72 127l126-90l91 43l68-97l105 59V1200H0Z" fill="var(--far)"/>
<path d="M0 621C151 530 273 548 391 604C512 663 631 577 768 561V1200H0Z" fill="var(--mid)"/>
<path d="M0 850C137 755 281 781 414 830C553 881 653 831 768 794V1200H0Z" fill="var(--near)"/>
<path d="M479 730V532c0-108 162-108 162 0v198" fill="none" stroke="#F2C389" stroke-width="70" stroke-linecap="square"/>
<path d="M479 730V535c0-79 162-79 162 0v195" fill="none" stroke="#925846" stroke-width="35" stroke-linecap="square"/>
<path d="M449 741h222M435 775h250" stroke="#E9B076" stroke-width="25" stroke-linecap="square"/>
<path d="M209 861V704m0 91h-47v-51m47 22h43v-58" fill="none" stroke="#527565" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M602 955V879m0 43h30v-37" fill="none" stroke="#668372" stroke-width="22" stroke-linecap="round"/>
<path d="M344 931C393 881 467 849 549 842C620 836 685 849 752 876" fill="none" stroke="#F5CD91" stroke-width="45" stroke-linecap="round"/>
<path d="M0 1065C167 996 319 1018 448 1060C558 1096 668 1077 768 1032V1200H0Z" fill="#704C45"/>`,
/* Nachtkas - greenhouse on one illuminated terrace. */
`<path d="M139 118a64 64 0 1 0 82 82a66 66 0 0 1-82-82Z" fill="var(--sun)"/>
<path d="M0 423C127 339 264 363 380 411C505 463 624 369 768 386V1200H0Z" fill="var(--far)"/>
<path d="M0 647C161 545 303 578 422 622C544 667 654 620 768 590V1200H0Z" fill="var(--mid)"/>
<path d="M0 882C137 781 280 808 409 852C535 895 647 863 768 824V1200H0Z" fill="var(--near)"/>
<path d="M231 724V568l93-139l173-38l143 106v227Z" fill="#6F8C83"/>
<path d="M258 704V574l78-119l154-34l125 94v189Z" fill="#D8D09B"/>
<g fill="none" stroke="#274B55" stroke-width="13" stroke-linejoin="round"><path d="M231 724V568l93-139l173-38l143 106v227Z"/><path d="M231 568l172-38l94-139"/><path d="M403 530l237-33"/><path d="M403 530v194M497 391v333M307 481l-4 243"/></g>
<path d="M422 724V626c0-59 75-59 75 0v98Z" fill="#F4E4AF" stroke="#274B55" stroke-width="10"/>
<path d="M177 918C245 834 335 802 442 805C542 807 625 842 709 903" fill="none" stroke="#748D80" stroke-width="44" stroke-linecap="round"/>
<g fill="#F1D596"><circle cx="141" cy="347" r="7"/><circle cx="649" cy="314" r="5"/><circle cx="697" cy="518" r="6"/></g>
<g fill="#36675D"><path d="M86 1028c-31-99-15-193 27-242c38 64 39 158 6 242Z"/><path d="M678 1057c-30-91-16-178 27-227c31 59 35 145 6 227Z"/></g>`,
/* Sterrenweide - observatory/orbit instrument and layered hills. */
`<g fill="#E9DFAF"><circle cx="148" cy="137" r="5"/><circle cx="328" cy="196" r="4"/><circle cx="636" cy="111" r="5"/><path d="m560 194 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z"/></g>
<path d="M0 421L119 303l122 117l126-142l139 147l132-121l130 112V1200H0Z" fill="var(--far)"/>
<path d="M0 638C144 533 280 564 402 618C531 676 636 609 768 579V1200H0Z" fill="var(--mid)"/>
<path d="M0 873C135 769 278 791 411 843C533 890 651 857 768 818V1200H0Z" fill="var(--near)"/>
<path d="M384 717V539" stroke="#DDD4AD" stroke-width="15"/>
<path d="M328 710h112v27H328Z" fill="#D6C69C"/>
<ellipse cx="384" cy="539" rx="107" ry="37" fill="none" stroke="#E8D89B" stroke-width="17" transform="rotate(-24 384 539)"/>
<ellipse cx="384" cy="539" rx="39" ry="97" fill="none" stroke="#A8C1A9" stroke-width="14" transform="rotate(-24 384 539)"/>
<circle cx="384" cy="539" r="27" fill="#F2D786"/><circle cx="464" cy="501" r="16" fill="#F2D786"/>
<path d="M281 951C343 862 429 825 531 832C613 838 672 871 734 918" fill="none" stroke="#C9D2A7" stroke-width="45" stroke-linecap="round"/>
<g fill="#315D63"><path d="M66 1080c11-83 41-145 84-187c6 75-20 137-56 187Z"/><path d="M650 1084c-8-91 17-158 59-207c15 76-3 144-28 207Z"/></g>`
];
function world(index){return Number.isInteger(index)&&index>=0&&index<6?index:0;}
function make(index,viewBox,cls='',kind='scene'){
 index=world(index);const p=palettes[index],id='l53-'+index+'-'+(++serial),c=escClass(cls);
 const body=bodies[index].replaceAll('var(--far)',p.far).replaceAll('var(--mid)',p.mid).replaceAll('var(--near)',p.near).replaceAll('var(--sun)',p.accent).replaceAll('var(--scene-ink)',p.ink);
 return `<svg xmlns="http://www.w3.org/2000/svg" class="landscape scene-art ${c}" data-scene="${sceneNames[index]}" data-kind="${kind}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${p.top}"/><stop offset="1" stop-color="${p.bottom}"/></linearGradient><linearGradient id="${id}-veil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF" stop-opacity=".18"/><stop offset=".55" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#142B31" stop-opacity=".08"/></linearGradient></defs><g><path data-sky="opaque" d="M0 0h768v1200H0Z" fill="url(#${id}-sky)"/>${body}<path d="M0 0h768v1200H0Z" fill="url(#${id}-veil)"/></g></svg>`;
}
function backdrop(index=0,cls=''){return make(index,'0 0 768 1200',cls,'backdrop');}
function mapBackdrop(index=0,cls=''){return make(index,'0 120 768 980',cls,'map');}
function scenery(index=0,cls=''){return make(index,'0 320 768 480',cls,'card');}
function routeArt(index=0){return `<div class="route-art">${scenery(index,'scene-hero')}</div>`;}
function mark(){return '<svg xmlns="http://www.w3.org/2000/svg" class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M20 15v23a11 11 0 0 0 11 11h16" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/><circle cx="20" cy="15" r="9" fill="currentColor"/><circle cx="20" cy="15" r="3.5" fill="var(--bg,#FAF8F1)"/><circle cx="47" cy="49" r="8" fill="#E9AE50"/></svg>';}
function wordmark(){return '<svg xmlns="http://www.w3.org/2000/svg" class="brand-wordmark" viewBox="0 0 165 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v31q0 8 8 8M31 28v13q0 11 11 11t11-11V28M71 52V28m0 11q0-12 10-12t10 12v13m0-13q0-12 10-12t10 12v13M153 40a12 12 0 1 0-24 0a12 12 0 1 0 24 0m0-12v24"/></g></svg>';}
function logo(){return `<span class="brand atelier-brand">${mark()}${wordmark()}</span>`;}
const exported={...A,scenery,backdrop,mapBackdrop,routeArt,mark,wordmark,logo,sceneNames:sceneNames.slice(),artVersion:'5.3.0'};
root.LumaStudioArt=exported;
if(typeof module!=='undefined')module.exports=exported;
})(typeof window!=='undefined'?window:globalThis);
