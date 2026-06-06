# Progression System

## Overview

The progression system is built around Worlds, Stages, and Nodes. Each world contains multiple stages, and each stage contains an ordered mix of node types. Players must complete all nodes in a stage before unlocking the next.

## Node Types

| Type | Badge | Purpose |
|---|---|---|
| `lesson` | 🎓 learn | Core teaching content — text steps + quiz |
| `challenge` | ⚡ try | Quiz-only sprint — no text, pure recall |
| `puzzle` | 🧩 solve | Scenario-based problem with 2 quizzes |
| `miniboss` | 🥈 checkpoint | Mid-world boss battle (3 challenges) |
| `boss` | 👑 battle | World-ending boss battle (5 challenges) |

## Data Structure

- `data/worlds.json` — world metadata and unlock requirements
- `data/stages.json` — ordered stage definitions with node manifests
- `data/lessons.json` — lesson nodes (text + quiz steps)
- `data/challenges.json` — challenge nodes (quiz-only steps)
- `data/puzzles.json` — puzzle nodes (scenario + quizzes)
- `data/minibosses.json` — miniboss battles (3 challenges)
- `data/bosses.json` — boss battles (5 challenges)

---

## World 1: AI Foundations
Accent: #7E8C54 (moss green)

### Stage 1: The Birth of AI
- w1-s1-l1 `lesson` — What is Artificial Intelligence?
- w1-s1-l2 `lesson` — Narrow AI vs General AI
- w1-s1-l3 `lesson` — AI Myths and Misconceptions
- w1-s1-c1 `challenge` — AI Basics Challenge

### Stage 2: Understanding LLMs
- w1-s2-l1 `lesson` — What is a Large Language Model?
- w1-s2-l2 `lesson` — Tokens Explained
- w1-s2-l3 `lesson` — Training vs Inference
- w1-s2-p1 `puzzle` — Token Counter Puzzle

### Stage 3: ChatGPT Fundamentals
- w1-s3-l1 `lesson` — How ChatGPT Works
- w1-s3-l2 `lesson` — Context Windows
- w1-s3-l3 `lesson` — System vs User Messages
- w1-s3-c1 `challenge` — ChatGPT Concepts Challenge

### Stage 4: AI Limitations
- w1-s4-l1 `lesson` — What AI Can Do
- w1-s4-l2 `lesson` — What AI Cannot Do
- w1-s4-l3 `lesson` — AI Safety Basics
- w1-s4-p1 `puzzle` — Spot the Hallucination
- mb-w1 `miniboss` — The AI Apprentice Test

### Stage 5: The AI Ecosystem
- w1-s5-l1 `lesson` — ChatGPT and OpenAI
- w1-s5-l2 `lesson` — Claude by Anthropic
- w1-s5-l3 `lesson` — Open-Source Models
- w1-s5-c1 `challenge` — AI Ecosystem Challenge
- b-w1 `boss` — The AI Guardian

---

## World 2: Prompt Engineering
Accent: #5B7FA6 (steel blue)
Unlock: Complete World 1

### Stage 1: Prompt Anatomy
- w2-s1-l1 `lesson` — The Goal: What Do You Want?
- w2-s1-l2 `lesson` — Context: Setting the Scene
- w2-s1-l3 `lesson` — Constraints and Output Format
- w2-s1-c1 `challenge` — Prompt Anatomy Challenge

### Stage 2: Giving Better Instructions
- w2-s2-l1 `lesson` — Be Clear and Direct
- w2-s2-l2 `lesson` — Step-by-Step Prompting
- w2-s2-p1 `puzzle` — Prompt Clarity Puzzle

### Stage 3: Context Engineering
- w2-s3-l1 `lesson` — Why Context Matters
- w2-s3-l2 `lesson` — Adding Examples to Prompts
- w2-s3-c1 `challenge` — Context Engineering Challenge

### Stage 4: Output Control
- w2-s4-l1 `lesson` — Requesting Structured Output
- w2-s4-l2 `lesson` — Tables, Lists, and Formatting
- w2-s4-p1 `puzzle` — Output Format Puzzle
- mb-w2 `miniboss` — The Prompt Critic

### Stage 5: Advanced Prompting
- w2-s5-l1 `lesson` — Role and Persona Prompting
- w2-s5-l2 `lesson` — Chain and Multi-Step Prompting
- w2-s5-c1 `challenge` — Advanced Prompting Challenge
- b-w2 `boss` — The Prompt Master

---

