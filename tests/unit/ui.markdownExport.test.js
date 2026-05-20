import { describe, it, expect } from 'vitest';
const { toIamMarkdown, scoreAndExport } = require('../../src/ui/services/profileService.js');

function extractJsonPayload(markdown) {
  const match = markdown.match(/```json\s*([\s\S]*?)```/i);
  if (!match) throw new Error('Expected markdown to contain a JSON code fence');
  return JSON.parse(match[1].trim());
}

describe('IAM markdown export', () => {
  it('contains IAM compact string section and parse-friendly base context markdown', () => {
    const context = {
      profile: {
        iam: { code: 'IAM/0.2:O70C60E50A40N30/COMM/DRV85ANC40EXP20AMB15' },
        base: { name: 'Jeremy Doe', skills: 'JavaScript, UX', job_title: 'Engineer', onet: { soc_code: '15-1252', title: 'Software Developers' } },
        modules: {
          skills: {
            filtered: [
              { name: 'Critical Thinking', normalized_score: 85, listed_status: 'confirmed' },
              { name: 'Programming', normalized_score: 45, listed_status: 'conditional' }
            ]
          }
        },
        raw_scores: { openness: 32 }
      },
      raw_responses: { data: { ipip: [3, 3] } }
    };

    const md = toIamMarkdown(context);
    expect(md.includes('# IAM Context File')).toBe(true);
    expect(md.includes('## Compact IAM String')).toBe(true);
    expect(md.includes('IAM/0.2:O70C60E50A40N30/COMM/DRV85ANC40EXP20AMB15')).toBe(true);
    expect(md.includes('## Basic Context')).toBe(true);
    expect(md.includes('<!-- IAM_BASE_CONTEXT_START -->')).toBe(true);
    expect(md.includes('- name: Jeremy Doe')).toBe(true);
    expect(md.includes('- skills: JavaScript, UX')).toBe(true);
    expect(md.includes('- job_title: Engineer')).toBe(true);
    expect(md.includes('- onet.soc_code: 15-1252')).toBe(true);
    expect(md.includes('- onet.title: Software Developers')).toBe(true);
    expect(md.includes('## Skills Assessment')).toBe(true);
    expect(md.includes('Critical Thinking: 85')).toBe(true);
    expect(md.includes('Programming: 45')).toBe(true);
    expect(md.includes('"raw_scores"')).toBe(true);
    expect(md.includes('"raw_responses"')).toBe(true);
  });

  it('does not duplicate ipip responses inside raw_responses.data', () => {
    const context = scoreAndExport(Array(50).fill(3));
    const md = toIamMarkdown(context);
    const payload = extractJsonPayload(md);

    expect(context.profile.modules.ipip.responses).toHaveLength(50);
    expect(context.raw_responses.data.ipip).toBeUndefined();
    expect(md.includes('"raw_responses"')).toBe(true);
    expect(payload.raw_responses.data.ipip).toBeUndefined();
  });

  it('sanitizes stale cached raw_responses before markdown export', () => {
    const stale = {
      profile: {
        modules: {
          ipip: {
            responses: [3, 3]
          }
        }
      },
      raw_responses: {
        data: {
          ipip: [3, 3],
          music: [1]
        }
      }
    };

    const payload = extractJsonPayload(toIamMarkdown(stale));
    expect(payload.raw_responses.data.ipip).toBeUndefined();
    expect(payload.raw_responses.data.music).toEqual([1]);
  });

  it('derives IAM code when profile.iam is missing', () => {
    const contextWithoutIam = {
      profile: {
        scores: {
          openness: 52.5,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 55,
          neuroticism: 50
        },
        modules: {
          skills: {
            filtered: [
              { index: 1, normalized_score: 20 }
            ]
          }
        },
        base: {
          onet: {
            soc_code: '15-1255',
            title: 'Web and Digital Interface Designers'
          }
        }
      },
      raw_responses: { data: {} }
    };

    const md = toIamMarkdown(contextWithoutIam);
    expect(md.includes('`IAM/0.4:O53C50E50A55N50/CAR15125500S0120`')).toBe(true);
    expect(md.includes('`IAM code unavailable`')).toBe(false);
  });

  it('derives IAM with canonical STATE segment when state module exists', () => {
    const contextWithoutIam = {
      profile: {
        scores: {
          openness: 52.5,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 55,
          neuroticism: 50
        },
        modules: {
          state: {
            bandwidth: 30,
            mode: 'convergent',
            horizon: 'now',
            stakes: 'critical'
          }
        }
      },
      raw_responses: { data: {} }
    };

    const md = toIamMarkdown(contextWithoutIam);
    expect(md.includes('STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical')).toBe(true);
  });
});
