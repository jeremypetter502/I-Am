const { serializePbtxt, parsePbtxt } = require('../importer/pbtxt');

function toPbtxt(json) {
  return serializePbtxt(json);
}
function fromPbtxt(text) {
  return parsePbtxt(text);
}
module.exports = { toPbtxt, fromPbtxt };
