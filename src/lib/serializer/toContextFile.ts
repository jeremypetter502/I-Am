export function toContextFile(profile: any, options?: any) {
  // Placeholder serializer — construct object matching contextfile.schema.json
  return {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    profile,
    preferences: {},
    modules: []
  };
}
