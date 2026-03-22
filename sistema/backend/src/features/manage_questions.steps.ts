import { Before, Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { Question } from '../types/question.types';

const DATA_FILE = path.resolve(__dirname, '../../data/questions.json');

interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
}

let response: ApiResponse;
let lastCreatedQuestionId: string;

Before(function () {
  if (fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
  lastCreatedQuestionId = '';
});

Given('the question repository is empty', function () {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
});

Given('a question already exists with statement {string}', async function (statement: string) {
  const res = await request(app)
    .post('/api/questions')
    .send({
      statement,
      alternatives: [
        { description: 'Option A', correct: true },
        { description: 'Option B', correct: false },
      ],
    })
    .set('Content-Type', 'application/json');
  lastCreatedQuestionId = (res.body.data as Question).id;
});

When('the teacher sends a POST request to {string} with:', async function (endpoint: string, docString: string) {
  const body = JSON.parse(docString);
  const res = await request(app).post(endpoint).send(body).set('Content-Type', 'application/json');
  response = { status: res.status, body: res.body };
});

When('the teacher sends a PATCH request to the last created question at {string} with:', async function (endpointTemplate: string, docString: string) {
  const endpoint = endpointTemplate.replace(':id', lastCreatedQuestionId);
  const body = JSON.parse(docString);
  const res = await request(app).patch(endpoint).send(body).set('Content-Type', 'application/json');
  response = { status: res.status, body: res.body };
});

When('the teacher sends a PATCH request to {string} with:', async function (endpoint: string, docString: string) {
  const body = JSON.parse(docString);
  const res = await request(app).patch(endpoint).send(body).set('Content-Type', 'application/json');
  response = { status: res.status, body: res.body };
});

When('the teacher sends a PATCH request to the first alternative of the last created question with description {string}', async function (description: string) {
  const questions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Question[];
  const question = questions.find((q) => q.id === lastCreatedQuestionId)!;
  const altId = question.alternatives[0].id;
  const res = await request(app)
    .patch(`/api/questions/${lastCreatedQuestionId}/alternatives/${altId}`)
    .send({ description })
    .set('Content-Type', 'application/json');
  response = { status: res.status, body: res.body };
});

When('the teacher sends a PATCH request to the first alternative of the last created question with correct false and description {string}', async function (description: string) {
  const questions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Question[];
  const question = questions.find((q) => q.id === lastCreatedQuestionId)!;
  const altId = question.alternatives[0].id;
  const res = await request(app)
    .patch(`/api/questions/${lastCreatedQuestionId}/alternatives/${altId}`)
    .send({ description, correct: false })
    .set('Content-Type', 'application/json');
  response = { status: res.status, body: res.body };
});

Then('the response status should be {int}', function (expectedStatus: number) {
  assert.strictEqual(
    response.status,
    expectedStatus,
    `Expected status ${expectedStatus} but got ${response.status}. Body: ${JSON.stringify(response.body)}`
  );
});

Then('the response body should contain a question with statement {string}', function (expectedStatement: string) {
  const data = response.body.data as Record<string, unknown>;
  assert.ok(data, 'Response body should have a "data" field');
  assert.strictEqual(data.statement, expectedStatement);
});

Then('the response question should have {int} alternatives', function (expectedCount: number) {
  const data = response.body.data as Record<string, unknown>;
  const alternatives = data.alternatives as unknown[];
  assert.strictEqual(alternatives.length, expectedCount);
});

Then('the response question should have an id', function () {
  const data = response.body.data as Record<string, unknown>;
  assert.ok(data.id, 'Question should have an id');
});

Then('the first alternative of the response question should have description {string}', function (expectedDescription: string) {
  const data = response.body.data as Record<string, unknown>;
  const alternatives = data.alternatives as Array<Record<string, unknown>>;
  assert.ok(alternatives && alternatives.length > 0, 'Response question should have alternatives');
  assert.strictEqual(alternatives[0].description, expectedDescription);
});

Then('the first alternative of the response question should still be correct', function () {
  const data = response.body.data as Record<string, unknown>;
  const alternatives = data.alternatives as Array<Record<string, unknown>>;
  assert.ok(alternatives && alternatives.length > 0, 'Response question should have alternatives');
  assert.strictEqual(alternatives[0].correct, true, 'The first alternative should still be marked as correct');
});
