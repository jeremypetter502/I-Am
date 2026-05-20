import { serializePbtxt, parsePbtxt } from '../importer/pbtxt.js';

export function toPbtxt(json) {
  return serializePbtxt(json);
}
export function fromPbtxt(text) {
  return parsePbtxt(text);
}
