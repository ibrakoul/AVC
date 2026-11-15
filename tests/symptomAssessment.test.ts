import { emergencyRouteFor, evaluateSymptomReport } from '@/features/stroke/symptomAssessment';
import { BEFAST_SEQUENCE, FAST_SEQUENCE, sequenceFor } from '@/features/stroke/signs';

describe('symptom assessment — critical safety contract', () => {
  const scenarios = [
    ['sudden facial drooping', 'F'],
    ['sudden arm weakness', 'A'],
    ['sudden speech difficulty', 'S'],
    ['sudden vision loss', 'E'],
    ['sudden balance problems', 'B'],
  ] as const;

  it.each(scenarios)('%s → EMERGENCY_NOW with emergency route', (_label, sign) => {
    const outcome = evaluateSymptomReport({ kind: 'sign_observed', sign });
    expect(outcome).toEqual({ action: 'EMERGENCY_NOW', reason: 'sign_observed', sign });
    expect(emergencyRouteFor(outcome)).toEqual({ pathname: '/emergency', params: { trigger: 'sign_observed', sign } });
  });

  it('symptoms that have disappeared still → EMERGENCY_NOW (possible TIA)', () => {
    const outcome = evaluateSymptomReport({ kind: 'signs_disappeared' });
    expect(outcome.action).toBe('EMERGENCY_NOW');
    expect(emergencyRouteFor(outcome)?.params.trigger).toBe('signs_disappeared');
  });

  it('"not sure" → EMERGENCY_NOW ("if in doubt, call")', () => {
    expect(evaluateSymptomReport({ kind: 'not_sure' }).action).toBe('EMERGENCY_NOW');
  });

  it('a negative/empty report NEVER excludes stroke and never reassures', () => {
    const outcome = evaluateSymptomReport({ kind: 'none' });
    expect(outcome).toEqual({ action: 'NO_SIGN_REPORTED', message: 'does_not_rule_out' });
    // There is no "no stroke" / "safe" / "low risk" outcome in the type at all.
    expect(JSON.stringify(outcome)).not.toMatch(/safe|no_stroke|low|normal|ok/i);
  });
});

describe('FAST / BE-FAST sequences', () => {
  it('FAST is F, A, S, T', () => expect(FAST_SEQUENCE).toEqual(['F', 'A', 'S', 'T']));
  it('BE-FAST adds Balance and Eyes', () => expect(BEFAST_SEQUENCE).toEqual(['B', 'E', 'F', 'A', 'S', 'T']));
  it('both end with Time (call)', () => {
    expect(sequenceFor('FAST').at(-1)).toBe('T');
    expect(sequenceFor('BE-FAST').at(-1)).toBe('T');
  });
});
