import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {RUNTIME,VERSION,gitHash} from './prepare-pages.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),files={};
for(const f of RUNTIME){const b=await readFile(join(root,f));files[f]={bytes:b.length,gitSha:gitHash(b)};}
await writeFile(join(root,'release.json'),JSON.stringify({version:VERSION,algorithm:'git-blob-sha1',files},null,2)+'\n');
console.log('Releasecatalogus bijgewerkt voor '+VERSION);
