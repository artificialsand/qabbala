#!/usr/bin/env python3
"""Conservative corpus cleanup and detailed audit. No original source is overwritten.

Usage: python3 corpus_clean.py  (clean already-prepared corpora in place, with backups)
The preparation script also calls clean_sections on every newly extracted edition.
"""
from pathlib import Path
import re, json, shutil

ROOT=Path(__file__).resolve().parent
CORPUS=ROOT/'sources'
CLASSICS=('iliad','iliad_pope','iliad_cowper','iliad_chapman',
 'odyssey','odyssey_pope','odyssey_cowper','odyssey_chapman','blake','dante')

# These patterns are designed to match editorial apparatus, NOT text in running prose.
EDITORIAL=re.compile(r'''(?ix) ^(?:
  \[?\s*(?:illustration|transcriber(?:'s|’s)?\s+note|editor(?:'s|’s)?\s+note|footnotes?|endnotes?|index|contents|table\s+of\s+contents|bibliography|glossary)\b.*
 |\s*(?:page|pg\.)\s*\d{1,5}\s*
 |\s*(?:\[\s*)?\d{1,5}(?:\s*\])?\s*             # standalone numeric margin marker
 |\s*(?:\[\s*)?[ivxlcdm]{1,9}(?:\s*\])?\s*     # standalone roman marker (rare)
 |\s*\[\s*(?:pg\.?\s*)?\d{1,5}\s*\]\s*
 |\s*(?:\*\s*){3,}
)$''')
GUTENBERG=re.compile(r'(?i)(?:project\s+gutenberg|www\.gutenberg\.org|produced\s+by\s+|distributed\s+proofreaders|end\s+of\s+(?:the\s+)?project\s+gutenberg)')
# Inline numeric annotation ONLY if explicitly bracketed; preserve ordinary dates,
# counts and textual numbers (they can matter for alphanumeric ciphers).
INLINE_FOOTNOTE=re.compile(r'(?<!\w)\[(?:\s*(?:footnote\s*)?\d{1,4}|\s*note\s*\d{1,4})\](?!\w)',re.I)
# Numbered verse/line at left margin when followed by whitespace; disallow digit + comma
# to avoid '1,000', and only accept in verse texts when the document is known to carry them.
LEFT_NUMBER=re.compile(r'^\s*(\d{1,5})\s{2,}(?=\S)')
RIGHT_NUMBER=re.compile(r'(?<=\S)\s{2,}(\d{1,5})\s*$')


def clean_sections(key,parts):
 changes=[]; output=[]
 verse_key=key in ('iliad_pope','iliad_cowper','iliad_chapman','odyssey_pope','odyssey_cowper','odyssey_chapman','dante','blake')
 for title,lines in parts:
  kept=[]; in_notes=False
  for n,raw in enumerate(lines,1):
   line=raw.strip().replace('\ufeff','')
   if not line:continue
   if GUTENBERG.search(line):
    changes.append((title,n,'gutenberg metadata',line[:130]));continue
   # Standalone FOOTNOTES is a strong notes-section delimiter. For generic
   # NOTES use a length guard because the word could occur in literary text.
   if re.fullmatch(r'(?:FOOTNOTES?|ENDNOTES?|NOTES TO BOOK [IVXLCDM\d]+|EXPLANATORY NOTES)\s*[:.]?',line,re.I) or (len(kept)>80 and re.fullmatch(r'NOTES\s*[:.]?',line,re.I)):
    in_notes=True;changes.append((title,n,'start editorial notes',line));continue
   if EDITORIAL.fullmatch(line):
    changes.append((title,n,'standalone metadata',line[:130]));continue
   if in_notes:
    changes.append((title,n,'editorial notes',line[:130]));continue
   altered=INLINE_FOOTNOTE.sub('',line)
   if altered!=line:changes.append((title,n,'inline footnote marker',line[:130]))
   line=altered
   if verse_key:
    # Only remove obvious margin numbers separated by multiple spaces.
    altered=LEFT_NUMBER.sub('',line)
    altered=RIGHT_NUMBER.sub('',altered)
    if altered!=line:changes.append((title,n,'margin line number',line[:130]))
    line=altered
   line=re.sub(r'\s+',' ',line).strip()
   if line:kept.append(line)
  output.append((title,kept))
 return output,changes

def audit_sections(key,parts,changes,directory):
 directory.mkdir(exist_ok=True)
 issues=[]
 for title,lines in parts:
  for n,line in enumerate(lines,1):
   flags=[]
   if re.search(r'(?i)\b(?:project gutenberg|transcriber.s note|footnotes?|endnotes?|table of contents|page\s+\d+)\b',line):flags.append('possible editorial content')
   if re.match(r'^\s*(?:\d{1,5}\s+[A-Z]|\[\d+\])',line):flags.append('possible leading line number')
   if re.search(r'(?<!\w)\[\d{1,4}\](?!\w)',line):flags.append('possible footnote marker')
   if len(line)>500:flags.append('long original line: inspect for wrapping/notes')
   if flags:issues.append({'section':title,'line':n,'flags':flags,'text':line[:240]})
 report={'corpus':key,'sections':len(parts),'lines':sum(len(x) for _,x in parts),
         'removed_or_modified':len(changes),'changes':[{'section':a,'source_line':b,'reason':c,'original':d} for a,b,c,d in changes[:6000]],
         'suspicions':issues[:6000]}
 (directory/(key+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(f'  Audit {key}: {len(changes)} edits; {len(issues)} remaining flags (audit/{key}.json)')


def read_prepared(file):
 parts=[];title=None;lines=[]
 for line in file.read_text(encoding='utf-8-sig').splitlines():
  if line.startswith('@@SECTION '):
   if title is not None:parts.append((title,lines))
   title=line[len('@@SECTION '):].strip();lines=[]
  elif title is not None:lines.append(line)
 if title is not None:parts.append((title,lines))
 return parts

def write_prepared(file,parts):
 file.write_text(''.join('@@SECTION '+title+'\n'+'\n'.join(lines)+'\n' for title,lines in parts),encoding='utf-8')

if __name__=='__main__':
 import argparse
 ap=argparse.ArgumentParser()
 ap.add_argument('--dry-run',action='store_true',help='Create reports without modifying prepared texts')
 args=ap.parse_args();found=0
 for key in CLASSICS:
  file=CORPUS/(key+'.txt')
  if not file.exists():continue
  parts=read_prepared(file)
  if not parts:print('SKIP invalid prepared corpus',file.name);continue
  cleaned,changes=clean_sections(key,parts)
  audit_sections(key,cleaned,changes,ROOT/'audit')
  if not args.dry_run:
   backup=ROOT/(key+'.before_cleaning.txt')
   if not backup.exists():shutil.copy2(file,backup)
   write_prepared(file,cleaned)
  found+=1
 print(f'Audited {found} prepared classics. Source files in sources/ untouched.')
 if not found:print('No prepared classics found here. Copy your *.txt corpus files into this folder or run prepare_classics.py.')
