import fs from 'fs';
import path from 'path';

function readJsonSafe(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

function defaultSpecsDir() {
  // Resolve from repository root
  return path.resolve(new URL(import.meta.url).pathname, '..', '..', '..', 'specs', '006-long-form-iam', 'mappings');
}

export class LfMappings {
  constructor(specsDir) {
    this.specsDir = specsDir || defaultSpecsDir();
    this.segmentMap = {};
    this.metricMaps = {}; // key: fullSegmentName or compact code
    this.load();
  }

  load() {
    // In browser environment `fs` is not available; skip synchronous filesystem loading.
    if (typeof window !== 'undefined') return;
    // Load segment-mapping.json
    const segFile = path.join(this.specsDir, 'segment-mapping.json');
    const seg = readJsonSafe(segFile);
    if (seg && typeof seg === 'object') this.segmentMap = seg;

    // Load any metric-mapping-*.json files
    try {
      const files = fs.readdirSync(this.specsDir || '.');
      files.forEach((f) => {
        const m = f.match(/^metric-mapping-(.+)\.json$/);
        if (m) {
          const key = m[1].toUpperCase();
          const obj = readJsonSafe(path.join(this.specsDir, f));
          if (obj) this.metricMaps[key] = obj;
        }
      });
    } catch (e) {}
  }

  // Map compact segment code to full LF name
  mapSegment(compactCode) {
    if (!compactCode) return null;
    const key = String(compactCode).toUpperCase();
    return this.segmentMap[key] || null;
  }

  // Map metric code to LF metric name given a segment full name or compact code
  mapMetric(segmentKey, metricCode) {
    if (!metricCode) return null;
    const metric = String(metricCode).toLowerCase();
    // Try using segment full name key
    const segKey = String(segmentKey || '').toUpperCase();
    const candidate = this.metricMaps[segKey] && this.metricMaps[segKey][metric];
    if (candidate) return candidate;
    // fallback: try using compact segment code mapping to full name
    const full = this.mapSegment(segKey) || segKey;
    const fm = this.metricMaps[full] && this.metricMaps[full][metric];
    if (fm) return fm;
    // fallback: return the metricCode itself lowercased
    return metric;
  }
}

export function defaultSpecsDirExport() {
  return defaultSpecsDir();
}
