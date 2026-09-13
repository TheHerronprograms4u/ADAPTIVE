import { PreliminaryExamQuestion } from '../types/preliminaryExam';

export const PRELIMINARY_EXAM_QUESTIONS: PreliminaryExamQuestion[] = [
  // Probe 1: Visual & Spatial Transformation
  {
    id: 'probe-visual-1',
    probeType: 'visual_spatial',
    probeTitle: 'Visual-Spatial Topology Probe',
    probeDescription: 'Assesses mental rotation, geometric coordinate mapping, and graphical intuition.',
    prompt: 'Consider a 2D coordinate plane with a function $f(x) = (x - 3)^2 + 4$. If you reflect this parabola across the $x$-axis and then shift it $2$ units left, what is the new vertex coordinate?',
    options: [
      { id: 'opt-a', text: '$(1, -4)$', isCorrect: true, diagnosticNote: 'Correct spatial reflection and horizontal translation.' },
      { id: 'opt-b', text: '$(5, -4)$', isCorrect: false, diagnosticNote: 'Inverted horizontal shift direction.' },
      { id: 'opt-c', text: '$(1, 4)$', isCorrect: false, diagnosticNote: 'Forgot to invert the vertical y-coordinate during reflection.' },
      { id: 'opt-d', text: '(-1, -4)', isCorrect: false, diagnosticNote: 'Applied double negative sign shift.' },
    ],
    difficulty: 0.55,
    solutionExplanation: 'The original vertex is at $(3, 4)$. Reflecting across the $x$-axis inverts the $y$-value to $(3, -4)$. Shifting $2$ units left subtracts $2$ from the $x$-coordinate: $(3 - 2, -4) = (1, -4)$.',
    epistemicTakeaway: 'Visual and spatial coordinate manipulation demonstrates whether you internalize geometric structures graphically before symbolic computation.',
  },

  // Probe 2: Deductive & Socratic First-Principles Reasoning
  {
    id: 'probe-socratic-1',
    probeType: 'deductive_socratic',
    probeTitle: 'Deductive & First-Principles Probe',
    probeDescription: 'Assesses step-by-step causal deduction and invariant constraint tracking.',
    prompt: 'A closed container contains an ideal gas at constant temperature $T$. If the volume of the container is compressed to $\\frac{1}{3}$ of its original size while half the gas molecules escape through a valve, what happens to the internal pressure $P$ relative to initial $P_0$?',
    options: [
      { id: 'opt-a', text: '$P = 1.5 \\, P_0$ (Pressure increases by 50%)', isCorrect: true, diagnosticNote: 'Accurately decoupled volume compression and molar loss invariants.' },
      { id: 'opt-b', text: '$P = 0.67 \\, P_0$ (Pressure decreases by 33%)', isCorrect: false, diagnosticNote: 'Failed to account for inverse volume scaling.' },
      { id: 'opt-c', text: '$P = 3.0 \\, P_0$ (Pressure triples)', isCorrect: false, diagnosticNote: 'Neglected molecule loss.' },
      { id: 'opt-d', text: '$P = P_0$ (Pressure remains completely unchanged)', isCorrect: false, diagnosticNote: 'Assumed factors cancelled symmetrically.' },
    ],
    difficulty: 0.60,
    solutionExplanation: 'From the Ideal Gas Law $P = \\frac{nRT}{V}$: $n$ becomes $0.5 n_0$, and $V$ becomes $\\frac{1}{3} V_0$. Thus $P = \\frac{0.5 n_0 R T}{\\frac{1}{3} V_0} = \\frac{0.5}{1/3} P_0 = 1.5 P_0$.',
    epistemicTakeaway: 'Deductive inquiry relies on tracking invariants across multiple simultaneous variable shifts without memorizing static formulas.',
  },

  // Probe 3: Procedural Execution & Problem Practice
  {
    id: 'probe-practice-1',
    probeType: 'procedural_practice',
    probeTitle: 'Procedural Fluency & Calculation Probe',
    probeDescription: 'Assesses computational precision, algebraic mechanics, and operator sequencing.',
    prompt: 'Solve for $x$ in the algebraic constraint:\n\n$$\\frac{3x - 5}{4} - \\frac{x + 1}{2} = 2$$',
    options: [
      { id: 'opt-a', text: '$x = 15$', isCorrect: true, diagnosticNote: 'Clean algebraic execution with common denominator.' },
      { id: 'opt-b', text: '$x = 13$', isCorrect: false, diagnosticNote: 'Sign error when distributing negative to $(x + 1)$.' },
      { id: 'opt-c', text: '$x = 11$', isCorrect: false, diagnosticNote: 'Multiplication slip on the RHS constant.' },
      { id: 'opt-d', text: '$x = 7$', isCorrect: false, diagnosticNote: 'Fraction reduction error.' },
    ],
    difficulty: 0.50,
    solutionExplanation: 'Multiply both sides by common denominator $4$: $(3x - 5) - 2(x + 1) = 8 \\implies 3x - 5 - 2x - 2 = 8 \\implies x - 7 = 8 \\implies x = 15$.',
    epistemicTakeaway: 'Procedural fluency ensures that working memory is free to tackle high-order conceptual abstraction without getting bogged down by execution errors.',
  },

  // Probe 4: Conceptual Transfer & Metaphorical Analogy
  {
    id: 'probe-analogy-1',
    probeType: 'conceptual_analogy',
    probeTitle: 'Conceptual Transfer & Metaphor Probe',
    probeDescription: 'Assesses ability to map abstract relations across domains via vivid intuitive mental models.',
    prompt: 'In physics and biology, an electrical circuit with a **battery, resistor, and capacitor** is structurally analogous to which physiological/mechanical system?',
    options: [
      { id: 'opt-a', text: 'Heart pump (battery), blood vessel constriction (resistor), and elastic arterial walls buffering pressure surges (capacitor)', isCorrect: true, diagnosticNote: 'Identified accurate structural isomorphism across physical domains.' },
      { id: 'opt-b', text: 'Stomach acid (battery), esophagus (resistor), and intestines (capacitor)', isCorrect: false, diagnosticNote: 'Surface association without functional isomorphism.' },
      { id: 'opt-c', text: 'Skeletal bones (resistor) and joint cartilage (battery)', isCorrect: false, diagnosticNote: 'Static mechanical analogy rather than fluid-dynamic.' },
      { id: 'opt-d', text: 'Lungs expanding (resistor) and inhaling oxygen (battery)', isCorrect: false, diagnosticNote: 'Misaligned potential difference and capacitive storage.' },
    ],
    difficulty: 0.50,
    solutionExplanation: 'Voltage = Pressure generator (Heart/Battery); Resistance = Flow impedance (Narrow arterioles/Resistor); Capacitance = Elastic storage reservoir that stores charge/volume and smooths pulsed flow (Arterial compliance/Capacitor).',
    epistemicTakeaway: 'Analogy-driven learning leverages existing mental schemas from familiar domains to accelerate mastery of new abstract theories.',
  },

  // Probe 5: Formal Axiomatic & Textual Reading Rigor
  {
    id: 'probe-reading-1',
    probeType: 'formal_reading',
    probeTitle: 'Formal Axiomatic & Text Comprehension Probe',
    probeDescription: 'Assesses rigorous comprehension of conditional logic, boundary qualifications, and axiomatic definitions.',
    prompt: 'Read this formal mathematical definition carefully:\n\n> *"A relation $R$ on set $S$ is called an Equivalence Relation if and only if it is simultaneously Reflexive ($aRa$), Symmetric ($aRb \\implies bRa$), and Transitive ($aRb \\land bRc \\implies aRc$). If symmetry is replaced by Anti-symmetry ($aRb \\land bRa \\implies a = b$), the relation is classified as a Partial Order."*\n\nUnder this strict definition, what is the relation **"is a descendant of"** on the set of all human beings?',
    options: [
      { id: 'opt-a', text: 'Neither an Equivalence Relation nor a Partial Order (it is not reflexive: no one is their own descendant)', isCorrect: true, diagnosticNote: 'Identified boundary condition constraint violation (reflexivity fails).' },
      { id: 'opt-b', text: 'An Equivalence Relation', isCorrect: false, diagnosticNote: 'Ignored failure of symmetry and reflexivity.' },
      { id: 'opt-c', text: 'A Partial Order', isCorrect: false, diagnosticNote: 'Assumed strict hierarchy satisfies reflexivity.' },
      { id: 'opt-d', text: 'A Symmetrical Reflexive Network', isCorrect: false, diagnosticNote: 'Misinterpreted fundamental definition.' },
    ],
    difficulty: 0.65,
    solutionExplanation: 'Both Equivalence Relations and Partial Orders require the Reflexive property ($aRa$ for all $a$). Since a person cannot be their own biological descendant ($a$ cannot descend from $a$), reflexivity fails, so it is neither.',
    epistemicTakeaway: 'Axiomatic textual reading requires strict vigilance toward edge-case definitions and qualification constraints.',
  },

  // Probe 6: Meta-Cognitive Uncertainty & Hypothesis Calibration
  {
    id: 'probe-calibration-1',
    probeType: 'metacognitive_calibration',
    probeTitle: 'Meta-Cognitive Calibration & Hypothesis Probe',
    probeDescription: 'Assesses subjective calibration vs objective validity under counter-intuitive scenarios.',
    prompt: 'You roll two standard fair 6-sided dice. Given that **at least one** of the dice rolled an odd number, what is the exact conditional probability that the sum of the two dice is an even number?',
    options: [
      { id: 'opt-a', text: '$\\frac{9}{27} = \\frac{1}{3}$', isCorrect: true, diagnosticNote: 'Correctly evaluated reduced sample space: 27 outcomes with >=1 odd, of which 9 (both odd) have an even sum.' },
      { id: 'opt-b', text: '$\\frac{1}{2}$ (50%)', isCorrect: false, diagnosticNote: 'Common naive symmetry trap.' },
      { id: 'opt-c', text: '$\\frac{18}{36} = \\frac{1}{2}$', isCorrect: false, diagnosticNote: 'Ignored the given condition restricting the sample space.' },
      { id: 'opt-d', text: '$\\frac{9}{36} = \\frac{1}{4}$', isCorrect: false, diagnosticNote: 'Did not normalize by the conditional denominator.' },
    ],
    difficulty: 0.70,
    solutionExplanation: 'Total sample space has 36 pairs. Pairs with NO odd numbers (both even) = $3 \\times 3 = 9$. Thus, pairs with AT LEAST ONE odd = $36 - 9 = 27$. For the sum to be even, both dice must be odd: $3 \\times 3 = 9$ pairs. Conditional probability = $\\frac{9}{27} = \\frac{1}{3}$.',
    epistemicTakeaway: 'Calibrated learners acknowledge counter-intuitive probabilistic traps and avoid overconfident snap judgements.',
  },
];
