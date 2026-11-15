import type { ObservableSign } from './signs';

/**
 * Symptom-report evaluation.
 *
 * CRITICAL SAFETY CONTRACT (covered by tests/symptomAssessment.test.ts):
 * - ANY reported sign → EMERGENCY_NOW, whether it is ongoing or has
 *   disappeared (possible TIA).
 * - "Not sure" → EMERGENCY_NOW guidance ("if in doubt, call").
 * - An empty report NEVER returns a reassuring result. It returns
 *   `NO_SIGN_REPORTED`, which the UI renders as "this does not rule out a
 *   stroke — if worried, call".
 * - There is no "no stroke" / "low risk" outcome by design.
 */
export type SymptomReport =
  | { kind: 'sign_observed'; sign: ObservableSign }
  | { kind: 'signs_disappeared' }
  | { kind: 'not_sure' }
  | { kind: 'none' };

export type AssessmentOutcome =
  | { action: 'EMERGENCY_NOW'; reason: 'sign_observed' | 'signs_disappeared' | 'not_sure'; sign?: ObservableSign }
  | { action: 'NO_SIGN_REPORTED'; message: 'does_not_rule_out' };

export function evaluateSymptomReport(report: SymptomReport): AssessmentOutcome {
  switch (report.kind) {
    case 'sign_observed':
      return { action: 'EMERGENCY_NOW', reason: 'sign_observed', sign: report.sign };
    case 'signs_disappeared':
      return { action: 'EMERGENCY_NOW', reason: 'signs_disappeared' };
    case 'not_sure':
      return { action: 'EMERGENCY_NOW', reason: 'not_sure' };
    case 'none':
    default:
      return { action: 'NO_SIGN_REPORTED', message: 'does_not_rule_out' };
  }
}

/** Route params passed to the emergency screen when a report triggers it. */
export function emergencyRouteFor(outcome: AssessmentOutcome): { pathname: '/emergency'; params: Record<string, string> } | null {
  if (outcome.action !== 'EMERGENCY_NOW') return null;
  const params: Record<string, string> = { trigger: outcome.reason };
  if (outcome.sign) params.sign = outcome.sign;
  return { pathname: '/emergency', params };
}
