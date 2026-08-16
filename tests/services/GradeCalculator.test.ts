import { describe, it, expect } from 'vitest';
import { computeFinalScore, predikatOf, isPassed } from '../../app/services/GradeCalculator';
import type { GradeComponentWeight } from '../../app/services/GradeCalculator';

const components: GradeComponentWeight[] = [
  { type: 'task', name: 'Tugas', weight: 20 },
  { type: 'daily_quiz', name: 'Kuis Harian', weight: 20 },
  { type: 'midterm', name: 'UTS', weight: 30 },
  { type: 'final', name: 'UAS', weight: 30 },
];

describe('computeFinalScore', () => {
  it('weights all entered components', () => {
    const scores = { task: 80, daily_quiz: 70, midterm: 90, final: 60 };
    expect(computeFinalScore(scores, components)).toBe(75);
  });

  it('redistributes weight when a component is missing', () => {
    const scores = { task: 80, daily_quiz: 70 };
    expect(computeFinalScore(scores, components)).toBe(75);
  });

  it('uses the single entered component when only one exists', () => {
    const scores = { final: 60 };
    expect(computeFinalScore(scores, components)).toBe(60);
  });

  it('returns null when no component has a score', () => {
    expect(computeFinalScore({}, components)).toBeNull();
  });

  it('rounds to one decimal place', () => {
    const scores = { task: 66, daily_quiz: 67, midterm: 66 };
    expect(computeFinalScore(scores, components)).toBe(66.3);
  });
});

describe('predikatOf', () => {
  it('maps A >= 90', () => {
    expect(predikatOf(90, 75)).toBe('A');
    expect(predikatOf(95, 75)).toBe('A');
  });

  it('maps B >= 80', () => {
    expect(predikatOf(80, 75)).toBe('B');
    expect(predikatOf(89, 75)).toBe('B');
  });

  it('maps C >= kkm', () => {
    expect(predikatOf(75, 75)).toBe('C');
    expect(predikatOf(79, 75)).toBe('C');
  });

  it('maps D below kkm', () => {
    expect(predikatOf(74, 75)).toBe('D');
    expect(predikatOf(0, 75)).toBe('D');
  });

  it('returns null for missing score', () => {
    expect(predikatOf(null, 75)).toBeNull();
  });
});

describe('isPassed', () => {
  it('passes when score meets kkm', () => {
    expect(isPassed(75, 75)).toBe(true);
    expect(isPassed(90, 75)).toBe(true);
  });

  it('fails when score is below kkm', () => {
    expect(isPassed(74.9, 75)).toBe(false);
  });

  it('returns null for missing score', () => {
    expect(isPassed(null, 75)).toBeNull();
  });
});
