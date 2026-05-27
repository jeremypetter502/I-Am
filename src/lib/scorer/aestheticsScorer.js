// Aesthetics scorer — aligned with aesthetic_mapping_spec.txt
// Item numbers match aesthetic_module.txt (1-indexed).
// Semantic-differential items (1–10): left anchor = 1, right anchor = 5.
// Likert items (11–32): 1 = strongly disagree, 5 = strongly agree.

const norm = (r) => Math.round((((r - 1) / 4) * 100 + Number.EPSILON) * 100) / 100;
const inv  = (x) => Math.round((100 - x + Number.EPSILON) * 100) / 100;
const mean = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
const r2   = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

export function scoreAesthetics(responses) {
  // Safely read 1-indexed item; missing/invalid → neutral 3.
  const r = (i) => {
    const v = responses[i - 1];
    const n = Number(v);
    return (v !== null && v !== undefined && Number.isFinite(n) && n >= 1 && n <= 5) ? n : 3;
  };

  // Composites per aesthetic_mapping_spec.txt
  // Q3 = Simple—Complex (left=Simple=1), Q4 = Minimal—Ornate (left=Minimal=1)
  // Invert so higher score = more minimal/simple.
  const minimalism     = r2(mean([inv(norm(r(3))), inv(norm(r(4))), norm(r(11)), norm(r(12)), inv(norm(r(13))), norm(r(26))]));
  const colorfulness   = r2(mean([norm(r(14)), inv(norm(r(15)))]));
  // Q6 = Warm—Cool; left=Warm=1; invert → higher = warmer.
  const warmth         = inv(norm(r(6)));
  // Q8 = Clean—Textured; inv → higher = prefers clean/flat.
  const prefers_clean  = inv(norm(r(8)));
  const motion         = r2(mean([norm(r(17)), inv(norm(r(18)))]));
  // Q5 = Modern—Traditional; left=Modern=1; inv → higher = more modern.
  const modernity      = inv(norm(r(5)));
  const aesthetic_importance = norm(r(29));

  const imagery = {
    photos:        norm(r(19)),
    illustrations: norm(r(20))
  };

  const typography = {
    prefers_serif:         norm(r(21)),
    prefers_sans:          norm(r(22)),
    prefers_large_headings: norm(r(23)),
    prioritize_readability: norm(r(26))
  };

  const layout = {
    grid_consistency:    norm(r(24)),
    experimental_layouts: norm(r(25))
  };

  const context = {
    home_style: norm(r(31)), // higher = playful & expressive
    work_style: norm(r(32))  // higher = minimal & professional
  };

  const tags = {
    prefers_minimal:                 minimalism >= 65,
    prefers_bold_colors:             colorfulness >= 65,
    prefers_photos:                  imagery.photos >= 65,
    likes_motion:                    motion >= 60,
    typography_priority_readability: typography.prioritize_readability >= 70
  };

  // Keep `normalized` wrapper for backward compatibility with serializer/tests.
  const normalized = { minimalism, colorfulness, warmth, prefers_clean, motion, modernity, aesthetic_importance };

  return { normalized, imagery, typography, layout, context, tags, count: responses.length };
}

