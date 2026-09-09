import { Subject } from '../types/subject';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj-math',
    name: 'Mathematics & Analysis',
    domain: 'mathematics',
    description: 'Foundational algebra, analytical geometry, differential & integral calculus, and linear systems.',
    icon: 'Sigma',
    accentColor: '#6366f1',
    topicIds: ['top-algebra', 'top-geometry', 'top-calculus'],
    totalConcepts: 12,
  },
  {
    id: 'subj-cs-ai',
    name: 'Computer Science & AI',
    domain: 'computer_science',
    description: 'Algorithms, data structures, complexity theory, optimization, and deep neural architectures.',
    icon: 'Cpu',
    accentColor: '#06b6d4',
    topicIds: ['top-dsa', 'top-neural-nets'],
    totalConcepts: 8,
  },
  {
    id: 'subj-neuro-bio',
    name: 'Biology & Neuroscience',
    domain: 'science_biology',
    description: 'Cellular biochemistry, Mendelian & molecular genetics, synaptic plasticity, and neural coding.',
    icon: 'Dna',
    accentColor: '#10b981',
    topicIds: ['top-genetics', 'top-neuroscience'],
    totalConcepts: 8,
  },
  {
    id: 'subj-physics',
    name: 'Physics & Quantum Foundations',
    domain: 'physics_engineering',
    description: 'Classical mechanics, thermodynamics, wave optics, and quantum state vectors.',
    icon: 'Atom',
    accentColor: '#f59e0b',
    topicIds: ['top-mechanics', 'top-quantum'],
    totalConcepts: 8,
  },
];
