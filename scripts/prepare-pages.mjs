/** Deterministic static Pages packaging. No dependencies, Jekyll or transpilation. */
import {readFile,writeFile,mkdir,copyFile,rm,lstat,appendFile} from 'node:fs/promises';
import {resolve,dirname,join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const VERSION = '4.1.0';
export const RUNTIME = [
 'index.html','manifest.webmanifest','sw.js','controle.html',
 'assets/app.css','assets/worlds.js','assets/app.js','assets/paper.png',
 'icons/icon.svg','icons/icon-192.png','icons/icon-512.png',
 'icons/icon-maskable.png','icons/apple-touch-icon.png'
];
const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)),'..');
const digest = b => createHash('sha256').update(b).digest('hex');
export async function validate(root=defaultRoot) {
 let release;
 try { release=JSON.parse(await readFile(join(root,'release.json'),'utf8')); }
 catch { throw Error('release.json ontbreekt of is ongeldig. Pak de ZIP uit en commit alle bestanden IN de hoofdmap, niet de ZIP of een extra Luma-map.'); }
 if(release.version!==VERSION)throw Error('Verkeerde release.json: verwacht Luma '+VERSION+'. Upload de volledige, bij elkaar horende release.');
 if(JSON.stringify(Object.keys(release.files).sort())!==JSON.stringify([...RUNTIME].sort()))throw Error('De release bevat niet de verwachte publicatiebestanden.');
 for(const name of RUNTIME){
  let stat,bytes;
  try{stat=await lstat(join(root,name));bytes=await readFile(join(root,name));}catch{throw Error('Ontbrekend bestand: '+name+'. Het bestand moet op main in de hoofdmapstructuur uit de ZIP staan.');}
  if(!stat.isFile()||stat.isSymbolicLink())throw Error('Geen regulier bestand: '+name);
  if(bytes.length!==release.files[name].bytes||digest(bytes)!==release.files[name].sha256)throw Error('Niet de juiste versie van '+name+'. Upload dit bestand opnieuw vanuit dezelfde 4.1-ZIP.');
 }
 const html=await readFile(join(root,'index.html'),'utf8');
 if(!html.includes('name="app-version" content="'+VERSION+'"'))throw Error('index.html heeft niet de verwachte versie.');
 const manifest=JSON.parse(await readFile(join(root,'manifest.webmanifest'),'utf8'));
 if(manifest.scope!=='./'||!manifest.start_url.startsWith('./'))throw Error('Manifest moet relatief blijven voor de /luma/-projectroute.');
 return release;
}
export async function prepare(root=defaultRoot){
 const release=await validate(root);
 const destination=join(resolve(root),'_site');
 // Never copy the repository itself: only runtime files belong in the Pages artifact.
 if(relative(resolve(root),destination)!=='_site'||destination===resolve(root))throw Error('Ongeldige uitvoermap.');
 await rm(destination,{recursive:true,force:true});await mkdir(destination,{recursive:true});
 for(const name of [...RUNTIME,'release.json']){
  const target=join(destination,name);await mkdir(dirname(target),{recursive:true});await copyFile(join(root,name),target);
 }
 return {version:release.version,path:destination,files:RUNTIME.length+1};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const result=await prepare();
  const message=`Luma ${result.version}: ${result.files} gevalideerde bestanden. index.html staat direct in _site/. Geen docs-map of Jekyll nodig.`;
  console.log(message);
  if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Luma publicatiecontrole\n\n'+message+'\n\nSHA-256-controle geslaagd voor alle runtimebestanden.\n');
 }catch(error){console.error('::error::'+String(error.message).replaceAll('\n',' '));process.exitCode=1;}
}
