// Simple music preference scorer
function normalizeResponse(r){ return Math.round((((r - 1) / 4) * 100 + Number.EPSILON) * 100) / 100; }

export function scoreMusic(responses){
  // Define 5 factors with 4 items each (20 items total)
  const groups = {
    mellow: [1,4,6,10],
    intense: [2,8,11,13],
    sophisticated: [3,5,9,15],
    contemporary: [17,18,20,14],
    unpretentious: [7,12,16,19]
  };
  const fill = (i)=> responses[i-1] || 3;
  const raw = {};
  const normalized = {};
  for(const k of Object.keys(groups)){
    const inds = groups[k];
    const vals = inds.map(i=> fill(i));
    const avg = vals.reduce((s,v)=>s+v,0)/inds.length;
    raw[k] = Math.round((avg + Number.EPSILON) * 100)/100;
    normalized[k] = normalizeResponse(avg);
  }
  return { raw, normalized, count: responses.length };
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = { scoreMusic };
}