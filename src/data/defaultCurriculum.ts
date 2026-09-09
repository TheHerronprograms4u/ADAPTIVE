import { Concept } from '../types/subject';
import { Question } from '../types/assessment';

export const DEFAULT_CONCEPTS: Concept[] = [
  // --- MATHEMATICS: ALGEBRA ---
  {
    id: 'math-alg-vars',
    subjectId: 'subj-math',
    topicId: 'top-algebra',
    name: 'Variables & Expressions',
    shortCode: 'ALG.1',
    summary: 'Symbolic representation of unknown quantities and algebraic operations.',
    detailedTheory: 'An algebraic expression is a combination of variables, constants, and operators representing mathematical relationships. The fundamental principle is that variables act as place-holders for members of a specified domain set.',
    keyFormulas: ['ax + b', 'a(b + c) = ab + ac'],
    intuitionAnalogy: 'Think of a variable as a labeled storage box whose contents can be varied without changing the physical container.',
    difficultyBase: 0.25,
    prerequisiteIds: [],
    visualGalaxyCoords: { x: 120, y: 180, cluster: 'algebra' },
    misconceptions: [
      {
        id: 'misc-var-concat',
        category: 'conceptual_misunderstanding',
        name: 'Concatenation Fallacy',
        description: 'Interpreting $2x$ as "twenty-x" or string concatenation rather than multiplication $2 \\cdot x$.',
        frequency: 0.3,
        detectedCount: 0,
        remediationAdvice: 'Remember juxtaposition implies multiplication: $2(5) = 10$, not $25$.'
      }
    ]
  },
  {
    id: 'math-alg-lin-eq',
    subjectId: 'subj-math',
    topicId: 'top-algebra',
    name: 'Linear Equations & Systems',
    shortCode: 'ALG.2',
    summary: 'Solving first-degree equations and simultaneous linear constraints.',
    detailedTheory: 'A linear equation represents a straight hyperplane. Solving a linear system corresponds to finding the intersection of affine subspaces.',
    keyFormulas: ['y = mx + b', 'a_1 x + b_1 y = c_1'],
    intuitionAnalogy: 'Two lines on a map; the solution is the exact single intersection point where both travelers meet.',
    difficultyBase: 0.45,
    prerequisiteIds: ['math-alg-vars'],
    visualGalaxyCoords: { x: 220, y: 220, cluster: 'algebra' },
    misconceptions: [
      {
        id: 'misc-lin-sign',
        category: 'calculation_error',
        name: 'Negative Distribution Slip',
        description: 'Failing to distribute negative signs across linear parenthetical terms, e.g. $-(2x - 3) = -2x - 3$.',
        frequency: 0.45,
        detectedCount: 0,
        remediationAdvice: 'Distribute the negative multiplier to every term inside the parentheses: $-(2x - 3) = -2x + 3$.'
      }
    ]
  },
  {
    id: 'math-alg-quad',
    subjectId: 'subj-math',
    topicId: 'top-algebra',
    name: 'Quadratic Functions & Factoring',
    shortCode: 'ALG.3',
    summary: 'Second-degree polynomials, parabolas, vertex forms, and roots.',
    detailedTheory: 'Quadratic equations take the standard form $ax^2 + bx + c = 0$. Roots are determined via factoring, completing the square, or the quadratic formula.',
    keyFormulas: ['x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', 'f(x) = a(x - h)^2 + k'],
    intuitionAnalogy: 'The trajectory of an object launched into gravity: it rises smoothly, peaks at the vertex, and descends symmetrically.',
    difficultyBase: 0.65,
    prerequisiteIds: ['math-alg-lin-eq'],
    visualGalaxyCoords: { x: 330, y: 260, cluster: 'algebra' },
    misconceptions: [
      {
        id: 'misc-quad-sq-root',
        category: 'conceptual_misunderstanding',
        name: 'Missing Negative Root Fallacy',
        description: 'Assuming $x^2 = 25 \\implies x = 5$ only, neglecting the negative branch $x = -5$.',
        frequency: 0.5,
        detectedCount: 0,
        remediationAdvice: 'Whenever taking the square root across an equation, always include both $\\pm \\sqrt{k}$.'
      }
    ]
  },
  
  // --- MATHEMATICS: CALCULUS ---
  {
    id: 'math-calc-limits',
    subjectId: 'subj-math',
    topicId: 'top-calculus',
    name: 'Limits & Continuity',
    shortCode: 'CALC.1',
    summary: 'Epsilon-delta formalism, asymptotic behavior, and continuous functions.',
    detailedTheory: 'The limit of $f(x)$ as $x \\to c$ describes the value $f(x)$ approaches arbitrarily closely, regardless of whether $f(c)$ is defined.',
    keyFormulas: ['\\lim_{x \\to c} f(x) = L', '\\forall \\varepsilon > 0, \\exists \\delta > 0 : 0 < |x - c| < \\delta \\implies |f(x) - L| < \\varepsilon'],
    intuitionAnalogy: 'Zooming infinitely into a landscape feature to see where the path is heading, even if a bridge is washed out at the exact point.',
    difficultyBase: 0.70,
    prerequisiteIds: ['math-alg-lin-eq', 'math-alg-quad'],
    visualGalaxyCoords: { x: 440, y: 160, cluster: 'calculus' },
    misconceptions: [
      {
        id: 'misc-lim-eval',
        category: 'vocabulary_confusion',
        name: 'Limit vs Evaluation Confusion',
        description: 'Assuming $\\lim_{x \\to c} f(x)$ must equal $f(c)$ for non-continuous or piecewise functions.',
        frequency: 0.4,
        detectedCount: 0,
        remediationAdvice: 'The limit describes the destination of the approach path, not the static value at the target coordinate.'
      }
    ]
  },
  {
    id: 'math-calc-deriv',
    subjectId: 'subj-math',
    topicId: 'top-calculus',
    name: 'Derivatives & Rates of Change',
    shortCode: 'CALC.2',
    summary: 'Instantaneous rate of change, tangent slopes, and differential rules.',
    detailedTheory: 'The derivative $f\'(x)$ represents the instantaneous rate of change of $f$ with respect to $x$, defined as the limit of difference quotients.',
    keyFormulas: ["f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}", "\\frac{d}{dx}[x^n] = n x^{n-1}"],
    intuitionAnalogy: 'Your speedometer reading at an exact split second, compared to the average speed over a 50-mile road trip.',
    difficultyBase: 0.80,
    prerequisiteIds: ['math-calc-limits'],
    visualGalaxyCoords: { x: 560, y: 200, cluster: 'calculus' },
    misconceptions: [
      {
        id: 'misc-deriv-chain',
        category: 'misapplied_formula',
        name: 'Chain Rule Omission',
        description: 'Differentiating composite functions $f(g(x))$ as $f\'(g(x))$ while forgetting to multiply by the inner derivative $g\'(x)$.',
        frequency: 0.55,
        detectedCount: 0,
        remediationAdvice: 'Always peel the outer layer and multiply by the rate of change of the inner layer: $(f \\circ g)\' = (f\' \\circ g) \\cdot g\'.'
      }
    ]
  },
  {
    id: 'math-calc-integrals',
    subjectId: 'subj-math',
    topicId: 'top-calculus',
    name: 'Definite & Indefinite Integrals',
    shortCode: 'CALC.3',
    summary: 'Riemann sums, accumulation functions, and the Fundamental Theorem of Calculus.',
    detailedTheory: 'Integration calculates the continuous accumulation of quantities over a domain, unifying area calculations with antiderivatives.',
    keyFormulas: ['\\int_a^b f(x) dx = F(b) - F(a)', '\\int x^n dx = \\frac{x^{n+1}}{n+1} + C'],
    intuitionAnalogy: 'Filling a water tank where the water inflow rate varies over time; the integral is the total volume accumulated.',
    difficultyBase: 0.88,
    prerequisiteIds: ['math-calc-deriv'],
    visualGalaxyCoords: { x: 670, y: 240, cluster: 'calculus' },
    misconceptions: [
      {
        id: 'misc-int-const',
        category: 'careless_error',
        name: 'Integration Constant Omission',
        description: 'Neglecting $+ C$ in indefinite integrals, causing invalid boundary value solving.',
        frequency: 0.35,
        detectedCount: 0,
        remediationAdvice: 'Indefinite integrals yield a whole family of functions differing by a vertical shift constant $+ C$.'
      }
    ]
  },

  // --- COMPUTER SCIENCE & AI ---
  {
    id: 'cs-dsa-complexity',
    subjectId: 'subj-cs-ai',
    topicId: 'top-dsa',
    name: 'Asymptotic Complexity (Big-O)',
    shortCode: 'CS.1',
    summary: 'Time and space complexity bounds, upper/lower bounds, and scalability.',
    detailedTheory: 'Asymptotic notation describes the limiting behavior of an algorithm execution time or memory footprint as input size $N \\to \\infty$.',
    keyFormulas: ['T(n) = O(f(n))', 'T(n) = \\Omega(g(n))', 'T(n) = \\Theta(h(n))'],
    intuitionAnalogy: 'How much heavier your backpack feels as you add 1, 10, or 10,000 items.',
    difficultyBase: 0.50,
    prerequisiteIds: [],
    visualGalaxyCoords: { x: 150, y: 420, cluster: 'cs' },
    misconceptions: [
      {
        id: 'misc-bigo-worst',
        category: 'conceptual_misunderstanding',
        name: 'Big-O vs Worst-Case Confusion',
        description: 'Equating Big-O strictly with worst-case scenario rather than an asymptotic upper bound on any metric.',
        frequency: 0.45,
        detectedCount: 0,
        remediationAdvice: 'Big-O is a mathematical upper bound; you can measure the Big-O of best-case, average-case, or worst-case performance.'
      }
    ]
  },
  {
    id: 'cs-ai-grad-desc',
    subjectId: 'subj-cs-ai',
    topicId: 'top-neural-nets',
    name: 'Gradient Descent & Backpropagation',
    shortCode: 'AI.1',
    summary: 'Loss optimization surfaces, Jacobian/Hessian gradients, and computational graph backprop.',
    detailedTheory: 'Gradient descent iteratively updates parameters in the direction of steepest loss descent: $\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta L$. Backpropagation applies the multi-variable chain rule over tensor graphs.',
    keyFormulas: ['\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta L(\\theta)', '\\frac{\\partial L}{\\partial w_{ij}} = \\frac{\\partial L}{\\partial z_j} \\cdot \\frac{\\partial z_j}{\\partial w_{ij}}'],
    intuitionAnalogy: 'Walking down a foggy mountain slope by feeling which direction slopes down steepest under your boots.',
    difficultyBase: 0.82,
    prerequisiteIds: ['math-calc-deriv', 'cs-dsa-complexity'],
    visualGalaxyCoords: { x: 480, y: 440, cluster: 'cs' },
    misconceptions: [
      {
        id: 'misc-ai-lr',
        category: 'conceptual_misunderstanding',
        name: 'Learning Rate Overshoot Fallacy',
        description: 'Assuming increasing the learning rate always converges faster, ignoring oscillations and divergence.',
        frequency: 0.4,
        detectedCount: 0,
        remediationAdvice: 'An excessively large learning rate causes step sizes to overshoot the minimum, leading to exploding loss.'
      }
    ]
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // Question 1: MCQ on Linear Equations
  {
    id: 'q-lin-1',
    conceptId: 'math-alg-lin-eq',
    conceptName: 'Linear Equations & Systems',
    difficulty: 0.42,
    discrimination: 1.2,
    type: 'multiple_choice',
    prompt: 'Solve for $x$ in the equation: $3(x - 4) = -2(x + 1)$',
    options: [
      { id: 'opt-1', text: '$x = 2$', isCorrect: true },
      { id: 'opt-2', text: '$x = 10$', isCorrect: false, misconceptionCategory: 'calculation_error', misconceptionExplanation: 'You forgot to distribute the negative sign to $+1$ on the right side.' },
      { id: 'opt-3', text: '$x = -2$', isCorrect: false, misconceptionCategory: 'calculation_error', misconceptionExplanation: 'Sign error when moving variables to the left-hand side.' },
      { id: 'opt-4', text: '$x = 14$', isCorrect: false, misconceptionCategory: 'conceptual_misunderstanding', misconceptionExplanation: 'Added terms incorrectly across the equals sign.' }
    ],
    detailedSolution: 'Expanding both sides:\n$3x - 12 = -2x - 2$\nAdd $2x$ to both sides:\n$5x - 12 = -2$\nAdd $12$ to both sides:\n$5x = 10 \\implies x = 2$.',
    intuitionTakeaway: 'Always distribute multipliers before collecting variable terms.',
    prerequisiteRefId: 'math-alg-vars'
  },

  // Question 2: Numerical input on Derivatives
  {
    id: 'q-calc-deriv-num',
    conceptId: 'math-calc-deriv',
    conceptName: 'Derivatives & Rates of Change',
    difficulty: 0.78,
    discrimination: 1.4,
    type: 'numerical',
    prompt: 'Evaluate the derivative of $f(x) = 3x^3 - 5x^2 + 4x - 7$ at $x = 2$.',
    numericalAnswer: {
      value: 20,
      tolerance: 0.01,
      unit: ''
    },
    detailedSolution: "First differentiate $f(x)$ using the power rule:\n$f'(x) = 9x^2 - 10x + 4$.\nNow substitute $x = 2$:\n$f'(2) = 9(4) - 10(2) + 4 = 36 - 20 + 4 = 20$.",
    intuitionTakeaway: 'The power rule brings down the exponent and reduces power by 1 before evaluating at the point.'
  },

  // Question 3: Matching Pairs on Big-O Complexities
  {
    id: 'q-cs-bigo-match',
    conceptId: 'cs-dsa-complexity',
    conceptName: 'Asymptotic Complexity (Big-O)',
    difficulty: 0.62,
    discrimination: 1.3,
    type: 'matching',
    prompt: 'Match each standard algorithm to its typical average-case time complexity:',
    matchingPairs: [
      { leftId: 'alg-bin-search', leftText: 'Binary Search', rightId: 'comp-log', rightText: '$O(\\log n)$' },
      { leftId: 'alg-quick-sort', leftText: 'QuickSort (Average)', rightId: 'comp-nlogn', rightText: '$O(n \\log n)$' },
      { leftId: 'alg-hash-lookup', leftText: 'Hash Table Lookup', rightId: 'comp-one', rightText: '$O(1)$' },
      { leftId: 'alg-matrix-mult', leftText: 'Naive Matrix Mult', rightId: 'comp-cube', rightText: '$O(n^3)$' }
    ],
    detailedSolution: 'Binary search halves the search space each step: $O(\\log n)$. Quicksort splits and sorts in $O(n \\log n)$. Hash tables offer constant amortized lookup $O(1)$.',
    intuitionTakeaway: 'Logarithmic algorithms cut search spaces in half; divide-and-conquer creates $n \\log n$ trees.'
  },

  // Question 4: Ordering on Optimization pipeline
  {
    id: 'q-ai-grad-order',
    conceptId: 'cs-ai-grad-desc',
    conceptName: 'Gradient Descent & Backpropagation',
    difficulty: 0.84,
    discrimination: 1.5,
    type: 'ordering',
    prompt: 'Arrange the steps of a single mini-batch neural network training iteration in correct sequence:',
    orderingItems: [
      { id: 'step-forward', text: '1. Forward pass: compute activations and predictions $\\hat{y}$', correctIndex: 0 },
      { id: 'step-loss', text: '2. Evaluate loss function $L(\\hat{y}, y)$', correctIndex: 1 },
      { id: 'step-backward', text: '3. Backward pass: compute gradients $\\nabla_\\theta L$ via chain rule', correctIndex: 2 },
      { id: 'step-update', text: '4. Optimizer update: adjust weights $\\theta \\leftarrow \\theta - \\eta \\nabla_\\theta L$', correctIndex: 3 }
    ],
    detailedSolution: 'Feedforward generates predictions -> loss computes error -> backprop flows derivatives backward -> optimizer updates weights.',
    intuitionTakeaway: 'Information flows forward to predict; gradients flow backward to teach.'
  },

  // Question 5: Code Challenge
  {
    id: 'q-cs-code-1',
    conceptId: 'cs-dsa-complexity',
    conceptName: 'Asymptotic Complexity (Big-O)',
    difficulty: 0.68,
    discrimination: 1.3,
    type: 'code_challenge',
    prompt: 'Analyze this Python loop and determine its exact time complexity asymptotically:',
    codeSnippet: {
      language: 'python',
      code: `def process_matrix(n):
    total = 0
    for i in range(n):
        j = 1
        while j < n:
            total += (i * j)
            j = j * 2
    return total`
    },
    options: [
      { id: 'opt-c1', text: '$O(n \\log n)$', isCorrect: true },
      { id: 'opt-c2', text: '$O(n^2)$', isCorrect: false, misconceptionCategory: 'pattern_recognition_failure', misconceptionExplanation: 'The inner loop doubles $j$ each iteration, which runs in logarithmic $\\log n$ steps, not linear $n$.' },
      { id: 'opt-c3', text: '$O(n)$', isCorrect: false, misconceptionCategory: 'conceptual_misunderstanding', misconceptionExplanation: 'Ignored the inner loop multiplying execution steps.' },
      { id: 'opt-c4', text: '$O(\\log n)$', isCorrect: false, misconceptionCategory: 'conceptual_misunderstanding', misconceptionExplanation: 'Ignored the outer $n$ iterations.' }
    ],
    detailedSolution: 'The outer loop runs $n$ times. The inner while loop multiplies $j$ by 2 each step, terminating when $j \\ge n$, which takes $\\log_2 n$ steps. Total complexity is $O(n \\log n)$.',
    intuitionTakeaway: 'Multiplicative stepping within a loop produces logarithmic growth.'
  },

  // Question 6: Free Recall / Socratic Explanation Question
  {
    id: 'q-calc-free-recall',
    conceptId: 'math-calc-limits',
    conceptName: 'Limits & Continuity',
    difficulty: 0.72,
    discrimination: 1.2,
    type: 'explanation_recall',
    prompt: 'In your own words, explain the difference between a function being defined at $x = c$ and its limit $\\lim_{x \\to c} f(x)$ existing.',
    sampleModelAnswer: 'A function being defined at c means f(c) exists as a valid real number. A limit existing means that as x approaches c from both left and right directions, the values of f(x) converge to the same finite value L, regardless of whether f(c) exists or equals L.',
    acceptedKeywords: ['approach', 'left', 'right', 'converge', 'value', 'continuous', 'defined', 'hole', 'point'],
    rubricCriteria: [
      'Distinguishes static point evaluation from dynamic trajectory approach.',
      'Mentions left-hand and right-hand limit agreement.',
      'Recognizes that limits exist even with removable discontinuities (holes).'
    ],
    detailedSolution: 'Limits describe the destination of an approach, whereas evaluation checks the actual coordinate.',
    intuitionTakeaway: 'The journey (limit) does not require the bridge at the destination (evaluation) to be intact.'
  }
];
