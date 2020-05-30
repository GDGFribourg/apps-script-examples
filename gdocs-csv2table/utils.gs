/**
* Wrapped csv line parser
* @param s an array, each item being a csv line
* @param sep separator override
* @attribution : http://www.greywyvern.com/?post=258 (comments closed on blog :( )
*/
function parseCSV(a, sep) {
  // FROM https://stackoverflow.com/a/8932924
  // http://stackoverflow.com/questions/1155678/javascript-string-newline-character
  // var universalNewline = /\r\n|\r|\n/g;
  // var a = s.split(universalNewline);
  for (var i in a) {
    for (var f = a[i].split(sep = sep || ","), x = f.length - 1, tl; x >= 0; x--) {
      if (f[x].replace(/"\s+$/, '"').charAt(f[x].length - 1) == '"') {
        if ((tl = f[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
          f[x] = f[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
        } else if (x) {
          f.splice(x - 1, 2, [f[x - 1], f[x]].join(sep));
        } else f = f.shift().split(sep).concat(f);
      } else f[x].replace(/""/g, '"');
    } a[i] = f;
  }
  return a;
}


/**
* Normalize 2D array to make it a matrix (same number of columns for each rows)
* @param arr a 2D array
* @param filler a lambda returning what to put in new columns
*/
function normalize2DArray(arr, filler= () => "") {
  var max_cols = Math.max(...arr.map(row => row.length));
  // make all rows the same width
  for (var i = 0; i < arr.length; ++i) {
    for (var c = arr[i].length; c < max_cols; c++) {
      arr[i].push(filler());
    }
  }
  return arr;
}