import fs from 'fs';
import path from 'path';
import { Question, CreateQuestionDTO } from '../types/question.types';

const DATA_FILE = path.resolve(__dirname, '../../data/questions.json');

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readAll(): Question[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Question[];
}

function writeAll(questions: Question[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2), 'utf-8');
}

export class QuestionRepository {
  create(data: CreateQuestionDTO & { id: string; createdAt: string; updatedAt: string }): Question {
    const questions = readAll();
    const question: Question = {
      id: data.id,
      statement: data.statement,
      alternatives: data.alternatives.map((alt, index) => ({
        id: `${data.id}-${index}`,
        description: alt.description,
        correct: alt.correct,
      })),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    questions.push(question);
    writeAll(questions);
    return question;
  }

  findAll(): Question[] {
    return readAll();
  }

  findById(id: string): Question | null {
    return readAll().find((q) => q.id === id) ?? null;
  }

  update(id: string, updater: (q: Question) => Question): Question | null {
    const questions = readAll();
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) return null;
    questions[index] = updater(questions[index]);
    writeAll(questions);
    return questions[index];
  }

  delete(id: string): boolean {
    const questions = readAll();
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) return false;
    questions.splice(index, 1);
    writeAll(questions);
    return true;
  }
}
