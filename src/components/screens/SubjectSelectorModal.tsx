import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  BookOpen,
  Plus,
  Sparkles,
  X,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Compass,
  Cpu,
  Dna,
  Atom,
  TrendingUp,
  Activity,
  PenTool,
  Landmark,
  Coins,
  Scale,
  Languages,
  FlaskConical,
  Globe,
  Sigma,
} from 'lucide-react';

interface SubjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOMAIN_ICONS: Record<string, any> = {
  Sigma,
  Compass,
  Activity,
  TrendingUp,
  Dna,
  FlaskConical,
  Atom,
  Globe,
  BookOpen,
  PenTool,
  Landmark,
  Coins,
  Scale,
  Cpu,
  Languages,
  GraduationCap,
};

export const SubjectSelectorModal: React.FC<SubjectSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    subjects,
    activeSubjectId,
    setActiveSubjectId,
    createCustomSchoolSubject,
    profile,
  } = useAdaptive();

  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');

  // Custom creation state
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customGradeLevel, setCustomGradeLevel] = useState(
    profile.educationLevel === 'middle_school' ? 'Middle School' :
    profile.educationLevel === 'high_school' ? 'High School / AP' :
    profile.educationLevel === 'elementary' ? 'Elementary / Primary' :
    'College / University'
  );
  const [customDescription, setCustomDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const domains = [
    { id: 'all', label: 'All Domains' },
    { id: 'mathematics', label: 'Math' },
    { id: 'science_biology', label: 'Biology' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'physics_engineering', label: 'Physics' },
    { id: 'humanities_english', label: 'English & Lit' },
    { id: 'history_social_studies', label: 'History & Civics' },
    { id: 'economics_business', label: 'Economics' },
    { id: 'computer_science', label: 'Computer Science' },
    { id: 'foreign_languages', label: 'Languages' },
    { id: 'test_prep', label: 'Test Prep' },
  ];

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomainFilter === 'all' || s.domain === selectedDomainFilter;
    return matchesSearch && matchesDomain;
  });

  const handleSelectSubject = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    onClose();
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubjectName.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const created = await createCustomSchoolSubject(
        customSubjectName.trim(),
        customGradeLevel,
        customDescription.trim()
      );
      if (created) {
        setActiveSubjectId(created.id);
        onClose();
      }
    } catch (err) {
      console.warn('Failed to create custom school course:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl rounded-3xl border border-white/15 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">School Curriculum & Course Catalog</h2>
              <p className="text-xs text-zinc-400">
                Switch active school subjects or instantly generate an adaptive knowledge graph for any course.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-white/5 py-3 shrink-0">
          <button
            onClick={() => setActiveTab('browse')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Browse School Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Any Course with AI</span>
          </button>
        </div>

        {/* Tab 1: Browse Catalog */}
        {activeTab === 'browse' && (
          <div className="flex flex-col flex-1 min-h-0 pt-3 space-y-3">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses (e.g. AP Calculus, Chemistry, Literature, SAT Prep)..."
                className="glass-input flex-1 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* Domain Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {domains.map((dom) => (
                <button
                  key={dom.id}
                  onClick={() => setSelectedDomainFilter(dom.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] whitespace-nowrap font-medium transition-all ${
                    selectedDomainFilter === dom.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                  }`}
                >
                  {dom.label}
                </button>
              ))}
            </div>

            {/* Subject Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
              {filteredSubjects.map((subj) => {
                const isActive = subj.id === activeSubjectId;
                const IconComponent = DOMAIN_ICONS[subj.icon] || BookOpen;

                return (
                  <div
                    key={subj.id}
                    onClick={() => handleSelectSubject(subj.id)}
                    className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'border-white/5 bg-zinc-950/50 hover:border-white/15 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
                            style={{ backgroundColor: `${subj.accentColor}25`, color: subj.accentColor }}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-white">{subj.name}</span>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {subj.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{subj.gradeLevel || 'Comprehensive'}</span>
                      <span className="text-indigo-400 font-medium">Select Subject →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Create Custom AI Course */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateCustom} className="pt-3 space-y-4 overflow-y-auto flex-1">
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Universal School Curriculum Synthesizer</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Type any course, syllabus unit, or textbook topic from elementary school to college. Our AI engine will immediately extract prerequisite graphs, core theorems, mental analogies, and adaptive diagnostic questions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Course or Subject Topic Name *
              </label>
              <input
                type="text"
                required
                value={customSubjectName}
                onChange={(e) => setCustomSubjectName(e.target.value)}
                placeholder="e.g., 8th Grade Astronomy, AP European History Reformation, Organic Chemistry Mechanisms..."
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Academic Grade Level
              </label>
              <select
                value={customGradeLevel}
                onChange={(e) => setCustomGradeLevel(e.target.value)}
                className="glass-input w-full rounded-xl px-4 py-2.5 text-xs text-zinc-200 bg-zinc-900"
              >
                <option value="Elementary / Primary (Grades 1-5)">Elementary / Primary (Grades 1-5)</option>
                <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
                <option value="High School (Grades 9-12)">High School (Grades 9-12)</option>
                <option value="AP / Honors / IB">AP / Honors / IB</option>
                <option value="College / University Undergraduate">College / University Undergraduate</option>
                <option value="Graduate / Advanced Research">Graduate / Advanced Research</option>
                <option value="Lifelong / Self-Paced">Lifelong / Self-Paced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Optional Syllabus Topics or Focus Areas
              </label>
              <textarea
                rows={3}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="List specific chapters, exam topics, or homework themes you want to focus on..."
                className="glass-input w-full rounded-xl p-3 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !customSubjectName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 cursor-pointer transition-all"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Knowledge Galaxy & Diagnostic Tests...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Generate Curriculum & Launch Course</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
