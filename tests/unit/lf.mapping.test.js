import { describe, test, expect } from 'vitest';
import path from 'path';
import { LfMappings } from '../../src/lib/iam/lfMappings.js';

describe('LF mappings loader', () => {
  test('loads segment mapping and metric mapping for AESTHETIC', () => {
    const specsDir = path.resolve(__dirname, '..', '..', 'specs', '006-long-form-iam', 'mappings');
    const loader = new LfMappings(specsDir);
    const full = loader.mapSegment('AES');
    expect(full).toBe('AESTHETIC');
    const metric = loader.mapMetric('AESTHETIC', 'min');
    expect(metric).toBe('minimalism');
  });
});
