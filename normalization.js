'use strict';
// Preserve source spelling in the UI; fold Latin characters for analysis only.
const LATIN_EXPANSIONS = Object.freeze({'æ':'ae','Æ':'AE','œ':'oe','Œ':'OE','ß':'ss','ẞ':'SS','ø':'o','Ø':'O','ł':'l','Ł':'L','ð':'d','Ð':'D','þ':'th','Þ':'TH','đ':'d','Đ':'D','ı':'i','ſ':'s','ħ':'h','Ħ':'H'});
function normalizeLatin(text){
  if(!/[^\x00-\x7F]/.test(text))return text;
  return text.replace(/\p{Script=Latin}\p{M}*/gu, cluster=>Array.from(cluster.normalize('NFKD')).map(c=>LATIN_EXPANSIONS[c]??c).join('').replace(/\p{M}/gu,''));
}
function normalizedSearch(text){return normalizeLatin(text).toLowerCase();}
function cipherValue(text,cfg){
  if(!cfg||!cfg.numeric)return null;
  let sum=0;
  for(let c of normalizeLatin(text)){
    if(!cfg.caseSensitive)c=c.toLowerCase();
    if(cfg.diacritics)c=c.normalize('NFD').replace(/\p{M}/gu,'');
    for(const x of c){if(Object.prototype.hasOwnProperty.call(cfg.map,x))sum+=cfg.map[x];else if(!cfg.ignoreDigits&&/^[0-9]$/.test(x))sum+=Number(x);}
  }
  return sum;
}
