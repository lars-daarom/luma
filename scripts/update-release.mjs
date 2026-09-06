/** After intentionally editing runtime files, refresh the integrity catalog. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {VERSION,RUNTIME} from './prepare-pages.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
try{
 const files={};
 for(const name of RUNTIME){const bytes=await readFile(join(root,name));files[name]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
 await writeFile(join(root,'release.json'),JSON.stringify({version:VERSION,files},null,2)+'\n');
 console.log('release.json bijgewerkt voor Luma '+VERSION+'. Controleer wijzigingen en commit de bestanden samen.');
}catch(e){console.error(e.message);process.exitCode=1;}
