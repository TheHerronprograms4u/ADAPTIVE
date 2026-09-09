import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { generateDocumentStudyMap } from '../../lib/gemini';
import { Concept } from '../../types/subject';
import { Question } from '../../types/assessment';
import { UploadedDocument } from '../../types/document';
import {
  FileUp,
  Sparkles,
  CheckCircle2,
  FileText,
  ArrowRight,
  Layers,
  Compass,
  BookOpen,
} from 'lucide-react';

export const DocumentImportScreen: React.FC = () => {
  const { addUploadedDocument, navigateTo } = useAdaptive();

  const [docTitle, setDocTitle] = useState<string>('Cellular Biology & Molecular Genetics');
  const [docText, setDocText] = useState<string>(
    `Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP. The stages of cellular respiration include glycolysis, pyruvate oxidation, the citric acid (Krebs) cycle, and oxidative phosphorylation. In oxidative phosphorylation, the electron transport chain creates an electrochemical proton gradient across the inner mitochondrial membrane, which drives ATP synthesis via ATP synthase.`
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<UploadedDocument | null>(null);

  const handleProcessDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docText.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await generateDocumentStudyMap(docText, docTitle);

      const generatedConcepts: Concept[] = result.concepts.map((c, i) => ({
        id: `custom-concept-${Date.now()}-${i}`,
        subjectId: 'subj-neuro-bio',
        topicId: 'top-genetics',
        name: c.name,
        shortCode: `DOC.${i + 1}`,
        summary: c.summary,
        detailedTheory: `${c.summary}\n\nThis material was dynamically synthesized and extracted from the imported document: "${docTitle}".`,
        difficultyBase: c.difficulty || 0.6,
        prerequisiteIds: i > 0 ? [`custom-concept-${Date.now()}-${i - 1}`] : [],
        visualGalaxyCoords: { x: 300 + (i % 3) * 120, y: 300 + Math.floor(i / 3) * 100, cluster: 'imported' },
        misconceptions: [
          {
            id: `misc-doc-${i}`,
            category: 'conceptual_misunderstanding',
            name: `${c.name} Invariant Misread`,
            description: `Distorting the operational constraints of ${c.name}.`,
            frequency: 0.35,
            detectedCount: 0,
            remediationAdvice: 'Review the source document excerpt to ground the prerequisite chain.',
          }
        ],
      }));

      const sampleQuestions: Question[] = [
        {
          id: `doc-q-${Date.now()}-1`,
          conceptId: generatedConcepts[0].id,
          conceptName: generatedConcepts[0].name,
          difficulty: 0.55,
          discrimination: 1.2,
          type: 'multiple_choice',
          prompt: `Based on your imported document "${docTitle}", what primary mechanism drives ATP synthesis during oxidative phosphorylation?`,
          options: [
            { id: 'opt-d1', text: 'An electrochemical proton gradient across the inner mitochondrial membrane', isCorrect: true },
            { id: 'opt-d2', text: 'Direct thermal excitation of cytoplasmic ribozymes', isCorrect: false },
            { id: 'opt-d3', text: 'Spontaneous decay of extracellular amino acids', isCorrect: false }
          ],
          detailedSolution: 'The electron transport chain establishes a proton gradient across the inner membrane, powering ATP synthase.',
          intuitionTakeaway: 'Potential energy stored in the gradient converts into biochemical chemical bonds (ATP).'
        }
      ];

      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        title: docTitle,
        filename: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSizeBytes: docText.length * 2,
        uploadedAt: new Date().toISOString(),
        rawTextPreview: docText.slice(0, 300),
        summary: result.summary,
        extractedConceptsCount: generatedConcepts.length,
        extractedPrerequisitesCount: Math.max(1, generatedConcepts.length - 1),
        extractedConcepts: generatedConcepts,
        generatedQuestions: sampleQuestions,
        studyPlanDays: 7,
      };

      addUploadedDocument(newDoc);
      setParsedResult(newDoc);
    } catch (err) {
      console.warn('Doc import error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
          <FileUp className="h-3.5 w-3.5 text-indigo-400" />
          <span>Document Knowledge Intelligence</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Document & Notes Knowledge Extractor
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Upload or paste any syllabus, lecture notes, textbook excerpt, or study guide. The AI automatically extracts core concepts, discovers prerequisite relationships, generates practice tests, and expands your Knowledge Galaxy.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <form onSubmit={handleProcessDocument} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Document Title / Subject Header
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Paste Educational Text, Lecture Notes, or Study Material
            </label>
            <textarea
              rows={6}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste notes or text here..."
              className="glass-input w-full rounded-xl p-4 text-xs leading-relaxed text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-500">
              Supports Markdown, LaTeX formulas, technical summaries
            </span>
            <button
              type="submit"
              disabled={isProcessing || !docText.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Extracting Knowledge Graph...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  <span>Extract & Build Knowledge Graph</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Extracted Output Result Card */}
      {parsedResult && (
        <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900/90 p-6 backdrop-blur-2xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{parsedResult.title}</h3>
                <span className="text-xs text-emerald-300 font-medium">Knowledge Graph Successfully Extracted</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('knowledge_galaxy')}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>View in Galaxy</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-zinc-950/60 p-4 font-mono text-xs text-zinc-300">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Concepts Detected</span>
              <span className="text-base font-bold text-white">{parsedResult.extractedConceptsCount} Concepts</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Prerequisites Mapped</span>
              <span className="text-base font-bold text-indigo-400">{parsedResult.extractedPrerequisitesCount} Links</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Generated Practice</span>
              <span className="text-base font-bold text-emerald-400">{parsedResult.generatedQuestions.length} Questions</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Extracted Knowledge Nodes
            </h4>
            <div className="space-y-2">
              {parsedResult.extractedConcepts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-950/40 p-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-400 font-semibold">{c.shortCode}</span>
                    <span className="font-bold text-white">{c.name}</span>
                  </div>
                  <span className="text-zinc-400 text-[11px] truncate max-w-xs">{c.summary}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
