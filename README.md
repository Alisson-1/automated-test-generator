# Automated Test Generator

Web system for creating and grading multiple-choice exams. Teachers manage questions, compose exams, generate individualized randomized PDF proofs with answer keys, and grade student responses.

## Live Demo

| | URL |
|---|---|
| Frontend | https://exam-generator-frontend.mangofield-411aaeaf.brazilsouth.azurecontainerapps.io/exams |
| Backend (health) | https://exam-generator-backend.mangofield-411aaeaf.brazilsouth.azurecontainerapps.io/api/health |

## Features

- **Question management** — create, edit, and delete questions with multiple alternatives; bulk import
- **Exam composition** — select questions and choose an identifier mode (`letters` or `powers-of-2`)
- **Proof generation** — generate up to 500 individualized, randomized PDF proofs + a CSV answer key in a single request
- **Grading** — upload the answer key CSV and the student responses CSV to receive a scored report CSV; supports strict and lenient grading modes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Validation | Zod |
| PDF generation | PDFKit |
| Tests | Cucumber.js (acceptance) + Jest (unit) |
| Orchestration | Docker Compose |

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Run in development

```bash
cd sistema
npm run dev
```

The frontend is available at `http://localhost:5173` and the backend at `http://localhost:3000`.

### Run tests

```bash
cd sistema
npm run test
npm run test:e2e
```

Without Docker:

```bash
cd sistema/backend
npm run dev
npm run test
npm run test:cucumber

cd sistema/frontend
npm run dev
npm test
```

## Domain Concepts

### Question
A statement with a list of alternatives. Each alternative has a description and a `correct` boolean flag.

### Exam
A set of selected questions with a chosen **identifier mode**:

| Mode | Student writes | Answer key format |
|---|---|---|
| `letters` | The letters of the correct alternatives (e.g. `A,C`) | Comma-separated letters |
| `powers-of-2` | The sum of the powers of 2 corresponding to correct alternatives | Numeric sum |

### Proof
An individualized, randomized instance of an exam. Questions and alternatives are shuffled for each proof. Each proof is identified by a sequential number printed in the PDF footer.

### Grading modes

| Mode | Behavior |
|---|---|
| **Strict** | Any wrong selection or omission zeroes the entire question |
| **Lenient** | Score is proportional to the percentage of correct selections/omissions |

## API Reference

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server health check |

### Questions
| Method | Path | Description |
|---|---|---|
| GET | `/api/questions` | List all questions |
| POST | `/api/questions` | Create a question |
| POST | `/api/questions/bulk` | Bulk import questions (207 multi-status) |
| PATCH | `/api/questions/:id` | Update statement and/or alternatives |
| POST | `/api/questions/:id/alternatives` | Add an alternative |
| PATCH | `/api/questions/:id/alternatives/:altId` | Update an alternative |
| DELETE | `/api/questions/:id` | Delete a question |
| DELETE | `/api/questions/:id/alternatives/:altId` | Delete an alternative |

### Exams
| Method | Path | Description |
|---|---|---|
| GET | `/api/exams` | List all exams |
| GET | `/api/exams/:id` | Get exam by ID |
| POST | `/api/exams` | Create an exam |
| PATCH | `/api/exams/:id` | Update an exam |
| DELETE | `/api/exams/:id` | Delete an exam |
| POST | `/api/exams/:id/generate-proofs` | Generate proofs (PDF + answer key CSV) |

### Grading
| Method | Path | Description |
|---|---|---|
| POST | `/api/grade` | Grade responses; returns a scored report CSV |

## Project Structure

```
sistema/
├── docker-compose.yml
├── package.json
├── frontend/
│   └── src/
│       ├── service/endpoint/
│       └── modules/
│           ├── questions/
│           ├── exams/
│           ├── grading/
│           ├── layout/
│           └── home/
└── backend/
    └── src/
        ├── routes/
        ├── controllers/
        ├── services/
        ├── repositories/
        ├── middleware/
        ├── types/
        ├── utils/
        └── features/
```

### Frontend architecture

Logic is always separated from UI. Every feature module follows the pattern:

- **`service/endpoint/`** — raw API call functions
- **`hooks/`** — business logic, state, API calls
- **`components/`** — presentational only; no direct API calls or complex state
- **`views/`** — page-level composition of hooks + components; entry point for each route

### Backend architecture

Layered architecture:

- **`routes/`** — route definitions and Zod input validation
- **`controllers/`** — HTTP request/response handling
- **`services/`** — business logic (scoring, PDF generation, CSV parsing)
- **`repositories/`** — data access (in-memory)
- **`middleware/`** — global error handler
- **`utils/`** — custom error classes (`AppError`, `NotFoundError`, etc.)

## Testing

Acceptance tests are written in Gherkin (`.feature` files) and run with Cucumber.js. There are **96 acceptance test scenarios** across four feature files:

| Feature file | Scenarios |
|---|---|
| `manage_questions.feature` | 37 |
| `manage_exams.feature` | 15 |
| `generate_proofs.feature` | 17 |
| `grade_exam.feature` | 27 |

Unit tests cover services and utility functions (PDF layout, CSV parsing, score calculation) and run with Jest.
