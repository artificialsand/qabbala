#!/usr/bin/env python3
"""Download separate Tao Te Ching translations from tasuki.org for personal local analysis.
Uses the public side-by-side application's config.json and .md source files.
The translation texts may be copyrighted; do not redistribute the downloaded files.
"""
import json,re,sys,time,urllib.parse,urllib.request
from pathlib import Path
BASE='https://ttc.tasuki.org/'
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; QabbalaExplorer/1.0)'}
OUT=Path(__file__).resolve().parent/'sources'
OUT.mkdir(exist_ok=True)

def get(url):
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=25) as res:
        return res.read().decode('utf-8-sig')

def clean_and_segment(raw):
    # Standard side-by-side .md has metadata (Title/Author/Year/Language),
    # then '---' chapter separators. Some sources instead use chapter headings.
    lines=raw.replace('\r','').split('\n')
    metadata={};body=[];started=False
    for line in lines:
        if not started and re.match(r'^\s*(?:Title|Author|Year|Language|Source)\s*:',line,re.I):
            k,v=line.split(':',1); metadata[k.lower().strip()]=v.strip(); continue
        if line.strip(): started=True
        body.append(line)
    content='\n'.join(body).strip()
    # Every divider delimits an item/chapter in side-by-side's format.
    blocks=re.split(r'^\s*---\s*$',content,flags=re.M)
    if len(blocks)>=70:
        return metadata,[b.strip() for b in blocks if b.strip()]
    matches=list(re.finditer(r'(?im)^\s*#{1,4}\s*(?:chapter|section)?\s*(\d{1,2})(?:\s*[:.\-].*)?$',content))
    if len(matches)>=70:
        return metadata,[content[m.end():matches[i+1].start() if i+1<len(matches) else len(content)].strip() for i,m in enumerate(matches)]
    return metadata,[b.strip() for b in blocks if b.strip()]

def main():
    urls=[urllib.parse.urljoin(BASE,x) for x in ('config.json','data/config.json','base:Code/config.json','Code/config.json')]
    config=None
    for url in urls:
        try:
            obj=json.loads(get(url))
            if isinstance(obj,dict) and isinstance(obj.get('files'),list):config=obj;break
        except Exception as e:print('Config probe:',url,':',e)
    if config is None:
        print('Unable to discover config.json. Please check if ttc.tasuki.org is reachable.')
        return 1
    print('Found config:',url,'with',len(config['files']),'files')
    entries=[]
    for idx,path in enumerate(config['files']):
        if not isinstance(path,str) or not path.endswith('.md'):continue
        path=path.lstrip('/')
        if '..' in path.split('/'):continue
        u=urllib.parse.urljoin(BASE,path)
        try:
            raw=get(u);meta,parts=clean_and_segment(raw)
            if len(parts)<10:print('Skipping',path,': only',len(parts),'sections');continue
            slug=re.sub(r'[^a-z0-9]+','_',Path(path).stem.lower()).strip('_') or f'translation_{idx}'
            filename=f'tao_{idx+1:02d}_{slug}.txt'
            name=meta.get('author') or meta.get('title') or Path(path).stem.replace('-',' ')
            payload='\n\n'.join(f'## Chapter {i}\n'+re.sub(r'(?m)^\s*#{1,6}\s*','',part).strip() for i,part in enumerate(parts,1))+'\n'
            (OUT/filename).write_text(payload,encoding='utf-8')
            entries.append({'name':name,'file':filename,'source':u,'chapters':len(parts)})
            print('Saved',name,':',len(parts),'chapters')
            time.sleep(.12)
        except Exception as e: print('Failed',path,e)
    (OUT/'tao_manifest.json').write_text(json.dumps({'source':BASE,'translations':entries},ensure_ascii=False,indent=2),encoding='utf-8')
    print('Saved',len(entries),'translations to tao_manifest.json')
    return 0 if entries else 1

if __name__=='__main__':sys.exit(main())
