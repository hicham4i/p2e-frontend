String.prototype.trimWhiteSpaces = trimWhiteSpaces;
Number.prototype.countDecimals = countDecimals;

interface String {
  trimWhiteSpaces: typeof trimWhiteSpaces;
}
interface Number {
    countDecimals: typeof countDecimals;
}

function trimWhiteSpaces() {
  return this.split(' ').join('');
}
function countDecimals() {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}