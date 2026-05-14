// Lightweight pbtxt stub: serialize as labeled JSON to allow round-trip in tests
function serializePbtxt(json) {
  return '//pbtxt\n' + JSON.stringify(json);
}
function parsePbtxt(text) {
  if (typeof text !== 'string') throw new Error('Expected text');
  if (text.startsWith('//pbtxt\n')) {
    return JSON.parse(text.slice('//pbtxt\n'.length));
  }
  // fallback: try parse JSON
  return JSON.parse(text);
}
module.exports = { serializePbtxt, parsePbtxt };
