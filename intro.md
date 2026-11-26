# Introduction

Numerical signs preceded written language; numbers foreshadow letters; letters metamorphose out of counting symbols. Thus, scribed text obscures a hidden layer, an underlying digital foundation. Esoteric numerical practices, ancient and manifold, have attempted to unveil what the scripture conceals.  

## On numerical readings

The number of ciphers that map the alphabet to the numerical domain is infinite. Each encoding might reveal different facet of the multi-dimensional mystery. Here is provided a tool for studying texts through the lens of these various mappings. The purpose is in particular to allow for a study of statistical properties of gematrically decomposed texts. 


## Method

For now the focus is strictly on English texts. The statistical properties of the English language, expressed by the frequency of each letter are as follows: 


| Letter | Frequency | Letter | Frequency |
|:------:|----------:|:------:|----------:|
| a | 0.08167 | n | 0.06749 |
| b | 0.01492 | o | 0.07507 |
| c | 0.02782 | p | 0.01929 |
| d | 0.04253 | q | 0.00095 |
| e | 0.12702 | r | 0.05987 |
| f | 0.02228 | s | 0.06327 |
| g | 0.02015 | t | 0.09056 |
| h | 0.06094 | u | 0.02758 |
| i | 0.06966 | v | 0.00978 |
| j | 0.00153 | w | 0.02360 |
| k | 0.00772 | x | 0.00150 |
| l | 0.04025 | y | 0.01974 |
| m | 0.02406 | z | 0.00074 |

Based on this property an estimator can be calculated for each cipher (by multiplying the frequency by the value assigned to the letter in that encoding). This estimator gives the expected value per token (letter) and can be further used to calculate expected mean value of a verse, sentence, or word in the text. Deviation from this expected value may indicate atypical properties of the text. For instance, a non-English text will yield high deviation values when encoded with an English-based cipher. 

