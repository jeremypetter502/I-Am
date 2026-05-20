export function scoreIpip(responses) {
  const REVERSE_INDICES = {
    O: [42,44,46,48,50],
    C: [22,24,26,28,30],
    E: [2,4,6,8,10],
    A: [12,14,16,18,20],
    N: [32,34,36,38,40]
  };

  if (!Array.isArray(responses) || responses.length !== 50) throw new Error('responses must be array of length 50');
  // responses are 1..5
  const traits = { O:0, C:0, E:0, A:0, N:0 };
  const raw = { O:0, C:0, E:0, A:0, N:0 };
  const indicesByTrait = {
    O: [41,42,43,44,45,46,47,48,49,50],
    C: [21,22,23,24,25,26,27,28,29,30],
    E: [1,2,3,4,5,6,7,8,9,10],
    A: [11,12,13,14,15,16,17,18,19,20],
    N: [31,32,33,34,35,36,37,38,39,40]
  };
  // For each trait, sum items with reverse-keying where needed
  for (const t of Object.keys(indicesByTrait)) {
    let sum = 0;
    for (const idx of indicesByTrait[t]) {
      const resp = responses[idx-1];
      // determine if this item is reverse-scored per REVERSE_INDICES
      const revList = REVERSE_INDICES[t];
      const isRev = revList.includes(idx);
      const val = isRev ? (6 - resp) : resp;
      sum += val;
    }
    raw[t] = sum; // range 10..50
    const normalized = ((sum - 10) / 40) * 100;
    traits[t] = Math.round((normalized + Number.EPSILON) * 100) / 100; // two decimals
  }
  return { raw, normalized: traits };
}

export default { scoreIpip };
