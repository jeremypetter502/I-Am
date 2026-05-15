// Simple aesthetics scorer
function normalizeResponse(r){ return Math.round((((r - 1) / 4) * 100 + Number.EPSILON) * 100) / 100; }

export function scoreAesthetics(responses){
  // Expect at least 18 numeric responses (1-5). Missing responses are treated as neutral (3).
  const fill = (i)=> responses[i-1] || 3;
  const groups = {
    minimalism: [1,2,3,4],
    colorfulness: [5,6,7,8],
    warmth: [9,10,11,12],
    texture: [13,14,15],
    motion: [16,17,18]
  };
  const raw = {};
  const normalized = {};
  for(const k of Object.keys(groups)){
    const inds = groups[k];
    const vals = inds.map(i=> fill(i));
    const avg = vals.reduce((s,v)=>s+v,0)/vals.length;
    raw[k] = Math.round((avg + Number.EPSILON) * 100)/100;
    normalized[k] = normalizeResponse(avg);
  }
  return { raw, normalized, count: responses.length };
}

// CommonJS compatibility
if(typeof module !== 'undefined' && module.exports){
  module.exports = { scoreAesthetics };
}