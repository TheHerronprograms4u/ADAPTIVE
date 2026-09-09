# ADAPTIVE — AI-Native Personalized Learning Platform

<div align="center">

**A premium, highly adaptive educational operating system powered by Bayesian Knowledge Tracing, FSRS Half-Life Spaced Repetition, continuous difficulty calibration, 9-category misconception detection, and multi-modal Socratic AI tutoring.**

[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8b5cf6?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## 🌟 The Core Philosophy

> **"The application should adapt to the learner — not force every learner through the same curriculum."**

Every learner has a continuously evolving **Learning Profile** estimating:
- **What they know & don't know** (via Bayesian Knowledge Tracing)
- **Confidence Calibration** (subjective certainty vs objective correctness via Brier scores)
- **Memory Decay Curves** (Free Spaced Repetition Scheduler / Half-life decay)
- **High-Frequency Misconceptions** (classified across a 9-category educational taxonomy)
- **Dynamic Modality Weights** (Visual, Reading, Practice, Socratic, Analogies)
- **Prerequisite Bottlenecks** (blocking downstream progression until foundations are solid)

---

## 🚀 Key Features

### 1. 🌌 Interactive Knowledge Galaxy
- Physics-based 2D HTML5 Canvas graph of interconnected concepts and prerequisite dependencies.
- Animated particle flow along prerequisite channels.
- Real-time color-coded mastery rings and memory decay status.
- Interactive zoom, pan, tier filtering, and deep-dive drawer.

### 2. 🧠 9-Mode Socratic AI Tutor + Voice Learning
Powered by **Google Gemini 2.5 Flash** with resilient deterministic pedagogical fallback:
- **Socratic Mode**: Guides with scaffolded deductive questions.
- **Explain Mode**: Crystal-clear structured conceptual theory.
- **Simplify (ELI5)**: Intuitive everyday language.
- **Deep Dive**: Rigorous mathematical proofs, formal axioms, and boundary behaviors.
- **Intuitive Analogy**: Vivid physical metaphors and mental models.
- **Worked Examples**: Step-by-step problem derivations.
- **Challenge Mode**: Progressively harder diagnostic problems.
- **Debug Mode**: Dissects reasoning slips step by step.
- **Teach Me Mode**: You explain the concept to the AI; the AI evaluates your epistemic depth on a 1-10 rubric!
- **Voice Learning**: Speech-to-Text voice questions + Natural Text-to-Speech audio playback.

### 3. 🎯 Dynamic 5-Stage Learning Session Runner
Personalized daily sequence that dynamically adapts mid-session:
1. **01 Warm-up** (Fading memory retrieval)
2. **02 Targeted Core Lesson** (Theory / Socratic inquiry)
3. **03 Guided Scaffolding Practice** (Progressive challenges)
4. **04 Interleaved Retrieval Challenge** (Cross-domain active recall)
5. **05 Mastery Verification** (Calibration & completion)

### 4. 🔬 Learning Science & Analytics
- **Bayesian Knowledge Tracing (BKT)**: Continuous estimation of latent mastery $P(L_t)$.
- **FSRS Spaced Repetition**: Memory stability calculation $R(t) = \exp(-t \ln 2 / S)$ with decay alerts (*"96% retention → 21 days"*, *"63% retention → tomorrow"*, *"31% retention → review now"*).
- **Confidence Calibration Scatter**: Comparing self-reported confidence against actual correctness to eliminate overconfidence and underconfidence.
- **Cognitive Velocity & Forgetting Curves**: Visual decay projections.

### 5. 🔍 9-Category Misconception Taxonomy
Classifies mistakes with actionable remedies:
- Calculation Slip
- Conceptual Gap
- Terminology Confusion
- Misapplied Formula
- Prerequisite Bottleneck
- Non-linear Fallacy
- Execution Slip
- Constraint Misread
- Uncalibrated Guess

### 6. 📅 AI Dynamic Study Planner & Exam Simulation
- Generate a dynamic 14-day study timetable for any upcoming examination.
- Schedule dynamically recalculates when days are missed or prerequisites slip.
- Timed **Exam Mode** generating comprehensive **Exam Intelligence Reports** (Readiness %, Weakness alerts, and Targeted Action Plans).

### 7. 📄 Document & PDF Knowledge Extractor
- Paste or upload syllabi, lecture notes, textbook excerpts, or study guides.
- AI automatically extracts core concepts, prerequisite dependency hierarchies, and generates custom diagnostic tests.

### 8. 🧪 Simulated Learner Evaluator Sandbox
- Switch seamlessly between **Fast Learner** (94% Acc), **Struggling Learner** (Prerequisite gaps), **Overconfident Learner** (Misalignment), and **Underconfident Learner** to test adaptive algorithms in real time.

### 9. ⌨️ Global Omnibar (`⌘K` / `Ctrl+K`) & Distraction-Free Focus Mode
- Full keyboard-driven navigation.
- Fullscreen Pomodoro focus workspace with an embedded Socratic mentor.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling & Design System**: Tailwind CSS v4 + Custom Glassmorphic tokens
- **Typography & Math**: Plus Jakarta Sans, Inter, JetBrains Mono, KaTeX for LaTeX rendering
- **Data Visualizations**: Recharts + HTML5 Canvas
- **AI & LLM**: Google Gemini (`@google/genai` API)
- **Audio & Voice**: Web Speech Recognition, SpeechSynthesis, and Web Audio API synthesizer
- **Motion & Polish**: Framer Motion + Canvas Confetti

---

## 🏁 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TheHerronprograms4u/ADAPTIVE.git
cd ADAPTIVE

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env.local and add your Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 License

MIT License. Crafted with precision for the future of learning science.
