// Small compatibility adapter for the unmodified ciphers.news ciphers.js.
// It supplies the cipher constructor expected by that file.
function cipher(name, category, h, s, l, chars, values, diacritics, enabled, caseSensitive, derivation, ignoreDigits) {
  this.cipherName=name;
  this.cipherCategory=category;
  this.H=h; this.S=s; this.L=l;
  this.cArr=chars;
  this.vArr=values;
  this.diacriticsAsRegular=diacritics !== false;
  this.enabled=enabled === true;
  this.caseSensitive=caseSensitive === true;
  this.derivation=derivation || null;
  this.ignoreDigits=ignoreDigits === true;
}
