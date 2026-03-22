# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web system for creating and grading multiple-choice exams. Teachers manage questions and exams, generate randomized PDF proofs with answer keys (CSV), and grade student responses from a CSV collected via Google Forms.

## Tech Stack

- **Monorepo** with `sistema/frontend` and `sistema/backend`, orchestrated via Docker Compose
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + TypeScript (Express)
- **Tests**: Cucumber.js + Gherkin for acceptance tests; Jest for unit tests
- **PDF generation**: backend responsibility
- **CSV**: import/export on the backend

## Repository Layout

```
sistema/
├── frontend/
├── backend/
├── docker-compose.yml
└── package.json          # root scripts (install, dev, test)
```

## Frontend Architecture

Logic is always separated from UI. Every feature module follows this structure:

```
frontend/src/
├── service/
│   └── endpoint/         # Raw API call functions (axios/fetch)
└── modules/
    └── [feature]/        # e.g. questions, exams, results
        ├── components/   # Presentational (no business logic)
        ├── hooks/        # Business logic, state, API calls via service/
        ├── views/        # Page-level composition of components + hooks
        └── types/        # TypeScript types/interfaces for the feature
```

- **hooks** own all logic and call `service/endpoint` directly
- **components** receive only props; no direct API calls or complex state
- **views** wire hooks to components — they are the entry point for each route


## Domain Concepts

- **Question**: statement + list of alternatives; each alternative has text and a boolean `correct` flag
- **Exam**: set of selected questions + identifier mode (`letters` | `powers-of-2`)
  - `letters`: student writes the selected letters; answer key = comma-separated letters
  - `powers-of-2`: student writes the sum of powers; answer key = expected sum
- **Proof** (prova individual): a randomized instance of an exam — questions and alternatives shuffled; identified by a sequential proof number in the PDF footer
- **Grading modes**:
  - *strict*: any wrong selection/omission zeroes the whole question
  - *lenient*: score proportional to percentage of correct selections/omissions

## Commands

```bash
# From repo root (sistema/)
npm run dev          # start frontend + backend via Docker Compose
npm run test         # run all tests (unit + acceptance)
npm run test:e2e     # Cucumber acceptance tests only

# Frontend
cd sistema/frontend && npm run dev
cd sistema/frontend && npm test

# Backend
cd sistema/backend && npm run dev
cd sistema/backend && npm test
cd sistema/backend && npm run test:cucumber
```

## Backend Architecture

Follow the layered architecture from the `nodejs-backend-patterns` skill:

```
backend/src/
├── controllers/   # HTTP request/response handling
├── services/      # Business logic (exam grading, PDF generation, CSV parsing)
├── repositories/  # Data access
├── middleware/    # Express middleware (error handling, validation)
├── routes/        # Route definitions
├── types/         # Shared TypeScript types
└── features/      # Cucumber step definitions + .feature files
```

Use Zod for input validation. Custom error classes (`AppError`, `NotFoundError`, etc.) with a global error handler middleware.

## Testing Approach

Acceptance tests use Cucumber.js with `.feature` files written in Gherkin. Each feature corresponds to a domain use case (e.g., `manage_questions.feature`, `generate_proofs.feature`, `grade_exam.feature`). Step definitions live alongside the feature files in `backend/src/features/`.

Unit tests (Jest) cover services and utility functions (e.g., PDF layout, CSV parsing, score calculation).

## Available Skills

| Skill | When to use |
|---|---|
| `git-commit` | Committing changes — generates conventional commit messages from the diff |
| `nodejs-backend-patterns` | Creating/modifying backend code — layered architecture, middleware, error handling, validation |
| `vercel-react-best-practices` | Writing React components — re-render optimization, bundle size, async patterns. **Note:** ignore `server-*` rules (Next.js/RSC only); focus on `rerender-*`, `async-*`, `bundle-*`, `js-*` |
| `cucumber-gherkin` | Writing acceptance tests — `.feature` files in Gherkin, step definitions with Cucumber.js, test setup/teardown |
