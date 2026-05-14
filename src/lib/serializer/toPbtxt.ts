export function toPbtxt(json: any): string {
  // Placeholder — implement using protobufjs
  return JSON.stringify(json, null, 2);
}

export function fromPbtxt(text: string): any {
  // Placeholder — implement using protobufjs
  try { return JSON.parse(text); } catch { return null; }
}
