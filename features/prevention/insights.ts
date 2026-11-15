import { RISK_FACTORS, type PreventionAnswers, type RiskFactor } from '@/types/health';

/**
 * Educational insights from the prevention questionnaire.
 *
 * By design this does NOT compute a risk score or a risk category: no
 * validated clinical score is implemented. It only lists topics worth
 * discussing with a healthcare professional and picks educational content.
 */
export type RecommendationId =
  | 'nutrition'
  | 'activity'
  | 'bloodPressure'
  | 'smoking'
  | 'alcohol'
  | 'sleep'
  | 'diabetes'
  | 'followUp'
  | 'adherence';

export interface PreventionInsights {
  discussTopics: RiskFactor[];
  unknownFactors: RiskFactor[];
  recommendations: RecommendationId[];
  answeredCount: number;
}

const TREATED_CONDITIONS: RiskFactor[] = ['hypertension', 'diabetes', 'cholesterol', 'atrialFibrillation', 'previousStroke'];

export function buildPreventionInsights(answers: PreventionAnswers): PreventionInsights {
  const discussTopics = RISK_FACTORS.filter((f) => answers[f] === 'yes');
  const unknownFactors = RISK_FACTORS.filter((f) => answers[f] === 'unknown');
  const answeredCount = RISK_FACTORS.filter((f) => answers[f] !== undefined).length;

  const personalised: RecommendationId[] = [];
  const has = (f: RiskFactor) => answers[f] === 'yes';
  if (has('hypertension') || answers.hypertension === 'unknown') personalised.push('bloodPressure');
  if (has('smoking')) personalised.push('smoking');
  if (has('alcohol')) personalised.push('alcohol');
  if (has('diabetes')) personalised.push('diabetes');
  if (has('inactivity') || has('overweight')) personalised.push('activity');
  if (has('overweight') || has('cholesterol')) personalised.push('nutrition');
  if (TREATED_CONDITIONS.some(has)) personalised.push('adherence');

  const baseline: RecommendationId[] = ['followUp', 'bloodPressure', 'nutrition', 'activity', 'sleep'];
  const recommendations = [...new Set<RecommendationId>([...personalised, ...baseline])];

  return { discussTopics, unknownFactors, recommendations, answeredCount };
}
