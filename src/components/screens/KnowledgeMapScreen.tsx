import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { KnowledgeGalaxyCanvas } from '../knowledgeGalaxy/KnowledgeGalaxyCanvas';
import { ConceptDetailDrawer } from '../knowledgeGalaxy/ConceptDetailDrawer';
import { Compass, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';

export const KnowledgeMapScreen: React.FC = () => {
  const { concepts, userConceptStates, selectedConceptId, setSelectedConceptId } = useAdaptive();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectConcept = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    setIsDrawerOpen(true);
  };

  const selectedConcept = concepts.find(c => c.id === selectedConceptId) || null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Epistemic Manifold</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Knowledge Galaxy
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            A real-time map of concepts, prerequisite dependencies, memory decay rings, and Bayesian mastery states. Click any node to open its first-principles theory and AI Socratic tutor.
          </p>
        </div>
      </div>

      {/* Interactive 2D Canvas */}
      <KnowledgeGalaxyCanvas onSelectConcept={handleSelectConcept} />

      {/* Concept Detail Slide-out Drawer */}
      {isDrawerOpen && (
        <ConceptDetailDrawer
          concept={selectedConcept}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};
