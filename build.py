"""Rebuild the self-contained HTML versions using only the Python standard library.
Icons are already generated. The included SVG is the editable master.
"""
from pathlib import Path
import base64
import random
import struct
import zlib

ROOT=Path(__file__).resolve().parent

def texture():
    random.seed(54)
    w=h=96
    def chunk(t,d):
        return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
    data=b''.join(b'\0'+bytes(v for _ in range(w) for v in [48,40,58,random.randrange(20,190)]) for y in range(h))
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(data))+chunk(b'IEND',b'')
    return 'data:image/png;base64,'+base64.b64encode(png).decode()

css=(ROOT/'src/styles.css').read_text()+"\n:root{--grain:url('"+texture()+"')}"
js='\n'.join((ROOT/'src'/name).read_text() for name in ['engine.js','audio.js','art.js','app.js'])
template=(ROOT/'src/template.html').read_text()
icon=(ROOT/'icons/icon.svg').read_text() if (ROOT/'icons/icon.svg').exists() else ''
inline_icon='data:image/svg+xml;base64,'+base64.b64encode(icon.encode()).decode()
for standalone,out in [(False,ROOT/'index.html'),(True,ROOT.parent/'Luma.html')]:
    head=f'<link rel="icon" href="{inline_icon}" type="image/svg+xml">' if standalone else '<link rel="manifest" href="./manifest.webmanifest"><link rel="icon" href="./icons/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">'
    document=template.replace('<!--HEAD_ASSETS-->',head).replace('/*CSS*/',css).replace('/*JS*/',('window.LUMA_STANDALONE=true;\n' if standalone else '')+js)
    out.write_text(document,encoding='utf-8')
    print(out, out.stat().st_size, 'bytes')
