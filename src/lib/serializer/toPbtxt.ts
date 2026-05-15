import * as protobuf from 'protobufjs';
import * as path from 'path';

const protoPath = path.resolve(__dirname, '..', '..', '..', 'specs', '001-personality-context-site', 'contextfile.proto');
let root: protobuf.Root | null = null;
function getRoot(): protobuf.Root {
  if (root) return root;
  root = protobuf.loadSync(protoPath);
  return root;
}

export function toPbtxt(json: any): string {
  const r = getRoot();
  const Type = r.lookupType('personality.ContextFile');
  const err = Type.verify(json);
  if (err) throw new Error('Invalid ContextFile: ' + err);
  const message = Type.fromObject(json);
  // protobufjs does not provide a stable text-format writer in all environments.
  // Use a lightweight pbtxt marker with the validated object serialized as JSON
  // so round-tripping is deterministic and validated against the proto.
  const obj = Type.toObject(message, { longs: String, enums: String, bytes: String });
  return '//pbtxt\n' + JSON.stringify(obj, null, 2);
}

export function fromPbtxt(text: string): any {
  const r = getRoot();
  const Type = r.lookupType('personality.ContextFile');
  if (typeof text !== 'string') throw new Error('Expected text');
  if (text.startsWith('//pbtxt\n')) {
    const json = JSON.parse(text.slice('//pbtxt\n'.length));
    const err = Type.verify(json);
    if (err) throw new Error('Invalid ContextFile pbtxt: ' + err);
    return Type.fromObject(json);
  }
  // fallback: try parse JSON and validate
  const parsed = JSON.parse(text);
  const err2 = Type.verify(parsed);
  if (err2) throw new Error('Invalid ContextFile: ' + err2);
  return Type.fromObject(parsed);
}
