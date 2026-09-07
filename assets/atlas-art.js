/* Luma 5.1.0 - six composed vector postcards and one shared light-path identity.
 * No raster scenery, external fonts, masks, characters or randomly pasted scenery.
 * All definitions use per-instance IDs; multiple worlds may share one document.
 */
(function(root){
'use strict';
const A=root.LumaStudioArt || (typeof require==='function'?require('./studio-art.js'):null);
if(!A)throw new Error('LumaStudioArt must load before atlas-art.js');
let serial=0;
const palettes=[['#FBEAC7','#F8D4AD'],['#D7F0EE','#92CECF'],['#CDE3BA','#F3E9BA'],['#FFE7BD','#F8BD8B'],['#142E4C','#435B79'],['#495F7E','#B8C9C7']];
const names=['zonnetuin','regendauw','fluisterbos','zandbloei','nachtkas','sterrenweide'];
const descriptions=[
 'Een zonovergoten terrastuin. Het pad leidt tussen cipressen door naar een warme tuinpoort.',
 'Een stenen boogbrug verbindt twee oevers boven een blauwe vijver met waterlelies en riet.',
 'Hoge bomen omlijsten een lichte open plek. Een kronkelpad verdwijnt tussen de stammen.',
 'Een zandstenen lichtpoort staat in een kloof. Terrassen, duinen en cactussen vormen een landschap.',
 'Een verlichte kas staat tussen nachtblauwe planten. De trappen leiden naar de glazen ingang.',
 'Een sterreninstrument kijkt uit over een weide. Verlichte stapstenen verbinden de groene terrassen.'
];
const scenes=[
/* SUN GARDEN: terraced wall and entrance share one ground plane. */
`<circle cx="574" cy="113" r="65" fill="#F5B653"/>
<path d="M0 249C97 170 171 154 269 194S405 201 472 175S644 148 800 208V500H0Z" fill="#B6C69A"/>
<path d="M0 311C128 247 233 243 359 256S568 252 800 294V500H0Z" fill="#829F73"/>
<path d="M154 293V233H526V258H663V336Z" fill="#DA9675"/>
<path d="M154 233H526V245H154Z M526 258H663V270H526Z" fill="#F5C8A0"/>
<path d="M312 286V190A73 73 0 0 1 458 190V290Z" fill="#F9DABB"/>
<path d="M326 286V192A59 59 0 0 1 444 192V290Z" fill="#C87C61"/>
<path d="M340 290V195A45 45 0 0 1 430 195V290Z" fill="#4C7965"/>
<path d="M354 287V198A31 31 0 0 1 416 198V287Z" fill="#AFC48A"/>
<path d="M347 281Q385 250 423 281L431 305H336Z" fill="#F3D6A1"/>
<path d="M0 373Q142 282 331 307T800 314V500H0Z" fill="#A9BF82"/>
<path d="M375 291C359 331 472 324 468 353C461 400 304 382 300 441C299 461 320 482 344 500H510C443 465 405 452 417 432C437 402 538 399 535 354C532 311 414 322 401 291Z" fill="#F4DBAE"/>
<path d="M0 416Q120 334 287 361Q345 371 360 393Q242 405 250 453L284 500H0Z" fill="#769C6E"/>
<path d="M526 412Q651 317 800 356V500H459Q460 446 526 412Z" fill="#648C68"/>
<path d="M127 359V196" stroke="#4C6F59" stroke-width="12" stroke-linecap="round"/>
<path d="M127 90C84 128 67 220 93 266C102 281 116 289 127 290C171 264 176 185 147 124Z" fill="#3F7663"/>
<path d="M127 91C151 168 147 241 127 290C171 264 176 185 147 124Z" fill="#326453"/>
<path d="M551 295V178M607 316V224" stroke="#4C6F59" stroke-width="8"/>
<path d="M551 128C530 158 514 214 534 244Q551 258 568 244C588 214 572 158 551 128Z" fill="#4D8269"/>
<path d="M607 190C588 222 586 253 598 270Q607 280 617 270C632 250 625 218 607 190Z" fill="#426E5B"/>
<path d="M60 500Q75 443 106 414Q105 458 88 500M93 500Q141 431 194 432Q170 476 120 500" fill="#3D6C57"/>
<path d="M731 500Q715 410 735 374Q763 426 753 500M731 500Q688 465 665 419Q719 427 747 500" fill="#3D6C57"/>
<g stroke="#416F57" stroke-width="5" stroke-linecap="round"><path d="M200 401V357M233 414V377M645 390V352M673 407V377"/></g>
<g fill="#EBA56E"><circle cx="200" cy="351" r="12"/><circle cx="233" cy="372" r="10"/></g><g fill="#F7D478"><circle cx="645" cy="347" r="11"/><circle cx="673" cy="371" r="9"/></g>
<path d="M299 334h33m171 40h20m-190 61h31" stroke="#D6B584" stroke-width="4" stroke-linecap="round"/>
<g class="scene-drift" fill="#FFF4D9"><path d="M194 106c0-13 22-19 32-9c6-24 40-24 47-2c22-3 30 10 30 20H183q0-9 11-9Z"/></g>`,
/* RAIN DEW: bridge is a continuous solid arch over the river. */
`<circle cx="584" cy="108" r="47" fill="#EAF3D5"/>
<path d="M0 198Q84 134 159 165T315 173T490 164T800 177V500H0Z" fill="#97BDB2"/>
<path d="M0 274Q78 191 197 234T431 219T800 244V500H0Z" fill="#608F87"/>
<path d="M0 360C131 326 179 307 282 308C457 310 539 374 800 297V500H0Z" fill="#61A6AC"/>
<path d="M0 438C201 362 313 403 458 386S678 362 800 388V500H0Z" fill="#438D98"/>
<path d="M169 334V289C169 216 272 181 393 185C520 189 604 227 604 287V337H546V295C546 261 492 240 392 237C293 234 225 255 225 294V334Z" fill="#D3DDC7"/>
<path d="M169 289C169 216 272 181 393 185C520 189 604 227 604 287" fill="none" stroke="#EDF0D6" stroke-width="15"/>
<path d="M225 334V294C225 255 293 234 392 237C492 240 546 261 546 295V337L527 331V298C527 277 478 257 393 255C310 252 244 267 244 298V329Z" fill="#A4BBAC"/>
<path d="M199 265l17 7m34-43 12 15m42-31 5 19m49-27 1 21m47-20-2 22m45-13-6 22m50-9-10 21m43-1-16 13" stroke="#ACC4B5" stroke-width="3"/>
<path d="M0 340Q76 279 189 294L239 331Q161 345 108 382L0 400Z" fill="#8FAE8C"/>
<path d="M561 320Q680 273 800 317V401C682 359 643 358 573 356Z" fill="#8DAF8D"/>
<path d="M0 340Q82 316 170 314L181 327Q85 340 0 380Z" fill="#D7DFC1"/>
<path d="M607 317Q696 305 800 345V362Q698 324 607 332Z" fill="#D7DFC1"/>
<g class="scene-ripples" fill="none" stroke="#A0CFCA" stroke-width="3" stroke-linecap="round"><path d="M283 357h63m26 12h86m-223 48h108m210-20h82m-227 53h109"/></g>
<path d="M57 457C59 402 38 355 25 349C27 406 36 441 57 457M65 466C57 407 88 369 105 362C91 414 80 447 65 466M716 432C688 378 679 320 687 289C716 326 725 385 716 432M727 434C731 382 760 350 784 346C774 389 751 417 727 434" fill="#2E6D6D"/>
<path d="M0 482Q114 440 170 466T335 500H0ZM659 500Q699 438 800 435V500Z" fill="#2D7078"/>
<path d="M177 386a33 10 0 1 0 1 0l13 9Z M543 433a46 15 0 1 0 1 0l19 14Z" fill="#82B694"/>
<path d="M566 427C544 426 532 413 533 402Q553 402 566 417Q564 394 575 387Q588 401 579 417Q596 408 607 415Q592 432 566 427Z" fill="#FAEBCD"/>
<path d="M556 421q17-9 28 0q-14 9-28 0" fill="#F0C271"/>
<path d="M78 290V169" stroke="#3F7770" stroke-width="10"/>
<path d="M28 241C11 172 53 137 86 139C133 143 149 194 134 258L115 225L101 255L83 214L68 255L51 222Z" fill="#467F74"/>
<g class="scene-rain" stroke="#74ABA9" stroke-width="3" stroke-linecap="round"><path d="m259 81-6 16m80-28-6 16m103 21-6 16m211 38-6 16m48-76-6 16"/></g>`,
/* WHISPER WOOD: canopy, trunks and roots are connected, not floating triangles. */
`<path d="M0 0h800v260Q590 158 423 244Q240 151 0 298Z" fill="#A4BD99"/>
<path d="M108 0h31l14 271-40 35Z M204 0h24l19 253-36 26Z M566 0h29l-6 288-30-28Z M668 0h24l24 313-43-16Z" fill="#839F80"/>
<path d="M0 331Q143 243 333 281T800 261V500H0Z" fill="#87A279"/>
<path d="M348 275C411 288 439 313 411 340C372 376 259 364 224 424L361 500H555C429 436 334 414 412 383C524 339 482 302 381 275Z" fill="#E6D6A1"/>
<path d="M0 426C110 357 238 343 336 350L310 380Q229 388 204 429L272 500H0Z" fill="#537C61"/>
<path d="M461 392Q579 325 800 367V500H519Q478 432 418 417Z" fill="#416D59"/>
<path d="M42 0h66l22 370 65 52-77-17-43 13 16-48Z" fill="#345F4F"/>
<path d="M100 155L177 97l41-84 19 4-37 96-94 79Z M77 208L7 165V128l78 44Z" fill="#345F4F"/>
<path d="M68 0h16l31 368 30 31-40-22Z" fill="#497460"/>
<path d="M690 0h72l-19 332 57 82-79-24-57 30 43-80Z M717 134L605 82 563 0h35l35 61 103 35Z M748 222l52-29v-44l-51 31Z" fill="#2F5A4D"/>
<path d="M712 0h17l-2 337-20 47 7-66Z" fill="#477260"/>
<path d="M0 0h800v44Q739 87 674 55Q628 111 552 70Q509 105 458 66Q401 95 359 51Q289 105 230 64Q194 111 136 66Q46 100 0 74Z" fill="#406E57"/>
<path d="M0 0h800v16Q696 34 624 22Q564 57 492 30Q413 61 345 16Q245 58 179 19Q64 54 0 31Z" fill="#325D4B"/>
<path d="M453 280V189q0-29 22-37q23 11 23 38v90Z" fill="#637E61"/>
<path d="M463 280V193q0-19 12-24q13 5 13 24v87Z" fill="#F0DEA4"/>
<g fill="#6E9673"><path d="M16 500Q30 421 73 410Q65 460 16 500M53 500Q102 432 151 433Q128 482 80 500M660 500Q620 454 606 407Q658 419 680 500M690 500Q696 424 739 406Q736 470 708 500"/></g>
<path d="M167 416v-26m-35 37v-14m455 17v-23" stroke="#EACAA5" stroke-width="8" stroke-linecap="round"/>
<path d="M141 390q4-24 26-24t26 24Z M118 413q1-15 14-15t16 15Z M568 407q3-18 18-18t19 18Z" fill="#C97967"/>
<g fill="#E5B787"><circle cx="165" cy="376" r="3"/><circle cx="178" cy="382" r="3"/><circle cx="584" cy="397" r="2"/></g>
<g class="scene-twinkle" fill="#F6E7AF"><circle cx="356" cy="215" r="3"/><circle cx="555" cy="297" r="3"/><circle cx="294" cy="264" r="2"/></g>`,
/* DESERT BLOOM: a carved gateway grows out of the same sandstone terrace. */
`<circle cx="566" cy="133" r="82" fill="#EEA754"/>
<path d="M0 240L100 210 135 165 227 165 259 231 315 241 344 206 421 206 449 264 548 218 613 235 653 187 739 187 800 234V500H0Z" fill="#DFA07B"/>
<path d="M0 252Q148 202 319 306Q541 221 800 284V500H0Z" fill="#F1BD89"/>
<path d="M0 356Q141 313 320 338T800 309V500H0Z" fill="#D78A61"/>
<path d="M443 318V184Q444 111 515 101Q586 111 588 184V320Z" fill="#E6AA77"/>
<path d="M466 314V187Q466 139 515 129Q563 139 564 187V315Z" fill="#9D6049"/>
<path d="M484 318V190Q484 158 515 151Q548 158 548 190V318Z" fill="#FAD29B"/>
<path d="M443 318h23V185q0-50 49-56v-28q-70 10-72 83Z" fill="#F8CA94"/>
<path d="M411 323h212v16H411Z M397 339h241v16H397Z" fill="#B97554"/>
<path d="M410 317h214v10H410Z M397 335h241v10H397Z" fill="#F4C58F"/>
<path d="M506 355C483 381 418 373 400 397C379 424 476 451 518 500H720C670 431 504 421 464 405C490 391 539 381 544 355Z" fill="#F6CE96"/>
<path d="M0 407Q139 370 265 409L318 451 306 500H0Z" fill="#B86F50"/>
<path d="M0 423Q118 394 230 420L272 442Q127 421 0 453Z" fill="#C98158"/>
<path d="M575 399Q685 342 800 362V500H737Q685 430 575 399Z" fill="#C17B55"/>
<path d="M165 399V265m0 76h-34q-19 0-19-19v-31m53 35h32q18 0 18-18v-27" fill="none" stroke="#557A67" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M158 270v119m-36-84v22m81-42v21" fill="none" stroke="#83A181" stroke-width="4" stroke-linecap="round"/>
<path d="M669 377v-54m0 32h21v-17" fill="none" stroke="#688771" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M61 500Q40 447 48 431Q80 456 80 500M78 500Q83 450 110 442Q107 478 91 500M757 500Q713 470 701 439Q748 449 771 500" fill="#587A66"/>
<g fill="#F2BC76"><path d="m154 443 8-9 8 9Z m-30 36 5-6 6 6Z m567-61 7-7 8 7Z"/></g>
<path d="M266 297q45-8 82 3m-50-21q26-4 42 1M591 454q42 12 62 29" fill="none" stroke="#DB9A69" stroke-width="4" stroke-linecap="round"/>
<path class="scene-drift" d="M161 93h107m-71-11h37" stroke="#FFEDD0" stroke-width="6" stroke-linecap="round"/>`,
/* NIGHT CONSERVATORY: glass panels, frame, plants and steps share perspective. */
`<path d="M182 69a47 47 0 1 0 58 60a49 49 0 0 1-58-60Z" fill="#F4D996"/>
<g fill="#AAC5D6"><circle cx="294" cy="54" r="2"/><circle cx="514" cy="53" r="3"/><circle cx="607" cy="112" r="2"/><circle cx="714" cy="60" r="2"/><circle cx="79" cy="173" r="2"/></g>
<path d="M0 271Q97 180 232 238T441 227T800 232V500H0Z" fill="#334F65"/>
<path d="M0 352Q170 259 340 314T800 300V500H0Z" fill="#234755"/>
<path d="M236 328V230L292 141 426 112 539 193 539 327Z" fill="#CEB57A"/>
<path d="M251 317V232l50-78 121-27 102 74v116Z" fill="#E4D091"/>
<path d="M251 232l103-22 68-83-121 27Z" fill="#A9B9A1"/>
<path d="M354 210l70-84 99 76v115H354Z" fill="#EEDB9F"/>
<path d="M251 235l103-22v105H251Z" fill="#799588"/>
<path d="M282 317V257q-27-6-27-32q31 5 32 31q-1-44 23-50q7 27-16 52l2 59Z M492 318v-62q-30-7-29-31q24 3 29 26q-7-44 10-59q20 26 0 62v64Z" fill="#6A8D77"/>
<path d="M371 317v-44q-22-13-27-39q32 4 35 35q5-43 30-52q2 35-20 58v42Z" fill="#86A183"/>
<g fill="none" stroke="#456568" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M236 328V230L292 141 426 112 539 193V327ZM236 230l118-20 72-98m-72 98 185-17M354 210v118m72-216v216m-119-189-6 180m-44-46 280-14m-59-108v173"/></g>
<path d="M404 328v-62a22 22 0 0 1 44 0v62Z" fill="#F9E7B1" stroke="#456568" stroke-width="6"/>
<path d="M426 264v63" stroke="#81977E" stroke-width="4"/>
<path d="M224 328h329v14H224Z M348 342h133v16H348Z M329 358h171v17H329Z" fill="#284953"/>
<path d="M224 323h329v7H224Z M348 339h133v7H348Z M329 355h171v8H329Z" fill="#708D87"/>
<path d="M367 375C334 401 344 420 408 435L491 500H643C566 437 493 426 445 411Q400 398 432 375Z" fill="#758D82"/>
<path d="M0 441Q124 362 279 391Q314 409 323 432Q217 451 188 500H0Z" fill="#193B49"/>
<path d="M526 408Q648 344 800 397V500H654Q605 445 526 408Z" fill="#173846"/>
<g fill="#38665F"><path d="M85 489Q51 386 79 326Q121 402 97 489M85 460Q27 427 12 383Q67 391 85 460M93 467Q147 395 179 402Q166 455 93 467M663 484Q638 402 666 351Q698 423 678 484M678 475Q737 405 780 419Q746 470 678 475"/></g>
<g fill="#D8BD83"><path d="M185 409v-31h6v31Zm409-32v-33h6v33Z"/><circle class="scene-twinkle" cx="188" cy="372" r="9"/><circle class="scene-twinkle" cx="597" cy="338" r="8"/></g>
<path d="m671 181 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="#F4D996"/>`,
/* STAR MEADOW: an orrery is anchored on a hilltop, with a continuous stepping path. */
`<path d="M0 237L109 145 203 246 317 162 439 247 582 164 677 249 800 171V500H0Z" fill="#8CA6AA"/>
<path d="M0 306Q187 207 369 287T800 248V500H0Z" fill="#6B9690"/>
<path d="M0 407Q98 324 230 339T474 305T800 337V500H0Z" fill="#497E79"/>
<path d="M248 343Q317 232 414 240Q501 245 565 343Z" fill="#65958B"/>
<path d="M408 198h12v87h-12Z M385 280h59v10h-59Z M374 290h80v12h-80Z" fill="#D8CA9B"/>
<path d="M414 116v77" stroke="#D9D3AF" stroke-width="5"/>
<ellipse cx="414" cy="175" rx="57" ry="18" fill="none" stroke="#E5D8A7" stroke-width="6" transform="rotate(-28 414 175)"/>
<ellipse cx="414" cy="175" rx="20" ry="52" fill="none" stroke="#B5C9B4" stroke-width="5" transform="rotate(-28 414 175)"/>
<circle cx="414" cy="175" r="13" fill="#F5DD91"/><circle cx="458" cy="150" r="8" fill="#F5DD91"/>
<path d="m414 93 5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" fill="#F7E6B2"/>
<path d="M378 314C416 340 384 358 307 377C245 393 295 427 366 448L411 500H568C519 452 466 419 373 405Q332 398 382 382C471 355 457 331 412 311Z" fill="#BDD1A9"/>
<path d="M0 448Q131 383 222 409L276 433Q227 460 246 500H0Z" fill="#396D6B"/>
<path d="M502 405Q660 336 800 401V500H572Q552 450 502 405Z" fill="#315F68"/>
<path d="M101 435Q98 387 86 364m33 67q7-39 33-55M650 416q-17-53-40-65m47 69q4-52 24-72M200 345v-32" fill="none" stroke="#9EBC9F" stroke-width="5" stroke-linecap="round"/>
<g fill="#EDE1AE"><circle cx="200" cy="308" r="6"/><path d="m86 343 5 13 13 5-13 5-5 13-5-13-13-5 13-5Z m68 21 4 10 11 4-11 4-4 10-4-10-11-4 11-4Z m457-24 4 10 11 4-11 4-4 10-4-10-11-4 11-4Z m71-6 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/></g>
<path d="M35 500Q56 432 84 413Q89 462 69 500M75 500Q119 461 151 465Q129 492 109 500M733 500Q689 449 699 421Q739 450 745 500" fill="#234F5C"/>
<g class="scene-twinkle" fill="#F9E7B4"><path d="m200 57 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z m424-26 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z m231 58 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><circle cx="106" cy="89" r="3"/><circle cx="340" cy="101" r="2"/><circle cx="553" cy="64" r="2"/><circle cx="731" cy="162" r="3"/></g>
<path d="M341 342h26m-44 47h28m57 55h43" stroke="#829E8E" stroke-width="5" stroke-linecap="round"/>`
];
function safeWorld(index){return Number.isInteger(index)&&index>=0&&index<6?index:0;}
function scenery(index=0,cls=''){
 index=safeWorld(index);const id='luma-atlas-'+index+'-'+(++serial),p=palettes[index];
 const c=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg xmlns="http://www.w3.org/2000/svg" class="landscape scene-art ${c}" data-scene="${names[index]}" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient><clipPath id="${id}-clip"><path d="M0 0h800v500H0Z"/></clipPath></defs><g clip-path="url(#${id}-clip)"><path data-sky="opaque" d="M0 0h800v500H0Z" fill="url(#${id}-sky)"/>${scenes[index]}</g></svg>`;
}
function routeArt(index=0){return `<div class="route-art">${scenery(index,'scene-hero')}</div>`;}
// A connected L and a warm destination. Identical geometry at every brand size.
function mark(){return '<svg xmlns="http://www.w3.org/2000/svg" class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M20 15v23a11 11 0 0 0 11 11h16" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/><circle cx="20" cy="15" r="9" fill="currentColor"/><circle cx="20" cy="15" r="3.5" fill="var(--bg,#FAF8F1)"/><circle cx="47" cy="49" r="8" fill="#E9AE50"/></svg>';}
function wordmark(){return '<svg xmlns="http://www.w3.org/2000/svg" class="brand-wordmark" viewBox="0 0 165 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v31q0 8 8 8M31 28v13q0 11 11 11t11-11V28M71 52V28m0 11q0-12 10-12t10 12v13m0-13q0-12 10-12t10 12v13M153 40a12 12 0 1 0-24 0a12 12 0 1 0 24 0m0-12v24"/></g></svg>';}
function logo(){return `<span class="brand atelier-brand">${mark()}${wordmark()}</span>`;}
function appIcon(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><linearGradient id="field" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#36B7AE"/><stop offset=".55" stop-color="#137C84"/><stop offset="1" stop-color="#144C66"/></linearGradient><linearGradient id="porcelain" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#FFFDF0"/><stop offset="1" stop-color="#F8D79B"/></linearGradient><radialGradient id="gold" cx=".33" cy=".24" r=".85"><stop stop-color="#FFF2B8"/><stop offset=".42" stop-color="#FFD06C"/><stop offset="1" stop-color="#EFA03C"/></radialGradient></defs><path d="M0 0h1024v1024H0Z" fill="url(#field)"/><path d="M0 759Q221 659 440 753T1024 767V1024H0Z" fill="#166578"/><path d="M0 903Q269 777 503 887T1024 881V1024H0Z" fill="#174E66"/><path d="M360 297v283q0 151 151 151h180" fill="none" stroke="#126272" stroke-width="145" stroke-linecap="round"/><path d="M334 258v298q0 148 148 148h214" fill="none" stroke="#DBB477" stroke-width="120" stroke-linecap="round"/><path d="M334 245v298q0 148 148 148h214" fill="none" stroke="url(#porcelain)" stroke-width="120" stroke-linecap="round"/><path d="M294 305v235q0 182 182 182" fill="none" stroke="#FFF6D9" stroke-width="9" stroke-linecap="round"/><circle cx="334" cy="254" r="91" fill="#DDC293"/><circle cx="334" cy="242" r="91" fill="url(#porcelain)"/><circle cx="334" cy="242" r="34" fill="#1A888E"/><path d="M275 224a62 62 0 0 1 99-31" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/><circle cx="704" cy="703" r="92" fill="#B58545"/><circle cx="704" cy="690" r="92" fill="url(#gold)"/><path d="M640 676a66 66 0 0 1 98-43" fill="none" stroke="#FFF5CE" stroke-width="8" stroke-linecap="round"/><path d="m726 203 5 18 18 5-18 5-5 18-5-18-18-5 18-5Z" fill="#BFE7CC"/></svg>`;}
const exported={...A,scenery,routeArt,mark,wordmark,logo,appIcon,sceneNames:names.slice(),sceneDescriptions:descriptions.slice(),artVersion:'5.1.0'};
root.LumaStudioArt=exported;
if(typeof module!=='undefined')module.exports=exported;
})(typeof window!=='undefined'?window:globalThis);
