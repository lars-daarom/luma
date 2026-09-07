/** Static artifact validator. Git blob hashes compare deployment bytes, not authenticity. */
import {readFile,mkdir,copyFile,rm,lstat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export const VERSION='5.1.0';
export const RUNTIME=['.nojekyll','index.html','manifest.webmanifest','sw.js','controle.html','assets/studio.css','assets/atlas.css','assets/engine.js','assets/studio-art.js','assets/atlas-art.js','assets/studio.js','icons/studio.svg','icons/studio-180.png','icons/studio-192.png','icons/studio-512.png'];
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function gitHash(bytes){return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');}
export async function validate(root=ROOT){
 let release;try{release=JSON.parse(await readFile(join(root,'release.json'),'utf8'));}catch{throw Error('release.json ontbreekt of is ongeldig.');}
 if(release.version!==VERSION||release.algorithm!=='git-blob-sha1')throw Error('Verkeerde releaseversie.');
 if(JSON.stringify(Object.keys(release.files).sort())!==JSON.stringify([...RUNTIME].sort()))throw Error('De releasebestanden komen niet overeen.');
 for(const name of RUNTIME){let bytes;try{const stat=await lstat(join(root,name));if(!stat.isFile()||stat.isSymbolicLink())throw Error();bytes=await readFile(join(root,name));}catch{throw Error('Ontbrekend bestand: '+name);}
  if(bytes.length!==release.files[name].bytes||gitHash(bytes)!==release.files[name].gitSha)throw Error('Niet de juiste versie van '+name);
 }
 const html=await readFile(join(root,'index.html'),'utf8'),manifest=JSON.parse(await readFile(join(root,'manifest.webmanifest'),'utf8'));
 if(!html.includes('name="app-version" content="'+VERSION+'"'))throw Error('Verkeerde indexversie.');
 if(manifest.scope!=='./'||!manifest.start_url.startsWith('./'))throw Error('Manifest moet relatief zijn.');
 return release;
}
export async function prepare(root=ROOT){await validate(root);const dest=join(resolve(root),'_site');await rm(dest,{recursive:true,force:true});for(const f of [...RUNTIME,'release.json']){await mkdir(dirname(join(dest,f)),{recursive:true});await copyFile(join(root,f),join(dest,f));}return {version:VERSION,path:dest,files:RUNTIME.length+1};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const r=await prepare();console.log(`Luma ${r.version}: ${r.files} geverifieerde bestanden in _site.`);}catch(e){console.error(e.message);process.exitCode=1;}}
