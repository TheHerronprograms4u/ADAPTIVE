import { Concept, Subject, UserConceptState } from '../types/subject';
import { LearnerProfile } from '../types/learner';
import { AdaptiveRecommendation, InstructionalFormat } from '../types/engine';

export function computeNextBestLearningAction(
  subject: Subject,
  concepts: Concept[],
  userStates: Record<string, UserConceptState>,
  profile: LearnerProfile
): AdaptiveRecommendation {
  let highestPriority = -1;
  let chosenRecommendation: AdaptiveRecommendation | null = null;

  for (const concept of concepts) {
    const state = userStates[concept.id] || {
      userId: profile.id,
      conceptId: concept.id,
      masteryScore: 0.1,
      confidenceScore: 0.3,
      retentionScore: 0.8,
      masteryTier: 'novice',
      stabilityDays: 1.5,
      difficultyRating: concept.difficultyBase,
      repsCount: 0,
      lapsesCount: 0,
      lastReviewedAt: '',
      nextReviewAt: '',
      forgettingProbability: 0.2,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracyRate: 0,
      averageResponseTimeSeconds: 0,
      last5Accuracy: [],
      misconceptionHistory: [],
      isPrerequisiteBottleneck: false,
      recommendedNextAction: 'learn',
    };

    // Check prerequisites
    const prereqStates = concept.prerequisiteIds.map(pid => userStates[pid]).filter(Boolean);
    const weakPrereqs = prereqStates.filter(ps => ps.masteryScore < 0.60);
    const hasUnmasteredPrereqs = weakPrereqs.length > 0;

    let priority = 0;
    let actionType: AdaptiveRecommendation['actionType'] = 'learn_new';
    let format: InstructionalFormat = 'guided_practice';
    let reason = '';

    // Condition 1: High Spaced Repetition Decay (Memory is fading)
    if (state.totalAttempts > 0 && state.retentionScore < 0.50) {
      priority = 90 + (1 - state.retentionScore) * 10;
      actionType = 'spaced_review';
      format = 'active_recall';
      reason = `Your retention for "${concept.name}" has decayed to ${Math.round(state.retentionScore * 100)}%. A 3-minute active retrieval session will lock this into long-term memory.`;
    }
    // Condition 2: Prerequisite Bottleneck Detected
    else if (hasUnmasteredPrereqs && state.totalAttempts > 0 && state.masteryScore < 0.50) {
      const weakName = concepts.find(c => c.id === weakPrereqs[0].conceptId)?.name || 'prerequisite';
      priority = 85;
      actionType = 'reinforce_prereq';
      format = 'socratic_inquiry';
      reason = `You're encountering friction in "${concept.name}" because foundational "${weakName}" needs reinforcement. Let's strengthen that prerequisite first.`;
    }
    // Condition 3: Active Developing Concept (needs practice & consolidation)
    else if (state.masteryScore >= 0.30 && state.masteryScore < 0.80) {
      priority = 75 + (1 - state.masteryScore) * 10;
      actionType = 'deep_practice';
      
      // Adapt format to learner modalities
      if (profile.modalities.socratic > 0.7) {
        format = 'socratic_inquiry';
      } else if (profile.modalities.interactive > 0.7) {
        format = 'interactive_simulation';
      } else {
        format = 'guided_practice';
      }

      reason = `You are currently at ${Math.round(state.masteryScore * 100)}% mastery on "${concept.name}". Solving scaffolded problems will push you to advanced mastery.`;
    }
    // Condition 4: High Mastery reached -> Teach AI or Challenge mode
    else if (state.masteryScore >= 0.80 && state.masteryScore < 0.95) {
      priority = 60;
      actionType = 'teach_ai_challenge';
      format = 'teach_ai';
      reason = `You've achieved solid proficiency in "${concept.name}" (${Math.round(state.masteryScore * 100)}%). Teaching this concept to the AI tutor will achieve 100% deep mastery.`;
    }
    // Condition 5: Brand new unlocked concept with ready prerequisites
    else if (state.totalAttempts === 0 && !hasUnmasteredPrereqs) {
      priority = 50 - concept.difficultyBase * 10;
      actionType = 'learn_new';
      format = profile.modalities.reading > 0.6 ? 'read_theory' : 'guided_practice';
      reason = `Prerequisites are satisfied. Ready to unlock "${concept.name}" in your Knowledge Galaxy.`;
    }

    if (priority > highestPriority) {
      highestPriority = priority;
      chosenRecommendation = {
        conceptId: concept.id,
        conceptName: concept.name,
        topicName: subject.name,
        actionType,
        priorityScore: priority,
        recommendedFormat: format,
        targetDifficulty: Math.max(0.2, Math.min(0.95, concept.difficultyBase)),
        estimatedMinutes: format === 'active_recall' ? 3 : format === 'teach_ai' ? 5 : 8,
        explainableReason: reason,
        prerequisiteGaps: weakPrereqs.map(p => p.conceptId),
      };
    }
  }

  // Fallback if all mastered
  if (!chosenRecommendation && concepts.length > 0) {
    const first = concepts[0];
    chosenRecommendation = {
      conceptId: first.id,
      conceptName: first.name,
      topicName: subject.name,
      actionType: 'spaced_review',
      priorityScore: 50,
      recommendedFormat: 'challenge_problem',
      targetDifficulty: 0.85,
      estimatedMinutes: 5,
      explainableReason: `Comprehensive review of ${first.name} to preserve peak cognitive retrievability.`,
      prerequisiteGaps: [],
    };
  }

  // Guard: subjects with no concepts (fresh custom course, catalog subject without content)
  // must yield a safe placeholder instead of null, which crashed the dashboard.
  if (!chosenRecommendation) {
    chosenRecommendation = {
      conceptId: '',
      conceptName: 'Your Learning Track',
      topicName: subject.name,
      actionType: 'learn_new',
      priorityScore: 0,
      recommendedFormat: 'guided_practice',
      targetDifficulty: 0.5,
      estimatedMinutes: 0,
      explainableReason: `No concepts are loaded for ${subject.name} yet. Open the Course Selector to generate an AI curriculum, or switch to a subject with content.`,
      prerequisiteGaps: [],
    };
  }

  return chosenRecommendation;
}
