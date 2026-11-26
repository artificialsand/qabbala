# Text cleaning and verification

Run `python3 prepare_classics.py` for newly acquired sources or `python3 corpus_clean.py` for already prepared classic texts. Use `python3 corpus_clean.py --dry-run` to audit without changing prepared texts.

The cleaners preserve original spelling, capitalization, punctuation and wording. They remove obvious Gutenberg boilerplate, standalone page references, bracketed numeric footnote markers, editorial-note sections, and isolated line numbers. No raw downloads in `sources/` are modified. Existing prepared texts are backed up once as `*.before_cleaning.txt`.

Reports: `audit/<name>.json` records automatic removals and suspicious remaining lines. Inspect these reports, particularly the ends of last sections. Ambiguous cases are flagged rather than deleted.

The Bible's `Book chapter:verse` reference is excluded by the interface's existing Bible parser. Milton's book headings and obvious prefixed numerals are excluded by its parser. Tao chapter/translation labels are excluded by its parser. For data fidelity, do not use an edition for statistical claims without checking the prepared text.

**Scope:** This package cannot guarantee a line-by-line editorial proofread of your local text files, which were not provided. It supplies reproducible cleaning and a reviewable audit instead.
