#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { scoreIpip } = require('../src/lib/scorer/ipipScorer');
const { toContextFile } = require('../src/lib/serializer/toContextFile');

// Example: all 3s
const responses = Array(50).fill(3);
const scored = scoreIpip(responses);
const ctx = toContextFile({ id: 'example-1', summary: 'Example profile', traits: scored.normalized });
const outPath = path.resolve('specs/001-personality-context-site/example.generated.json');
fs.writeFileSync(outPath, JSON.stringify(ctx, null, 2));
console.log('Wrote', outPath);
