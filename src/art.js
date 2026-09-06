/* All illustration and interface marks are original SVG paths, not emoji fonts. */
const LumaArt = (() => {
  const paths = {
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back:'<path d="m14 6-6 6 6 6"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    sound:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="sound-wave" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    settings:'<path d="M4 7h7m5 0h4M4 17h3m5 0h8"/><circle cx="13" cy="7" r="3"/><circle cx="9" cy="17" r="3"/>',
    home:'<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
    worlds:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    garden:'<path d="M12 21v-8M12 19c-5 0-7-3-7-6 5 0 7 3 7 6Zm0-2c5 0 7-3 7-6-5 0-7 3-7 6Z"/><path d="M12 13c-8-2-7-8-4-8 0-5 8-5 8 0 3 0 4 6-4 8Z"/>',
    undo:'<path d="m8 4-5 5 5 5M3 9h10a6 6 0 0 1 0 12h-3"/>',
    restart:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    hint:'<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3.5h.01"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20 14.5A9 9 0 0 1 9.5 4 9 9 0 1 0 20 14.5Z"/>',
    sparkle:'<path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    share:'<path d="M12 15V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',
    infinity:'<path d="M12 12c-3-5-8-6-9-2-2 6 5 10 9 2 4-8 11-4 9 2-1 4-6 3-9-2Z"/>',
    leaf:'<path d="M5 20c0-9 7-14 15-16 1 12-5 19-13 13m-3 4 10-11"/>',
    portal:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><circle cx="12" cy="12" r="4"/>',
    flower:'<path d="M12 8C5-1 1 8 8 12c-9 7 0 11 4 4 7 9 11 0 4-4 9-7 0-11-4-4Z"/><circle cx="12" cy="12" r="2"/>',
    touch:'<path d="M9 14V6a2 2 0 0 1 4 0v6c5-3 8-1 7 4l-1 5H9l-5-7a2 2 0 0 1 3-2l2 2Z"/>',
    pin:'<path d="m12 3 9 9-9 9-9-9Z"/>',
    volume:'<path d="M4 15V9m5 10V5m6 12V7m5 8V9"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
  };
  function icon(name, cls = '') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`; }
  function logo() { return `<svg class="logo" viewBox="0 0 222 52" aria-label="Luma" role="img"><g fill="#CC4833"><path d="M25 25C7 27 1 12 11 8 20 4 27 14 25 25Z"/><path d="M25 25C23 7 38 1 42 11 46 20 36 27 25 25Z"/><path d="M25 25C43 23 49 38 39 42 30 46 23 36 25 25Z"/><path d="M25 25C27 43 12 49 8 39 4 30 14 23 25 25Z"/></g><circle cx="25" cy="25" r="5" fill="#F4DFA8"/><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M69 9v24q0 9 10 9M94 19v13q0 10 10 10t10-10V19M132 42V26q0-8 8-8t8 8v16m0-16q0-8 8-8t8 8v16"/><circle cx="193" cy="30" r="12"/><path d="M205 19v23"/></g></svg>`; }
  function petalPaths(cx=50,cy=50,r=23,count=6,color='currentColor') { return Array.from({length:count},(_,i)=>`<ellipse cx="${cx}" cy="${cy-r*.56}" rx="${r*.48}" ry="${r*.73}" transform="rotate(${i*360/count} ${cx} ${cy})" fill="${color}"/>`).join(''); }
  function flower(world=0, cls='', happy=true) { const w=LumaEngine.WORLDS[world]; return `<svg class="${cls}" viewBox="0 0 160 160" aria-hidden="true"><g transform="translate(30 30)">${petalPaths(50,50,35,6,w.color)}<circle cx="50" cy="50" r="24" fill="${w.light}"/>${happy ? '<g fill="'+w.ink+'"><ellipse cx="43" cy="48" rx="2" ry="3"/><ellipse cx="57" cy="48" rx="2" ry="3"/></g><path d="M46 57q4 4 8 0" fill="none" stroke="'+w.ink+'" stroke-width="2" stroke-linecap="round"/>' : ''}</g><path d="m127 20 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="${w.petal}"/><circle cx="25" cy="117" r="4" fill="${w.petal}"/><circle cx="129" cy="123" r="3" fill="${w.color}"/></svg>`; }
  function hero() { return `<svg viewBox="0 0 550 460" aria-hidden="true">
    <circle cx="302" cy="221" r="186" fill="#D5C9E5"/>
    <path d="M171 391V176a79 79 0 0 1 158 0v215" fill="#B29DCC"/>
    <path d="M209 391V181a41 41 0 0 1 82 0v210" fill="#E9DEED"/>
    <path d="M100 351v-50q0-54 54-54h22" fill="none" stroke="#4F796C" stroke-width="35" stroke-linecap="round"/>
    <path d="M102 351v-50q0-54 54-54h20" fill="none" stroke="#A9C0A7" stroke-width="2" stroke-linecap="round" class="flow-line"/>
    <path d="M287 267v67q0 46 46 46h62q34 0 34-34v-40" fill="none" stroke="#EF825F" stroke-width="31" stroke-linecap="round"/>
    <path d="M287 267v67q0 46 46 46h62q34 0 34-34v-40" fill="none" stroke="#FFE7BD" stroke-width="3" stroke-linecap="round" class="flow-line"/>
    <g class="flower-spin">${petalPaths(290,207,80,8,'#ED7853')}</g>
    <circle cx="290" cy="207" r="56" fill="#F6D991"/>
    <g class="face-eyes" fill="#4A3938"><ellipse cx="277" cy="203" rx="3.2" ry="5.3"/><ellipse cx="303" cy="203" rx="3.2" ry="5.3"/></g>
    <path d="M282 220q8 7 16 0" fill="none" stroke="#4A3938" stroke-width="2.8" stroke-linecap="round"/>
    <g class="orb-float"><circle cx="101" cy="350" r="46" fill="#F8F0DD"/><circle cx="101" cy="350" r="30" fill="none" stroke="#C7BAD9" stroke-width="2"/><circle cx="101" cy="350" r="20" fill="#9DBACA"/><path d="M94 350h14m-7-7v14" stroke="#F8F0DD" stroke-width="2" stroke-linecap="round"/></g>
    <g class="orb-float alt"><path d="M430 315c-36-4-51-24-43-49 24-1 44 18 43 49Z" fill="#4F796C"/><path d="M430 315c-5-39 11-61 34-57 8 25-9 49-34 57Z" fill="#8AA889"/><path d="m426 310-20-28m24 28 16-29" stroke="#E3E5CA" stroke-width="1.6" fill="none"/></g>
    <g transform="translate(431 91) rotate(13)"><circle r="38" fill="#F4E6C5"/><circle r="31" stroke="#C8B694" fill="none" stroke-width="1"/><path d="M-10 0h20M0-10v20" stroke="#A8815E" stroke-width="2" stroke-linecap="round"/><circle r="5" fill="#F4E6C5" stroke="#A8815E" stroke-width="1.5"/></g>
    <g class="sparkle" fill="#75628E"><path d="M108 112c0 15-6 21-21 21 15 0 21 6 21 21 0-15 6-21 21-21-15 0-21-6-21-21Z"/></g>
    <g class="sparkle alt" fill="#F8F0DD"><path d="M415 180c0 11-4 15-15 15 11 0 15 4 15 15 0-11 4-15 15-15-11 0-15-4-15-15Z"/></g>
    <circle cx="194" cy="66" r="6" fill="#ED7853"/><circle cx="475" cy="221" r="4" fill="#75628E"/><circle cx="202" cy="352" r="4" fill="#F6D991"/>
    <path d="M167 415q23-10 46 0t46 0t46 0t46 0" fill="none" stroke="#9C88B6" stroke-width="1.4"/>
    <path d="M170 424q23-10 46 0t46 0t46 0t46 0" fill="none" stroke="#9C88B6" stroke-width="1.4" opacity=".5"/>
  </svg>`; }
  function scene(world=0,cls='') {
    const w=LumaEngine.WORLDS[world];
    return `<svg class="${cls}" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="106" r="89" fill="${w.board}"/><path d="M56 184v-63a52 52 0 0 1 104 0v63" fill="${w.petal}"/><path d="M83 184v-62a25 25 0 0 1 50 0v62" fill="${w.bg}"/><path d="M46 169h27q38 0 38-38V88" fill="none" stroke="${w.color}" stroke-width="11" stroke-linecap="round"/>${petalPaths(111,80,31,5,w.color)}<circle cx="111" cy="80" r="18" fill="${w.light}"/><g fill="${w.ink}"><circle cx="106" cy="78" r="1.5"/><circle cx="116" cy="78" r="1.5"/></g><path d="M151 183c-2-29 14-43 32-42 0 23-14 37-32 42Z" fill="${w.color}"/><circle cx="48" cy="68" r="8" fill="${w.light}"/><path d="m175 63 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="${w.color}"/><path d="M36 195h150" stroke="${w.muted}" stroke-width="1"/></svg>`;
  }
  function worldMark(i) { const w=LumaEngine.WORLDS[i]; return `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28" fill="${w.board}"/>${i===0?`<circle cx="30" cy="30" r="13" fill="${w.color}"/><circle cx="30" cy="30" r="7" fill="${w.light}"/>`:i===1?`<path d="M12 24q9-9 18 0t18 0M12 34q9-9 18 0t18 0" stroke="${w.color}" stroke-width="6" fill="none" stroke-linecap="round"/>`:i===2?petalPaths(30,30,15,5,w.color)+`<circle cx="30" cy="30" r="6" fill="${w.light}"/>`:i===3?`<path d="m30 11 17 10v19L30 49 13 40V21Z" fill="${w.color}"/><circle cx="30" cy="30" r="9" fill="${w.light}"/>`:i===4?`<circle cx="30" cy="30" r="16" fill="none" stroke="${w.color}" stroke-width="8"/><circle cx="35" cy="17" r="5" fill="${w.light}"/>`:`<path d="M14 38 24 19l9 20 12-22" fill="none" stroke="${w.color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`}</svg>`; }
  function garden(world,completed) {
    const w=LumaEngine.WORLDS[world];
    let flowers='';
    const coords=[[52,120],[90,80],[139,103],[183,68],[221,123],[76,155],[119,151],[166,142],[199,163],[43,72],[142,50],[237,78]];
    coords.forEach(([x,y],j)=> { const done=Boolean(completed[world*12+j]); flowers+=`<path d="M${x} 192Q${x-15} ${y+40} ${x} ${y}" fill="none" stroke="${done?w.color:w.muted}" stroke-width="${done?2:1}" opacity="${done?.6:.18}"/>`; if(done) flowers+=`<g>${petalPaths(x,y,11+(j%3)*2,5+j%2,w.color)}<circle cx="${x}" cy="${y}" r="5" fill="${w.light}"/></g>`; else flowers+=`<circle cx="${x}" cy="${y}" r="4" fill="${w.muted}" opacity=".2"/>`; });
    return `<svg viewBox="0 0 280 215" aria-hidden="true"><circle cx="218" cy="43" r="20" fill="${w.light}"/><path d="M0 188q70-20 140 0t140 0v27H0Z" fill="${w.petal}" opacity=".45"/>${flowers}<path d="M72 190h140l-19 25H91Z" fill="${w.color}" opacity=".75"/></svg>`;
  }
  function lights(n,large=false) { return `<div class="light-dots${large?' large':''}" aria-label="${n} van 3 lichtjes">${[0,1,2].map(i=>icon('sparkle',i<n?'':'off')).join('')}</div>`; }
  return { icon, logo, flower, hero, scene, worldMark, garden, lights, petalPaths };
})();
