import { LearnerProfile } from '../types/learner';
import { UserConceptState } from '../types/subject';

export interface SimulatedPreset {
  profile: LearnerProfile;
  conceptStates: Record<string, Partial<UserConceptState>>;
  description: string;
}

export const SIMULATED_PRESETS: Record<string, SimulatedPreset> = {
  fast: {
    description: 'High accuracy (94%), rapid response times (<6s), fast knowledge acquisition rate.',
    profile: {
      id: 'sim-fast',
      name: 'Dr. Elena Vance (Simulated Fast Learner)',
      avatarSeed: 'elena',
      educationLevel: 'graduate',
      primarySubjectId: 'subj-math',
      targetGoal: 'master_subject',
      preferredSessionMinutes: 25,
      pacePreference: 'accelerated',
      modalities: {
        visual: 0.8,
        reading: 0.9,
        practice: 0.9,
        interactive: 0.8,
        socratic: 0.7,
        directExplanation: 0.9,
        analogies: 0.75,
      },
      overallMastery: 0.91,
      overallRetention: 0.96,
      learningMomentum: 94,
      calibrationScore: 92,
      currentStreakDays: 14,
      totalStudyMinutes: 480,
      conceptsMasteredCount: 11,
      totalAttemptsCount: 142,
      accuracyRate: 0.94,
      averageResponseTimeSeconds: 5.4,
      personaType: 'analytical',
      isSimulated: true,
      simulatedPreset: 'fast',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    conceptStates: {
      'math-alg-vars': { masteryScore: 0.98, retentionScore: 0.95, stabilityDays: 45, masteryTier: 'mastery' },
      'math-alg-lin-eq': { masteryScore: 0.94, retentionScore: 0.92, stabilityDays: 32, masteryTier: 'mastery' },
      'math-alg-quad': { masteryScore: 0.89, retentionScore: 0.88, stabilityDays: 20, masteryTier: 'advanced' },
      'math-calc-limits': { masteryScore: 0.92, retentionScore: 0.94, stabilityDays: 25, masteryTier: 'advanced' },
      'math-calc-deriv': { masteryScore: 0.86, retentionScore: 0.85, stabilityDays: 15, masteryTier: 'advanced' },
      'math-calc-integrals': { masteryScore: 0.78, retentionScore: 0.80, stabilityDays: 10, masteryTier: 'proficient' },
    }
  },

  struggling: {
    description: 'Low accuracy (36%), persistent prerequisite bottlenecks in Linear Equations and Negative Signs.',
    profile: {
      id: 'sim-struggling',
      name: 'Marcus Chen (Simulated Struggling Learner)',
      avatarSeed: 'marcus',
      educationLevel: 'high_school',
      primarySubjectId: 'subj-math',
      targetGoal: 'improve_grades',
      preferredSessionMinutes: 15,
      pacePreference: 'deliberate',
      modalities: {
        visual: 0.9,
        reading: 0.4,
        practice: 0.85,
        interactive: 0.95,
        socratic: 0.8,
        directExplanation: 0.6,
        analogies: 0.9,
      },
      overallMastery: 0.38,
      overallRetention: 0.54,
      learningMomentum: 52,
      calibrationScore: 68,
      currentStreakDays: 3,
      totalStudyMinutes: 160,
      conceptsMasteredCount: 1,
      totalAttemptsCount: 88,
      accuracyRate: 0.36,
      averageResponseTimeSeconds: 22.8,
      personaType: 'intuitive',
      isSimulated: true,
      simulatedPreset: 'struggling',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    conceptStates: {
      'math-alg-vars': { masteryScore: 0.65, retentionScore: 0.70, stabilityDays: 6, masteryTier: 'proficient' },
      'math-alg-lin-eq': { masteryScore: 0.32, retentionScore: 0.48, stabilityDays: 2.1, masteryTier: 'developing', isPrerequisiteBottleneck: true },
      'math-alg-quad': { masteryScore: 0.20, retentionScore: 0.35, stabilityDays: 1.2, masteryTier: 'novice', isPrerequisiteBottleneck: true },
      'math-calc-limits': { masteryScore: 0.15, retentionScore: 0.30, stabilityDays: 1.0, masteryTier: 'novice' },
    }
  },

  overconfident: {
    description: 'Consistently rates high confidence (85-100%) but accuracy is only 42% (Calibration Misalignment).',
    profile: {
      id: 'sim-overconfident',
      name: 'Julian Thorne (Simulated Overconfident Learner)',
      avatarSeed: 'julian',
      educationLevel: 'undergraduate',
      primarySubjectId: 'subj-math',
      targetGoal: 'pass_exam',
      preferredSessionMinutes: 20,
      pacePreference: 'balanced',
      modalities: {
        visual: 0.7,
        reading: 0.8,
        practice: 0.8,
        interactive: 0.7,
        socratic: 0.6,
        directExplanation: 0.7,
        analogies: 0.7,
      },
      overallMastery: 0.46,
      overallRetention: 0.62,
      learningMomentum: 65,
      calibrationScore: 48, // Low calibration score due to overconfidence
      currentStreakDays: 5,
      totalStudyMinutes: 210,
      conceptsMasteredCount: 2,
      totalAttemptsCount: 95,
      accuracyRate: 0.42,
      averageResponseTimeSeconds: 8.2,
      personaType: 'experimental',
      isSimulated: true,
      simulatedPreset: 'overconfident',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    conceptStates: {
      'math-alg-vars': { masteryScore: 0.80, retentionScore: 0.82, stabilityDays: 12, masteryTier: 'advanced' },
      'math-alg-lin-eq': { masteryScore: 0.45, retentionScore: 0.58, stabilityDays: 4.0, masteryTier: 'developing' },
      'math-alg-quad': { masteryScore: 0.35, retentionScore: 0.40, stabilityDays: 2.0, masteryTier: 'developing' },
      'math-calc-limits': { masteryScore: 0.28, retentionScore: 0.38, stabilityDays: 1.8, masteryTier: 'novice' },
    }
  },

  underconfident: {
    description: 'High accuracy (91%) but rates confidence very low (15-35%). System provides validation & affirmation.',
    profile: {
      id: 'sim-underconfident',
      name: 'Aria Sterling (Simulated Underconfident Learner)',
      avatarSeed: 'aria',
      educationLevel: 'undergraduate',
      primarySubjectId: 'subj-math',
      targetGoal: 'master_subject',
      preferredSessionMinutes: 30,
      pacePreference: 'deliberate',
      modalities: {
        visual: 0.85,
        reading: 0.8,
        practice: 0.95,
        interactive: 0.75,
        socratic: 0.9,
        directExplanation: 0.8,
        analogies: 0.85,
      },
      overallMastery: 0.84,
      overallRetention: 0.89,
      learningMomentum: 88,
      calibrationScore: 56, // Low calibration score due to underconfidence gap
      currentStreakDays: 11,
      totalStudyMinutes: 390,
      conceptsMasteredCount: 7,
      totalAttemptsCount: 110,
      accuracyRate: 0.91,
      averageResponseTimeSeconds: 16.5,
      personaType: 'systematic',
      isSimulated: true,
      simulatedPreset: 'underconfident',
      createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    conceptStates: {
      'math-alg-vars': { masteryScore: 0.95, retentionScore: 0.94, stabilityDays: 35, masteryTier: 'mastery' },
      'math-alg-lin-eq': { masteryScore: 0.91, retentionScore: 0.90, stabilityDays: 28, masteryTier: 'mastery' },
      'math-alg-quad': { masteryScore: 0.84, retentionScore: 0.86, stabilityDays: 18, masteryTier: 'advanced' },
      'math-calc-limits': { masteryScore: 0.82, retentionScore: 0.80, stabilityDays: 14, masteryTier: 'advanced' },
    }
  }
};
