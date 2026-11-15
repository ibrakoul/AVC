import { buildPreventionInsights } from '@/features/prevention/insights';

describe('prevention insights', () => {
  it('lists factors answered "yes" as topics to discuss, without any score', () => {
    const r = buildPreventionInsights({ hypertension: 'yes', smoking: 'yes', diabetes: 'no', cholesterol: 'unknown' });
    expect(r.discussTopics).toEqual(['hypertension', 'smoking']);
    expect(r.unknownFactors).toEqual(['cholesterol']);
    expect(Object.keys(r)).not.toContain('score');
    expect(JSON.stringify(r)).not.toMatch(/score|risk_level|high_risk|low_risk/i);
  });

  it('personalises recommendations first, always includes medical follow-up', () => {
    const r = buildPreventionInsights({ smoking: 'yes', atrialFibrillation: 'yes' });
    expect(r.recommendations[0]).toBe('smoking');
    expect(r.recommendations).toContain('adherence');
    expect(r.recommendations).toContain('followUp');
    expect(new Set(r.recommendations).size).toBe(r.recommendations.length);
  });

  it('still provides general education with no answers', () => {
    const r = buildPreventionInsights({});
    expect(r.discussTopics).toEqual([]);
    expect(r.recommendations).toEqual(['followUp', 'bloodPressure', 'nutrition', 'activity', 'sleep']);
  });
});
