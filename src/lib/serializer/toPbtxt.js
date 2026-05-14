const { serializePbtxt, parsePbtxt } = require('../../src/lib/importer/pbtxt');

function toPbtxt(json) {
  return serializePbtxt(json);
}
function fromPbtxt(text) {
  return parsePbtxt(text);
}
module.exports = { toPbtxt, fromPbtxt };