## World 3: Automation Basics
Accent: #4D8A78 (teal)
Unlock: Complete World 2

### Stage 1: What is Automation?
- w3-s1-l1 `lesson` — Manual Work vs Automation
- w3-s1-l2 `lesson` — Automation Concepts
- w3-s1-l3 `lesson` — ROI of Automation
- w3-s1-c1 `challenge` — Automation Fundamentals Challenge

### Stage 2: Automation Thinking
- w3-s2-l1 `lesson` — Mapping Processes
- w3-s2-l2 `lesson` — Inputs, Outputs, and Dependencies
- w3-s2-p1 `puzzle` — Process Mapping Puzzle
- b-w3 `boss` — The Automation Architect

---

## World 4: Playwright Fundamentals
Accent: #9E5B5B (red)
Unlock: Complete World 3

### Stage 1: Playwright Setup
- w4-s1-l1 `lesson` — What is Playwright?
- w4-s1-l2 `lesson` — Setting Up a Playwright Project
- w4-s1-c1 `challenge` — Playwright Setup Challenge

### Stage 2: Locators and Actions
- w4-s2-l1 `lesson` — Finding Elements with Locators
- w4-s2-l2 `lesson` — Performing Actions
- w4-s2-p1 `puzzle` — Locator Selection Puzzle

### Stage 3: Assertions and Debugging
- w4-s3-l1 `lesson` — Writing Assertions
- w4-s3-l2 `lesson` — Debugging with Playwright Inspector
- w4-s3-c1 `challenge` — Assertions and Debugging Challenge
- b-w4 `boss` — The Playwright Maestro

---

## World 5: JavaScript Essentials
Accent: #C4922A (gold)
Unlock: Complete World 4
Status: Stub — content not yet authored

### Stage 1: Variables
### Stage 2: Functions
### Stage 3: Logic
### Stage 4: Loops
### Stage 5: Arrays and Objects
Boss: Build a small JavaScript program.

---

## World 6: Advanced Playwright
Accent: #7B5EA7 (purple)
Unlock: Complete World 5
Status: Stub — content not yet authored

### Stage 1: Fixtures
### Stage 2: Page Object Model
### Stage 3: Data-Driven Testing
### Stage 4: Parallel Execution
### Stage 5: CI/CD Integration
Boss: Build a production-ready automation suite.

---

## World 7: API Testing
Accent: #4A8A9C (cyan)
Unlock: Complete World 6
Status: Stub — content not yet authored

### Stage 1: What is an API?
### Stage 2: HTTP Methods
### Stage 3: Status Codes
### Stage 4: Request Bodies
### Stage 5: Authentication
Boss: Automate a complete API workflow.

---

## World 8: AI Agents
Accent: #5F8A6B (olive)
Unlock: Complete World 7
Status: Stub — content not yet authored

### Stage 1: What is an AI Agent?
### Stage 2: Tools
### Stage 3: Memory
### Stage 4: Planning
### Stage 5: Agent Workflows
Boss: Build your first AI Agent.

---

## World 9: MCP Mastery
Accent: #8C6B4A (brown)
Unlock: Complete World 8
Status: Stub — content not yet authored

### Stage 1: What is MCP?
### Stage 2: MCP Architecture
### Stage 3: MCP Servers
### Stage 4: MCP Clients
### Stage 5: Real-World Integrations
Boss: Connect an AI Agent to external tools.

---

## World 10: Software Architecture
Accent: #4A6B8C (navy)
Unlock: Complete World 9
Status: Stub — content not yet authored

### Stage 1: Monoliths
### Stage 2: Layered Architecture
### Stage 3: Design Patterns
### Stage 4: Scalability
### Stage 5: System Design Basics
Boss: Design a scalable application.

---

## World 11: AI Productivity
Accent: #8C7A5E (tan)
Unlock: Complete World 10
Status: Stub — content not yet authored

### Stage 1: Personal Productivity
### Stage 2: Content Creation
### Stage 3: Research
### Stage 4: Business Use Cases
### Stage 5: Advanced Workflows
Boss: Design an AI productivity workflow.

---

## World 12: AI Adventure Master Path
Accent: #C4922A (gold)
Unlock: Complete World 11
Status: Stub — content not yet authored

### Stage 1: AI Review
### Stage 2: Prompt Engineering Review
### Stage 3: Automation Review
### Stage 4: Playwright Review
### Stage 5: Agents Review
Boss: Build a complete AI-powered automation solution from scratch.
