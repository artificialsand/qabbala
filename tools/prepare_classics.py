#!/usr/bin/env python3
"""Download public-domain editions and produce @@SECTION corpora for Qabbala Explorer.
Use --local to prepare files manually downloaded into sources/ (PG download problems).
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import Request, urlopen
import re, sys, time
ROOT=Path(__file__).resolve().parent
SOURCES=ROOT/'sources';SOURCES.mkdir(exist_ok=True)
BOOKS={
 'iliad':(2199,'The Iliad (Samuel Butler)'),
 'odyssey':(1727,'The Odyssey (Samuel Butler)'),
 'iliad_pope':(6130,'The Iliad (Alexander Pope)'),
 'iliad_cowper':(16452,'The Iliad (William Cowper)'),
 'iliad_chapman':(51355,'The Iliad (George Chapman)'),
 'odyssey_pope':(3160,'The Odyssey (Alexander Pope)'),
 'odyssey_cowper':(24269,'The Odyssey (William Cowper)'),
 'odyssey_chapman':(48895,'The Odyssey (George Chapman)'),
 'blake':(45315,'The Marriage of Heaven and Hell (William Blake)'),
 'dante':(1004,'The Divine Comedy (Longfellow)'),
}
class Extract(HTMLParser):
 def __init__(self):super().__init__();self.out=[];self.block=0;self.skip=0
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.skip+=1
  if t in ('p','h1','h2','h3','h4','br','div','blockquote','pre','li','tr'):self.out.append('\n')
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip=max(0,self.skip-1)
  if t in ('p','h1','h2','h3','h4','div','blockquote','pre','li','tr'):self.out.append('\n')
 def handle_data(self,d):
  if not self.skip:self.out.append(d)
def htmltext(s):
 p=Extract();p.feed(s);return ''.join(p.out)
def get(url):
 req=Request(url,headers={'User-Agent':'QabbalaExplorerTextPreparation/1.0 (personal research)','Accept':'text/plain,text/html,*/*'})
 with urlopen(req,timeout=20) as resp:return resp.read().decode('utf-8-sig','replace')
def pg_urls(num):
 # A separate Gutenberg mirror is useful when gutenberg.org returns HTTP 503.
 # Main collection uses a digit-wise directory hierarchy, e.g. 2199 -> 2/1/9/2199.
 digits='/'.join(str(num)[:-1]); mirror_path=f'{digits}/{num}'
 roots=['https://mirror.fi.ossplanet.net/gutenberg',
        'https://www.mirrorservice.org/sites/gutenberg.org',
        'https://www.gutenberg.org']
 result=[]
 for root in roots:
  for filename in (f'{num}-0.txt',f'{num}.txt',f'{num}-8.txt'):
   result.append(f'{root}/{mirror_path}/{filename}')
 result += [f'https://www.gutenberg.org/cache/epub/{num}/pg{num}.txt',
            f'https://www.gutenberg.org/cache/epub/{num}/pg{num}.html']
 return result

def retrieve_pg(key,num,local=False):
 f=SOURCES/(key+'_raw.txt')
 if f.is_file() and f.stat().st_size>1500:
  print('Using local source:',f.name)
  return f.read_text(encoding='utf-8-sig')
 if local:
  raise FileNotFoundError(f'Missing {f}. Save downloaded UTF-8 text there.')
 errors=[]
 for url in pg_urls(num):
  try:
   print('Fetching',url,flush=True)
   data=get(url)
   if '<html' in data[:1500].lower():data=htmltext(data)
   if len(data)<2000:raise ValueError('too short to be the complete work')
   f.write_text(data,encoding='utf-8');return data
  except Exception as e:
   errors.append(f'{url}: {str(e)[:110]}')
   print('  Skipped:',str(e)[:140])
 raise RuntimeError(f'Cannot retrieve {key}. Save edition #{num} as sources/{key}_raw.txt and rerun with --local. Last failure: {errors[-1]}')
def strip_pg(s):
 s=s.replace('\r','')
 start=re.search(r'^\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*$',s,re.M|re.I)
 if start:s=s[start.end():]
 end=re.search(r'^\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*$',s,re.M|re.I)
 if end:s=s[:end.start()]
 return s
ROM=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV']
def roman(i):return ROM[i-1]
WORD_ORD=['FIRST','SECOND','THIRD','FOURTH','FIFTH','SIXTH','SEVENTH','EIGHTH','NINTH','TENTH','ELEVENTH','TWELFTH','THIRTEENTH','FOURTEENTH','FIFTEENTH','SIXTEENTH','SEVENTEENTH','EIGHTEENTH','NINETEENTH','TWENTIETH','TWENTY-FIRST','TWENTY-SECOND','TWENTY-THIRD','TWENTY-FOURTH']
ROMAN_VALUES={x:i for i,x in enumerate(ROM,1)}
def parse_roman(token):
 token=token.upper()
 if not re.fullmatch(r'[IVXLCDM]+',token):return None
 digits={'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
 result=0;previous=0
 for c in reversed(token):
  n=digits[c]
  result+= -n if n<previous else n
  previous=max(previous,n)
 # Reject malformed numerals and excessively large labels.
 if not (1<=result<=3999):return None
 return result if to_roman(result)==token else None

def to_roman(n):
 pairs=((1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I'))
 out=''
 for v,t in pairs:
  q,n=divmod(n,v);out+=t*q
 return out
def book_number(token):
 token=token.upper().strip(' .:-').replace(' ','-')
 if token.isdigit():return int(token)
 if re.fullmatch(r'[IVXLCDM]+',token):return parse_roman(token)
 if token in WORD_ORD:return WORD_ORD.index(token)+1
 return None

def homer_header(line):
 """Recognize separate-book headings in Butler, Pope, Cowper and Chapman."""
 z=re.sub(r'\s+',' ',line.strip()).replace('’',"'")
 z=re.sub(r'\[\d+\]$', '', z).strip() # Gutenberg footnote attached to heading
 # Plain numbered heading: BOOK I. / BOOK 1 / BOOK THE FIRST
 m=re.fullmatch(r'(?:BOOK\s+(?:THE\s+)?)([IVXLCDM]+|\d+|[A-Z-]+)\s*[.:]?',z,re.I)
 if m:return book_number(m.group(1))
 # Chapman's THE FIRST BOOK OF HOMER'S ILIADS / THE FIRST BOOK
 m=re.fullmatch(r'THE\s+([A-Z-]+)\s+BOOK(?:\s+OF\s+HOMER.S\s+(?:ILIADS?|ODYSSEYS?))?\s*[.:]?',z,re.I)
 if m:return book_number(m.group(1))
 # Other common forms: I. / II. only when explicitly formatted in the source
 m=re.fullmatch(r'([IVXLCDM]{1,8})\.',z)
 if m:return book_number(m.group(1))
 return None

def normalize_pg(key,s):
 s=strip_pg(s)
 raw=s.splitlines(); parts=[]
 if key.startswith(('iliad','odyssey')):
  # The table of contents often has one heading for each book, then the
  # headings repeat in the actual text. Parse every occurrence, then retain
  # the longest substantive chapter for each numeric book identifier.
  candidates=[];current=None
  for rawline in raw:
   line=rawline.strip()
   num=homer_header(line)
   if num is not None and 1<=num<=24:
    if current is not None:candidates.append(current)
    current=[num,[]];continue
   if current is None:continue
   if line and not re.match(r'^(?:Contents|Footnotes|Notes|Transcriber.s Note|Illustration|The End|Appendix|THE ARGUMENT|ARGUMENT\.?|ANOTHER ARGUMENT|THE END OF THE)\b',line,re.I):
    current[1].append(line)
  if current is not None:candidates.append(current)
  bynum={}
  for num,lines in candidates:
   # Prevent an intro/table-of-contents entry from counting as a book.
   if len(' '.join(lines))<1200:continue
   if num not in bynum or len(' '.join(lines))>len(' '.join(bynum[num])):bynum[num]=lines
  parts=[(f'Book {roman(n)}',bynum[n]) for n in sorted(bynum)]
  if len(parts)!=24:
   missing=[roman(n) for n in range(1,25) if n not in bynum]
   raise ValueError(f'{len(parts)} of 24 book sections extracted; missing: {", ".join(missing)}. Original source kept in sources/.')
  print('  Parsed Homer books:', ', '.join(f'{n+1}:{len(lines)} lines' for n,(_,lines) in enumerate(parts)))
  return parts
 if key=='dante':
  # The Longfellow Gutenberg text labels actual poetry headings
  # `Inferno: Canto I`, `Purgatorio: Canto I`, etc., not `CANTO I`.
  candidates=[];current=None
  rx=re.compile(r'^\s*(Inferno|Purgatorio|Paradiso)\s*:\s*Canto\s+([IVXLCDM]+|\d+)\s*$',re.I)
  for rawline in raw:
   line=rawline.strip();m=rx.fullmatch(line)
   if m:
    if current is not None:candidates.append(current)
    current=[m.group(1).title(),book_number(m.group(2)),[]];continue
   if current is None:continue
   if line and not re.match(r'^(?:APPENDIX|NOTES|FOOTNOTES|END OF PROJECT)',line,re.I):current[2].append(line)
  if current is not None:candidates.append(current)
  parts=[(f'{area} — Canto {to_roman(num)}',lines) for area,num,lines in candidates if num is not None and len(' '.join(lines))>350]
  # Stop at the end of Paradiso, avoiding appended notes after the last canto.
  expected={'Inferno':34,'Purgatorio':33,'Paradiso':33}
  observed={k:sum(1 for area,num,lines in candidates if area==k and num is not None and len(' '.join(lines))>350) for k in expected}
  if observed!=expected:raise ValueError(f'Dante canto counts {observed}; expected {expected}')
  return parts
 # Blake: retain original section detection (including Gutenberg's headings)
 ls=[x.strip() for x in raw]
 heading=re.compile(r'^(?:THE ARGUMENT|A MEMORABLE FANCY|PROVERBS OF HELL|THE VOICE OF THE DEVIL|A SONG OF LIBERTY|PLATE\s+\d+|THE MARRIAGE OF HEAVEN AND HELL|THE GARDEN OF LOVE)[\.:]?$',re.I)
 cur=None
 for line in ls:
  if heading.match(line):
   if cur is not None and len(' '.join(cur[1]))>80:parts.append(tuple(cur))
   cur=[line.title(),[]];continue
  if cur is not None and line:cur[1].append(line)
 if cur is not None and len(' '.join(cur[1]))>80:parts.append(tuple(cur))
 if not parts:raise ValueError('No Blake sections detected')
 return parts
def save(key,parts):
 from corpus_clean import clean_sections, audit_sections
 parts, changes=clean_sections(key,parts)
 audit_sections(key,parts,changes,ROOT/'audit')
 out=SOURCES/(key+'.txt');out.write_text('\n'.join('@@SECTION '+title+'\n'+'\n'.join(lines)+'\n' for title,lines in parts),encoding='utf-8')
 print('Prepared',out.name, '|',len(parts),'sections', '|',out.stat().st_size,'bytes')
def main():
 import argparse
 ap=argparse.ArgumentParser(description='Prepare locally downloaded or mirrored public-domain texts')
 ap.add_argument('--local',action='store_true',help='Only use files already in sources/')
 ap.add_argument('--only',nargs='+',choices=list(BOOKS),help='Prepare selected works')
 args=ap.parse_args()
 failed=[]
 for key,(num,title) in BOOKS.items():
  if args.only and key not in args.only:continue
  try:save(key,normalize_pg(key,retrieve_pg(key,num,args.local)))
  except Exception as e:print('FAILED',key,':',e);failed.append(key)
 print('Unprepared:',', '.join(failed) if failed else 'none')
 if failed:sys.exit(1)
if __name__=='__main__':main()