The ciphers available here are taken from [ciphers.news](https://ciphers.news) (with gratitude to the developers).

It is possible to analyse a single text or to compare any number of them. New texts will be added as time goes on. If there is interest an option to add texts by users can be easily added. 


## Texts and editions

The following texts are currently available for study. The texts were prepared with the use of ChatGPT and so might carry certain errors or inaccuracies. If you find them please let the administrator know via the project's [github](https://github.com/artificialsand/qabbala) or via [x](https://x.com/artificial_sand). 

**The Bible.**

- **King James Version** (translation first published 1611). Corpus: later standardized spelling, in the 1769 tradition; exact digital edition unverified. Contains the 66-book Protestant canon.
- **King James Version (1611, original spelling).** Digital transcription from [aruljohn/Bible-kjv-1611](https://github.com/aruljohn/Bible-kjv-1611). Contains 80 source book divisions, including the Apocrypha. Original spelling retained as supplied; exact printed-copy fidelity unverified. Paragraph marks removed and references excluded from analysis.
- **Geneva Bible** (1599). *The Bible: That Is, The Holy Scriptures Conteined in the Olde and Newe Testament*. Geneva edition.
- **Douay–Rheims Bible** (1582–1610). English translation from the Latin Vulgate. New Testament published at Rheims (1582); Old Testament at Douay (1609–1610). Later editions commonly incorporate Richard Challoner's eighteenth-century revisions.
- **Young's Literal Translation** (1898). Translated by Robert Young. Third revised edition. Edinburgh.
- **Darby Translation** (New Testament 1867; complete Bible 1890). Translated by John Nelson Darby.
- **American Standard Version** (1901). *The Holy Bible, Containing the Old and New Testaments*. New York: Thomas Nelson & Sons.
- **World English Bible** (modern, continuously revised). Public-domain English Bible based principally on the American Standard Version, with subsequent revisions.

**Laozi, Tao Te Ching (Daodejing).**

- **Gia-Fu Feng and Jane English** (1972). *Tao Te Ching*. New York: Alfred A. Knopf.
- **Stephen Mitchell** (1988). *Tao Te Ching: A New English Version*. New York: Harper & Row.
- **Victor H. Mair** (1990). *Tao Te Ching: The Classic Book of Integrity and the Way*. New York: Bantam Books. Translation informed by the Mawangdui manuscripts.
- **Stephen Addiss and Stanley Lombardo** (1993). *Tao Te Ching*. Indianapolis: Hackett Publishing.
- **Derek Lin** (1994). English translation of the *Tao Te Ching*, subsequently published in revised form as *Tao Te Ching: Annotated & Explained* (Woodstock, VT: SkyLight Paths, 2006).
- **J. H. McDonald** (1996). *Tao Te Ching*. Independent English translation, distributed online.
- **Jim Clatfelter** (2000). *Tao Te Ching*. Independent English rendering, distributed online.
- **David Hinton** (2002). *Tao Te Ching*. Washington, DC: Counterpoint.
- **Ron Hogan** (2004). *Getting Right with Tao*. Informal contemporary English interpretation, originally distributed online.
- **Agnieszka Solska** (2005). *Tao Te Ching*. Independent English translation, distributed online.
- **Ursula K. Le Guin**, with J. P. Seaton (1997; later editions 2009). *Lao Tzu: Tao Te Ching: A Book about the Way and the Power of the Way*. Boston: Shambhala Publications.

**Homer, The Iliad.**

- **George Chapman** (1611). *The Iliads of Homer, Prince of Poets*. London. English verse translation.
- **Alexander Pope** (1715–1720). *The Iliad of Homer*. Six volumes. London: Bernard Lintot. English verse translation.
- **William Cowper** (1791). *The Iliad and Odyssey of Homer, Translated into English Blank Verse*. London: J. Johnson.
- **Samuel Butler** (1898). *The Iliad of Homer, Rendered into English Prose*. London: Longmans, Green & Co.

**Homer, The Odyssey.**

- **George Chapman** (1614–1615). *The Whole Works of Homer*, including his English verse translation of the *Odyssey*.
- **Alexander Pope and collaborators** (1725–1726). *The Odyssey of Homer*. Five volumes. London: Bernard Lintot. English verse translation.
- **William Cowper** (1791). *The Iliad and Odyssey of Homer, Translated into English Blank Verse*. London: J. Johnson.
- **Samuel Butler** (1900). *The Odyssey of Homer, Rendered into English Prose*. London: Longmans, Green & Co.

**Hesiod, Theogony.**

- **Charles Abraham Elton** (1815). *The Remains of Hesiod the Ascræan, Including the Shield of Hercules*. London: Baldwin, Cradock and Joy. English verse translation.
- **Alexander William Mair** (1908). *Hesiod: The Poems and Fragments, Done into English Prose*. Oxford: Clarendon Press.
- **Hugh G. Evelyn-White** (1914). *Hesiod, the Homeric Hymns, and Homerica*. Loeb Classical Library, vol. 57. London: William Heinemann; New York: Macmillan.

**Ovid, Metamorphoses.**

- **George Sandys** (1632). *Ovid's Metamorphosis Englished, Mythologiz'd, and Represented in Figures*. Oxford: John Lichfield. English verse translation.
- **Brookes More** (1922). *The Metamorphoses of Ovid*. Boston: Cornhill Publishing Company. English verse translation.

**Virgil, The Aeneid (Aeneis).**

- **William Morris** (1876). *The Æneids of Virgil, Done into English Verse*. London: Ellis and White. English verse translation.
- **Edward Fairfax Taylor** (1903). *The Æneid of Virgil*. London: J. M. Dent & Co. English verse translation in Spenserian stanzas.

**The Epic of Gilgamesh.** 

- **R. Campbell Thompson** (1928). *The Epic of Gilgamish: A New Translation from a Collation of the Cuneiform Tablets in the British Museum*. London: Luzac & Co. English hexameter translation.
- **Independent AI-assisted translation** (2026). *The Epic of Gilgamesh*. Digital English rendering distributed through the *Large Language Literature* project.

**Beowulf.** 

- **William Morris and Alfred John Wyatt** (1895). *The Tale of Beowulf Done Out of the Old English Tongue*. Hammersmith: Kelmscott Press. Revised edition published in 1898.
- **Francis Barton Gummere** (1909). *The Oldest English Epic: Beowulf, Finnsburg, Waldere, Deor, Widsith, and the German Hildebrand*. New York: Macmillan. English verse translation.

**Dante Alighieri, The Divine Comedy (Commedia).**

- **Henry Francis Cary** (1814). *The Vision; or, Hell, Purgatory, and Paradise, of Dante Alighieri*. London: Taylor and Hessey. English blank-verse translation; the *Inferno* appeared separately in 1805–1806.
- **Henry Wadsworth Longfellow** (1867). *The Divine Comedy of Dante Alighieri*. Three volumes. Boston: Ticknor and Fields. English verse translation.

**John Milton, Paradise Lost.**

- **First edition** (1667). *Paradise Lost: A Poem Written in Ten Books*. London: Samuel Simmons. Ten-book version. Transcription: [Bibliotheca Augustana](https://www.tha.de/homes/harsch/anglica/Chronology/17thC/Milton/mil_p101.html).
- **Second edition** (1674). *Paradise Lost: A Poem in Twelve Books*. London: S. Simmons. Revised twelve-book version. Transcription: [Oxford Text Archive](https://llds.ling-phil.ox.ac.uk/llds/xmlui/handle/20.500.14106/3023).
- **Modernized edition.** Twelve-book text previously included as the 1674 edition; precise editorial provenance not established.

The historical transcriptions preserve historical spelling, subject to transcription errors; the modernized version is retained for comparison.

**William Blake, The Marriage of Heaven and Hell.**

- **William Blake** (c. 1790–1793). *The Marriage of Heaven and Hell*. London: privately produced illuminated book, combining prose, poetry and engraved imagery.

**T. S. Eliot, The Waste Land.**

- **T. S. Eliot** (1922). *The Waste Land*. First published in *The Criterion*, vol. 1, no. 1 (October 1922), and subsequently in *The Dial* (November 1922). Book edition: New York: Boni and Liveright, 1922.

**Aleister Crowley, The Book of the Law (Liber AL vel Legis).**

- **Aleister Crowley** (1904; first published 1909). *Liber AL vel Legis*. Written in Cairo in April 1904; first printed in *Thelema*, vol. I, 1909.

**Plotinus, The Enneads.**

- **Stephen MacKenna and B. S. Page** (1917–1930). *Plotinus: The Enneads*. Originally issued in five parts by the Medici Society, London. MacKenna translated the earlier volumes; the concluding Sixth Ennead was completed with B. S. Page.
- **Kenneth Sylvan Guthrie** (1918). *Plotinos: Complete Works, in Chronological Order, Grouped in Four Periods*. Four volumes. Alpine, NJ: Comparative Literature Press / Platonist Press. The archive rearranges Guthrie's translation into the conventional Porphyrian Ennead order (I.1–VI.9).
---
