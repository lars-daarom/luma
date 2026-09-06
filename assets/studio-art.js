/* Luma 5.0.0. Original, opaque vector artwork. No characters or external assets. */
(function(root){
'use strict';
const worlds=[
 {name:'Zonnetuin',tag:'Het begint met een vonk',description:'Korte routes, nieuwe richtingen.',accent:'#CC5A43',soft:'#F8DFCA',sky:'#F6E9D2',hill:'#C7D6AD',deep:'#789D80',ink:'#2E4147',bg:'#FAF8F1',rest:'#C6CDC4',rule:'De basis',symbol:'sun'},
 {name:'Regendauw',tag:'Vind de stroom',description:'Draai om de vaste punten heen.',accent:'#297F88',soft:'#DCEEE9',sky:'#DDEEF0',hill:'#ADCAC6',deep:'#6B9F9E',ink:'#29464C',bg:'#F3F8F5',rest:'#B9CED0',rule:'Vaste punten',symbol:'drop'},
 {name:'Fluisterbos',tag:'Kies je eigen pad',description:'Meer takken. Meer mogelijkheden.',accent:'#538367',soft:'#E4EBCF',sky:'#E6EDD9',hill:'#B1C9A0',deep:'#6E9575',ink:'#30483C',bg:'#F7F8EF',rest:'#C3CFBE',rule:'Vertakkingen',symbol:'branch'},
 {name:'Zandbloei',tag:'Denk voorbij de horizon',description:'Twee poorten, een nieuwe verbinding.',accent:'#B9603C',soft:'#F4E0C7',sky:'#F8E7CB',hill:'#E7BC97',deep:'#C88A68',ink:'#4C403A',bg:'#FCF7ED',rest:'#CEC3AD',rule:'Lichtpoorten',symbol:'portal'},
 {name:'Nachtkas',tag:'Alles komt samen',description:'Ontdek de kracht van een omweg.',accent:'#D4B3E9',soft:'#46465F',sky:'#353D55',hill:'#454E69',deep:'#59647E',ink:'#F6F1E6',bg:'#292F42',rest:'#727D93',rule:'Kringlopen',symbol:'moon'},
 {name:'Sterrenweide',tag:'Het grotere geheel',description:'Combineer alles wat je hebt ontdekt.',accent:'#427D81',soft:'#DDEDDD',sky:'#E6F0E6',hill:'#B6D3C5',deep:'#709D9C',ink:'#2E4A4C',bg:'#F2F8F2',rest:'#BECECC',rule:'De combinatie',symbol:'star'}
];
const paths={
 back:'<path d="m14.5 5-7 7 7 7"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
 play:'<path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
 home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
 worlds:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 collection:'<path d="M5 5h14v16l-7-4-7 4Z"/><path d="m9 10 2 2 4-4"/>',
 settings:'<path d="M3 7h7m6 0h5M3 17h3m6 0h9"/><circle cx="13" cy="7" r="3"/><circle cx="9" cy="17" r="3"/>',
 sound:'<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="M15 8a6 6 0 0 1 0 8m4-12a11 11 0 0 1 0 16"/>',mute:'<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
 undo:'<path d="M4 4v6h6"/><path d="M4 10a8 8 0 1 1 2 8"/>',restart:'<path d="M20 4v6h-6"/><path d="M20 10a8 8 0 1 0-2 8"/>',
 hint:'<path d="M8 15a6 6 0 1 1 8 0l-1 3H9Z"/><path d="M9 21h6m-5-3h4"/>',
 spark:'<path d="m14 2-9 12h6l-1 8 9-12h-6Z" fill="currentColor" stroke="none"/>',
 star:'<path d="m12 2 3.1 6.5 7.1 1-5.1 5 .9 7.1-6-3.4-6 3.4.9-7.1-5.1-5 7.1-1Z"/>',
 check:'<path d="m5 12 4 4 10-10"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 4v.1"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
 drop:'<path d="M12 2C10 7 5 10 5 15a7 7 0 0 0 14 0c0-5-5-8-7-13Z"/>',
 branch:'<path d="M12 21V4m0 10-7-7m7 11 7-7"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="10" r="2"/><circle cx="12" cy="3" r="2"/>',
 portal:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="M8 10h8m-8 4h8"/>',
 moon:'<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
 pin:'<rect x="7" y="7" width="10" height="10" rx="2"/>',
 infinity:'<path d="M12 12c-2-5-9-5-9 0s7 5 9 0 9-5 9 0-7 5-9 0Z"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 share:'<path d="M12 15V2m-5 5 5-5 5 5M7 10H4v12h16V10h-3"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 tune:'<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2" fill="var(--card)"/><circle cx="16" cy="12" r="2" fill="var(--card)"/><circle cx="10" cy="19" r="2" fill="var(--card)"/>'
};
function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.target}</svg>`;}
function mark(){return '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M11 11v14a7 7 0 0 0 14 0V15" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="11" cy="10" r="5" fill="currentColor"/><circle cx="25" cy="10" r="5" fill="var(--secondary,#74A49B)"/></svg>';}
function logo(){return `<span class="brand">${mark()}<span>luma</span></span>`;}
function stars(n){return `<span class="stars" aria-label="${n} van 3 sterren">${[1,2,3].map(i=>icon('star',i<=n?'filled':'')).join('')}</span>`;}
function scenery(index=0,cls=''){
 const w=worlds[index],night=index===4;
 let detail='';
 if(index===0)detail='<path d="M48 219v-38m-7 12h14M110 227v-31m-5 10h11" stroke="#719985" stroke-width="5" stroke-linecap="round"/><circle cx="47" cy="176" r="8" fill="#CD6650"/><circle cx="111" cy="189" r="6" fill="#EAC477"/>';
 if(index===1)detail='<ellipse cx="318" cy="233" rx="220" ry="23" fill="#78AEAF"/><path d="M189 229h74m53 13h85m-39-25h61" stroke="#D9EEDE" stroke-width="4" stroke-linecap="round"/><path d="m97 100-5 15m61-28-5 15m241 7-5 15m48-36-5 15" stroke="#9ECBCF" stroke-width="4" stroke-linecap="round"/>';
 if(index===2)detail='<g fill="#628F77"><path d="m48 101-35 106h70Zm84 24-29 91h58ZM548 89l-39 122h78Zm-81 47-26 79h52Z"/></g><g stroke="#4C755F" stroke-width="6"><path d="M48 164v67m84-44v44m416-70v68m-81-36v38"/></g>';
 if(index===3)detail='<g fill="none" stroke="#76927A" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"><path d="M504 225V124m0 63h22v-29m-22 13h-23v-22M112 228v-38m0 22h-13v-12"/></g><path d="m331 251 4-6 4 6m-77-5 3-5 3 5" fill="#B98663"/>';
 if(index===4)detail='<path d="M228 233v-56a91 91 0 0 1 182 0v56Zm40 0v-57c0-102 102-102 102 0v57M319 84v149m-91-51h182" fill="none" stroke="#8996AE" stroke-width="3"/><g fill="#F1D18E"><circle cx="119" cy="79" r="3"/><circle cx="450" cy="115" r="3"/><path d="m556 61 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>';
 if(index===5)detail='<g fill="#719C99"><path d="m91 155 4 10 10 4-10 4-4 10-4-10-10-4 10-4Zm458-61 5 13 13 5-13 5-5 13-5-13-13-5 13-5Z"/></g><path d="M177 219c93-80 150 60 235-25" fill="none" stroke="#D8E3AD" stroke-width="12" stroke-linecap="round"/>';
 return `<svg class="landscape ${cls}" viewBox="0 0 640 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path fill="${w.sky}" d="M0 0h640v280H0Z"/>${night?'<path d="M500 46a29 29 0 1 0 38 38 30 30 0 0 1-38-38" fill="#F4D997"/>':`<circle class="landscape-sun" cx="508" cy="67" r="34" fill="${index===1?'#EAF2DE':'#F0CD83'}"/>`}<path d="M0 171Q100 99 229 180T453 169T640 155V280H0Z" fill="${w.hill}"/><path d="M0 232Q149 166 282 220T640 186V280H0Z" fill="${w.deep}"/><path d="M0 255Q143 218 315 248T640 232V280H0Z" fill="${w.hill}"/>${detail}<g class="sky-cloud" fill="${night?'#46506A':'#FFF9EB'}"><path d="M101 75c0-15 26-15 26 0 16-5 26 3 26 11H81c0-11 8-17 20-11Z"/></g></svg>`;
}
function routeArt(index=0){const w=worlds[index];return `<div class="route-art">${scenery(index)}<svg class="route-overlay" viewBox="0 0 640 280" aria-hidden="true"><path d="M138 188h120q28 0 28-28V112q0-28 28-28h57q28 0 28 28v52q0 28 28 28h65" fill="none" stroke="${w.bg}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/><path d="M138 188h120q28 0 28-28V112q0-28 28-28h57q28 0 28 28v52q0 28 28 28h65" fill="none" stroke="${w.accent}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="188" r="19" fill="${w.accent}"/><circle cx="138" cy="188" r="7" fill="${w.bg}"/><circle cx="492" cy="192" r="17" fill="${w.bg}" stroke="${w.accent}" stroke-width="6"/><circle class="route-dot" cx="342" cy="84" r="8" fill="#F1CA76"/></svg></div>`;}
function pipe(mask){if(mask===3)return 'M50 -1V25Q50 50 75 50H101';if(mask===6)return 'M101 50H75Q50 50 50 75V101';if(mask===12)return 'M50 101V75Q50 50 25 50H-1';if(mask===9)return 'M-1 50H25Q50 50 50 25V-1';if(mask===5)return 'M50 -1V101';if(mask===10)return 'M-1 50H101';return [[1,50,-1],[2,101,50],[4,50,101],[8,-1,50]].filter(d=>mask&d[0]).map(d=>`M50 50L${d[1]} ${d[2]}`).join('');}
root.LumaStudioArt={worlds,icon,logo,mark,stars,scenery,routeArt,pipe};
if(typeof module!=='undefined')module.exports=root.LumaStudioArt;
})(typeof window!=='undefined'?window:globalThis);
