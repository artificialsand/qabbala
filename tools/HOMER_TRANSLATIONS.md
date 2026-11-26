# Homer translations for Qabbala Explorer

All eight Homer collections are independently selectable, including Butler (prose), Pope (rhyming couplets), Cowper (blank verse), and Chapman (early modern verse) for each epic. The six new files can be prepared with `python3 prepare_classics.py`. Each source is distinct, not a re-labeled Butler translation.

| Corpus file | Translator | Gutenberg ID | Default unit |
|---|---|---:|---|
| iliad.txt | Samuel Butler | 2199 | sentence |
| iliad_pope.txt | Alexander Pope | 6130 | line |
| iliad_cowper.txt | William Cowper | 16452 | line |
| iliad_chapman.txt | George Chapman | 51355 | line |
| odyssey.txt | Samuel Butler | 1727 | sentence |
| odyssey_pope.txt | Alexander Pope | 3160 | line |
| odyssey_cowper.txt | William Cowper | 24269 | line |
| odyssey_chapman.txt | George Chapman | 48895 | line |

Direct sources: `https://www.gutenberg.org/ebooks/NUMBER` using the ID above. If Gutenberg blocks downloads in the script, download the complete UTF-8 text for each edition manually and save it as `sources/CORPUSID_raw.txt` (e.g. `sources/iliad_pope_raw.txt`), then rerun the preparation script.

The preparer removes Gutenberg framing text and attempts to split every edition into the 24 traditional books. Because Gutenberg editions differ, inspect the generated files before interpreting numerical distributions. Particularly check that prefaces, arguments, book summaries and footnotes are not included, and that physical verse lines are preserved.

Modern translations such as Emily Wilson, Fagles, and Lattimore are not bundled because of copyright.
