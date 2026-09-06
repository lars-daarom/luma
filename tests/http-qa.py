"""Serve the prepared artifact under /luma/ and inspect its real HTTP responses.
This is a local static-server check, not a GitHub Pages deployment or PWA test.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.request import urlopen
from urllib.parse import urlsplit,unquote,urljoin
from urllib.error import HTTPError
import json,threading,hashlib,re,subprocess
ROOT=Path(__file__).resolve().parent.parent
subprocess.run(['node',str(ROOT/'scripts/prepare-pages.mjs')],check=True)
SITE=ROOT/'_site'
class Handler(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  relative=unquote(urlsplit(path).path)
  if not relative.startswith('/luma/') or '..' in relative.split('/'):
   return str(SITE/'__not_found__')
  return str(SITE/relative[len('/luma/'):])
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
base=f'http://127.0.0.1:{server.server_port}/luma/'
checked=[]
try:
 manifest=json.loads((SITE/'release.json').read_text())
 for name,meta in manifest['files'].items():
  with urlopen(base+name+'?luma-check=local') as response:
   data=response.read();assert response.status==200
   assert len(data)==meta['bytes'] and hashlib.sha256(data).hexdigest()==meta['sha256'],name
   checked.append({'file':name,'status':response.status,'bytes':len(data),'sha256Matches':True,'mime':response.headers.get('Content-Type')})
 with urlopen(base) as r:
  index=r.read().decode();assert r.status==200 and 'name="app-version" content="4.1.0"' in index
 for ref in re.findall(r'(?:href|src)="([^"]+)"',index):
  if ref.startswith(('./','assets/','icons/')):
   with urlopen(urljoin(base,ref)) as response:assert response.status==200,ref
 with urlopen(base+'release.json') as r:assert json.load(r)['version']=='4.1.0'
 try:urlopen(base+'a-missing-file.js')
 except HTTPError as error:assert error.code==404
 else:raise AssertionError('Missing asset must not return HTML with a 200 status')
 report={'localProjectPath':'/luma/','rootIndexStatus':200,'files':checked,'releaseJsonStatus':200,'missingFileStatus':404,'liveGitHubDeploymentTested':False}
 out=Path(__file__).resolve().parent/'visual-output';out.mkdir(exist_ok=True)
 (out/'http-results.json').write_text(json.dumps(report,indent=2))
 print(json.dumps({'rootIndexStatus':200,'runtimeFiles':len(checked),'hashChecks':'all passed','missingFileStatus':404},indent=2))
finally:server.shutdown();server.server_close();thread.join(timeout=2)
