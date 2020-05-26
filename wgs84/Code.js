function getOrt(plz) {
  var sheet = SpreadsheetApp.getActiveSheet()
  var data = sheet.getDataRange().getValues()
  
  // Binary search.
  // Invariant : data[left][1] < plz and data[right][1] >= plz
  // data[0][0] = NEGATIVE_INFINITY
  // data[data.length][0] = POSITIVE_INFINITY
  var left = 0
  var right = data.length
  
  while (left + 1 < right) {
    let m = Math.floor((left + right) / 2)
    if (data[m][1] < plz) {
      left = m
    } else {
      right = m
    }
  }
    
  var result = new Array()
  while (right < data.length && data[right][1] == plz) {
    result.push(data[right][0])
    right += 1
  }
  return result
}

function doGet(e) {
  var plz = e.parameter['plz']
  var cache = CacheService.getDocumentCache()
  var result = {version: 4}
  var ort = cache.get(plz)
  if (ort == null) {
    result.cache_hit = false
    result.ort = getOrt(plz)
    cache.put(plz, JSON.stringify(result.ort))
  } else {
    result.cache_hit = true
    result.ort = JSON.parse(ort)
  }
  
  var output = ContentService.createTextOutput()
  output.setMimeType(MimeType.JSON)
  output.append(JSON.stringify(result))
  return output
}
