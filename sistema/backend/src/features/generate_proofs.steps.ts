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
const QUESTIONS_DATA_FILE =
  process.env.QUESTIONS_DATA_FILE ?? path.resolve(__dirname, '../../data/questions.json');

let lastCreatedExamId: string = '';
let lastResponseBody: Record<string, unknown> = {};

function sync(status: number, body: Record<string, unknown>): void {
  lastResponseBody = body;
  setResponse(status, body);
}

Before(function () {
  lastCreatedExamId = '';
  lastResponseBody = {};
});

Given('an exam already exists with title {string} in {string} mode', async function (title: string, mode: string) {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_DATA_FILE, 'utf-8')) as Array<{ id: string }>;
  const latestQuestionId = questions[questions.length - 1].id;

  const res = await request(app)
    .post('/api/exams')
    .send({ title, questionIds: [latestQuestionId], identifierMode: mode })
    .set('Content-Type', 'application/json');

  lastCreatedExamId = (res.body.data as Exam).id;
  sync(res.status, res.body);
});

Given('an exam already exists with title {string} using the last {int} questions', async function (title: string, count: number) {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_DATA_FILE, 'utf-8')) as Array<{ id: string }>;
  const questionIds = questions.slice(-count).map((q) => q.id);

  const res = await request(app)
    .post('/api/exams')
    .send({ title, questionIds, identifierMode: 'letters' })
    .set('Content-Type', 'application/json');

  lastCreatedExamId = (res.body.data as Exam).id;
  sync(res.status, res.body);
});

When(
  'the teacher generates {int} proof(s) for the last created exam with header:',
  async function (count: number, docString: string) {
    const header = JSON.parse(docString);
    const res = await request(app)
      .post(`/api/exams/${lastCreatedExamId}/generate-proofs`)
      .send({ count, header })
      .set('Content-Type', 'application/json');
    sync(res.status, res.body);
  },
);

When(
  'the teacher sends a POST request to generate proofs for the last created exam with count {int}',
  async function (count: number) {
    const res = await request(app)
      .post(`/api/exams/${lastCreatedExamId}/generate-proofs`)
      .send({
        count,
        header: { discipline: 'Any', teacher: 'Any', date: '2026-03-23' },
      })
      .set('Content-Type', 'application/json');
    sync(res.status, res.body);
  },
);

When(
  'the teacher sends a POST request to the last created exam at {string} with:',
  async function (endpointTemplate: string, docString: string) {
    const endpoint = endpointTemplate.replace(':id', lastCreatedExamId);
    const body = JSON.parse(docString);
    const res = await request(app)
      .post(endpoint)
      .send(body)
      .set('Content-Type', 'application/json');
    sync(res.status, res.body);
  },
);

Then('the response should contain a base64 pdf', function () {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response body should have a "data" field');
  assert.ok(typeof data.pdf === 'string' && data.pdf.length > 0, 'pdf should be a non-empty base64 string');
  assert.doesNotThrow(() => Buffer.from(data.pdf as string, 'base64'), 'pdf should be valid base64');
});

Then('the response should contain a csv', function () {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response body should have a "data" field');
  assert.ok(typeof data.csv === 'string' && data.csv.length > 0, 'csv should be a non-empty string');
});

Then('the csv should have {int} data rows', function (expectedRows: number) {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response body should have a "data" field');
  const lines = (data.csv as string).trim().split('\n');
  // First line is the header row; the rest are data rows
  const dataRows = lines.length - 1;
  assert.strictEqual(
    dataRows,
    expectedRows,
    `Expected ${expectedRows} data rows in CSV but got ${dataRows}`,
  );
});

Then('the csv first data row answer key should not be a plain number', function () {
  const data = lastResponseBody.data as Record<string, unknown>;
  const lines = (data.csv as string).trim().split('\n');
  // lines[0] = header, lines[1] = first proof row: "1,<answerKey>"
  const firstDataRow = lines[1];
  const answerKey = firstDataRow.split(',').slice(1).join(',');
  assert.ok(
    isNaN(Number(answerKey)),
    `Expected letters-mode answer key to not be a plain number but got "${answerKey}"`,
  );
});

Then('the csv first data row answer key should be a numeric value', function () {
  const data = lastResponseBody.data as Record<string, unknown>;
  const lines = (data.csv as string).trim().split('\n');
  const firstDataRow = lines[1];
  const answerKey = firstDataRow.split(',').slice(1).join(',');
  assert.ok(
    !isNaN(Number(answerKey)) && answerKey.trim() !== '',
    `Expected powers-of-2 answer key to be numeric but got "${answerKey}"`,
  );
});

Then('the last created proof exam should no longer exist in the repository', function () {
  const exams = JSON.parse(fs.readFileSync(EXAMS_DATA_FILE, 'utf-8')) as Exam[];
  const found = exams.find((e) => e.id === lastCreatedExamId);
  assert.strictEqual(found, undefined, 'Exam should have been deleted from the repository');
});
