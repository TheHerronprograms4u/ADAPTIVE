import { Concept, Subject, UserConceptState } from '../types/subject';
import { LearnerProfile } from '../types/learner';
import { DynamicLearningSession, SessionActivity } from '../types/engine';
import { Question } from '../types/assessment';

export function generatePersonalizedSession(
  subject: Subject,
  concepts: Concept[],
  userStates: Record<string, UserConceptState>,
  profile: LearnerProfile,
  allQuestions: Question[]
): DynamicLearningSession {
  // Find decaying concepts for Warm-up
  const decayingList = concepts
    .filter(c => (userStates[c.id]?.retentionScore || 1.0) < 0.70 && (userStates[c.id]?.totalAttempts || 0) > 0)
    .sort((a, b) => (userStates[a.id]?.retentionScore || 0) - (userStates[b.id]?.retentionScore || 0));

  const warmupConcept = decayingList[0] || concepts[0];

  // Find targeted concept (developing or weak prerequisite)
  const targetConcept = concepts
    .filter(c => (userStates[c.id]?.masteryScore || 0) < 0.85)
    .sort((a, b) => (userStates[a.id]?.masteryScore || 0) - (userStates[b.id]?.masteryScore || 0))[0] || concepts[1] || concepts[0];

  // Find practice concept
  const practiceConcept = targetConcept;

  // Interleaved retrieval concept (different topic / branch)
  const interleavedConcept = concepts.find(c => c.id !== targetConcept.id && c.id !== warmupConcept.id) || concepts[0];

  const activities: SessionActivity[] = [
    {
      id: `act-warmup-${Date.now()}`,
      phase: 'warm_up',
      title: '01 — Warm-up Retrieval',
      durationMinutes: 2,
      conceptId: warmupConcept.id,
      conceptName: warmupConcept.name,
      format: 'active_recall',
      targetDifficulty: 0.45,
      objectiveText: `Refresh memory on ${warmupConcept.name} before it decays further.`,
      isCompleted: false,
      timeSpentSeconds: 0,
      contentPayload: {
        questions: allQuestions.filter(q => q.conceptId === warmupConcept.id).slice(0, 2),
        theorySummary: warmupConcept.summary,
      }
    },
    {
      id: `act-target-${Date.now()}`,
      phase: 'targeted_lesson',
      title: '02 — Targeted Core Concept',
      durationMinutes: 8,
      conceptId: targetConcept.id,
      conceptName: targetConcept.name,
      format: profile.modalities.socratic > 0.6 ? 'socratic_inquiry' : 'read_theory',
      targetDifficulty: targetConcept.difficultyBase,
      objectiveText: `Master the core theory and intuition of ${targetConcept.name}.`,
      isCompleted: false,
      timeSpentSeconds: 0,
      contentPayload: {
        theorySummary: targetConcept.detailedTheory,
        teachPrompt: `Explain the intuition behind ${targetConcept.name} to the AI tutor.`,
      }
    },
    {
      id: `act-practice-${Date.now()}`,
      phase: 'guided_practice',
      title: '03 — Guided Scaffolding Practice',
      durationMinutes: 7,
      conceptId: practiceConcept.id,
      conceptName: practiceConcept.name,
      format: 'guided_practice',
      targetDifficulty: Number((practiceConcept.difficultyBase + 0.1).toFixed(2)),
      objectiveText: `Apply principles to progressively challenging problems with instant misconception diagnostics.`,
      isCompleted: false,
      timeSpentSeconds: 0,
      contentPayload: {
        questions: allQuestions.filter(q => q.conceptId === practiceConcept.id).slice(0, 4),
      }
    },
    {
      id: `act-retrieval-${Date.now()}`,
      phase: 'retrieval_challenge',
      title: '04 — Interleaved Retrieval Challenge',
      durationMinutes: 3,
      conceptId: interleavedConcept.id,
      conceptName: interleavedConcept.name,
      format: 'active_recall',
      targetDifficulty: 0.70,
      objectiveText: `Interleaved practice across related domains: ${interleavedConcept.name}.`,
      isCompleted: false,
      timeSpentSeconds: 0,
      contentPayload: {
        questions: allQuestions.filter(q => q.conceptId === interleavedConcept.id).slice(0, 2),
      }
    },
    {
      id: `act-mastery-${Date.now()}`,
      phase: 'mastery_check',
      title: '05 — Mastery Verification',
      durationMinutes: 2,
      conceptId: targetConcept.id,
      conceptName: targetConcept.name,
      format: 'mastery_verification',
      targetDifficulty: Number((targetConcept.difficultyBase + 0.15).toFixed(2)),
      objectiveText: `Verify concept consolidation and calibrate confidence score.`,
      isCompleted: false,
      timeSpentSeconds: 0,
      contentPayload: {
        questions: allQuestions.filter(q => q.conceptId === targetConcept.id).slice(-2),
      }
    }
  ];

  return {
    id: `session-${Date.now()}`,
    userId: profile.id,
    subjectId: subject.id,
    generatedAt: new Date().toISOString(),
    totalPlannedMinutes: activities.reduce((acc, a) => acc + a.durationMinutes, 0),
    currentPhaseIndex: 0,
    activities,
    isFinished: false,
    accuracyOverall: 0,
    adaptationsTriggered: [
      `Session dynamically synthesized based on current ${Math.round(profile.overallRetention * 100)}% retention and ${Math.round(profile.overallMastery * 100)}% mastery.`
    ],
  };
}
