import fs from 'fs';
import path from 'path';
import { Exam } from '../types/exam.types';

const DATA_FILE = process.env.EXAMS_DATA_FILE ?? path.resolve(__dirname, '../../data/exams.json');

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readAll(): Exam[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Exam[];
}

function writeAll(exams: Exam[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(exams, null, 2), 'utf-8');
}

export class ExamRepository {
  create(data: Exam): Exam {
    const exams = readAll();
    exams.push(data);
    writeAll(exams);
    return data;
  }

  findAll(): Exam[] {
    return readAll();
  }

  findById(id: string): Exam | null {
    return readAll().find((e) => e.id === id) ?? null;
  }

  update(id: string, updater: (e: Exam) => Exam): Exam | null {
    const exams = readAll();
    const index = exams.findIndex((e) => e.id === id);
    if (index === -1) return null;
    exams[index] = updater(exams[index]);
    writeAll(exams);
    return exams[index];
  }

  delete(id: string): boolean {
    const exams = readAll();
    const index = exams.findIndex((e) => e.id === id);
    if (index === -1) return false;
    exams.splice(index, 1);
    writeAll(exams);
    return true;
  }
}
