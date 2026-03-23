import { Before, Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { Exam } from '../types/exam.types';
import { setResponse } from './manage_questions.steps';

const EXAMS_DATA_FILE =
  process.env.EXAMS_DATA_FILE ?? path.resolve(__dirname, '../../data/exams.json');

let lastCreatedExamId: string = '';
let lastResponseBody: Record<string, unknown> = {};

function sync(status: number, body: Record<string, unknown>): void {
  lastResponseBody = body;
  setResponse(status, body);
}

Before(function () {
  if (fs.existsSync(EXAMS_DATA_FILE)) {
    fs.writeFileSync(EXAMS_DATA_FILE, JSON.stringify([]), 'utf-8');
  }
  lastCreatedExamId = '';
  lastResponseBody = {};
});

Given('the exam repository is empty', function () {
  const dir = path.dirname(EXAMS_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(EXAMS_DATA_FILE, JSON.stringify([]), 'utf-8');
});

Given('an exam already exists with title {string}', async function (title: string) {
  const questionsFile =
    process.env.QUESTIONS_DATA_FILE ?? path.resolve(__dirname, '../../data/questions.json');
  const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8')) as Array<{ id: string }>;
  const latestQuestionId = questions[questions.length - 1].id;

  const res = await request(app)
    .post('/api/exams')
    .send({ title, questionIds: [latestQuestionId], identifierMode: 'letters' })
    .set('Content-Type', 'application/json');

  lastCreatedExamId = (res.body.data as Exam).id;
  sync(res.status, res.body);
});

When(
  'the teacher creates an exam with title {string} using the last created question in {string} mode',
  async function (title: string, mode: string) {
    const questionsFile =
      process.env.QUESTIONS_DATA_FILE ?? path.resolve(__dirname, '../../data/questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8')) as Array<{ id: string }>;
    const latestQuestionId = questions[questions.length - 1].id;

    const res = await request(app)
      .post('/api/exams')
      .send({ title, questionIds: [latestQuestionId], identifierMode: mode })
      .set('Content-Type', 'application/json');

    if (res.body.data && (res.body.data as Exam).id) {
      lastCreatedExamId = (res.body.data as Exam).id;
    }
    sync(res.status, res.body);
  },
);

When(
  'the teacher creates an exam with title {string} using the last {int} created questions in {string} mode',
  async function (title: string, count: number, mode: string) {
    const questionsFile =
      process.env.QUESTIONS_DATA_FILE ?? path.resolve(__dirname, '../../data/questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8')) as Array<{ id: string }>;
    const questionIds = questions.slice(-count).map((q) => q.id);

    const res = await request(app)
      .post('/api/exams')
      .send({ title, questionIds, identifierMode: mode })
      .set('Content-Type', 'application/json');

    if (res.body.data && (res.body.data as Exam).id) {
      lastCreatedExamId = (res.body.data as Exam).id;
    }
    sync(res.status, res.body);
  },
);

When(
  'the teacher creates an exam with title {string} using the last created question twice',
  async function (title: string) {
    const questionsFile =
      process.env.QUESTIONS_DATA_FILE ?? path.resolve(__dirname, '../../data/questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8')) as Array<{ id: string }>;
    const latestQuestionId = questions[questions.length - 1].id;

    const res = await request(app)
      .post('/api/exams')
      .send({
        title,
        questionIds: [latestQuestionId, latestQuestionId],
        identifierMode: 'letters',
      })
      .set('Content-Type', 'application/json');

    sync(res.status, res.body);
  },
);

When('the teacher lists all exams', async function () {
  const res = await request(app).get('/api/exams');
  sync(res.status, res.body);
});

When('the teacher sends a GET request to the last created exam', async function () {
  const res = await request(app).get(`/api/exams/${lastCreatedExamId}`);
  sync(res.status, res.body);
});

When(
  'the teacher sends a PATCH request to the last created exam with:',
  async function (docString: string) {
    const body = JSON.parse(docString);
    const res = await request(app)
      .patch(`/api/exams/${lastCreatedExamId}`)
      .send(body)
      .set('Content-Type', 'application/json');
    sync(res.status, res.body);
  },
);

When('the teacher deletes the last created exam', async function () {
  const res = await request(app).delete(`/api/exams/${lastCreatedExamId}`);
  sync(res.status, res.body);
});

Then('the response body should contain an exam with title {string}', function (expectedTitle: string) {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response body should have a "data" field');
  assert.strictEqual(data.title, expectedTitle);
});

Then('the response exam should have identifier mode {string}', function (expectedMode: string) {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response body should have a "data" field');
  assert.strictEqual(data.identifierMode, expectedMode);
});

Then('the response exam should have an id', function () {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data.id, 'Exam should have an id');
});

Then('the response exam should have {int} question ids', function (expectedCount: number) {
  const data = lastResponseBody.data as Record<string, unknown>;
  const questionIds = data.questionIds as unknown[];
  assert.strictEqual(
    questionIds.length,
    expectedCount,
    `Expected ${expectedCount} question ids but got ${questionIds.length}`,
  );
});

Then('the response body should contain an empty list of exams', function () {
  const data = lastResponseBody.data as unknown[];
  assert.ok(Array.isArray(data), 'Response data should be an array');
  assert.strictEqual(data.length, 0, 'Response data should be an empty array');
});

Then('the response body should contain {int} exams', function (expectedCount: number) {
  const data = lastResponseBody.data as unknown[];
  assert.ok(Array.isArray(data), 'Response data should be an array');
  assert.strictEqual(
    data.length,
    expectedCount,
    `Expected ${expectedCount} exams but got ${data.length}`,
  );
});

Then('the last created exam should no longer exist in the repository', function () {
  const exams = JSON.parse(fs.readFileSync(EXAMS_DATA_FILE, 'utf-8')) as Exam[];
  const found = exams.find((e) => e.id === lastCreatedExamId);
  assert.strictEqual(found, undefined, 'Exam should have been deleted from the repository');
});
