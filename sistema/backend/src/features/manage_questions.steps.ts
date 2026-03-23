import { Before, Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { Question } from '../types/question.types';

const DATA_FILE = process.env.QUESTIONS_DATA_FILE ?? path.resolve(__dirname, '../../data/questions.json');

interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
}

let response: ApiResponse = { status: 0, body: {} };
let lastCreatedQuestionId: string;

export function setResponse(status: number, body: Record<string, unknown>): void {
  response = { status, body };
}

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

Given('a question with {int} alternatives already exists', async function (count: number) {
  const alternatives = Array.from({ length: count }, (_, i) => ({
    description: `Option ${String.fromCharCode(65 + i)}`,
    correct: i === 0,
  }));
  const res = await request(app)
    .post('/api/questions')
    .send({ statement: `A question with ${count} alternatives`, alternatives })
    .set('Content-Type', 'application/json');
  lastCreatedQuestionId = (res.body.data as Question).id;
});

When('the teacher deletes the last created question', async function () {
  const res = await request(app).delete(`/api/questions/${lastCreatedQuestionId}`);
  response = { status: res.status, body: res.body };
});

When('the teacher sends a DELETE request to {string}', async function (endpointTemplate: string) {
  const endpoint = endpointTemplate.replace(':id', lastCreatedQuestionId);
  const res = await request(app).delete(endpoint);
  response = { status: res.status, body: res.body };
});

When('the teacher deletes the last non-correct alternative of the last created question', async function () {
  const questions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Question[];
  const question = questions.find((q) => q.id === lastCreatedQuestionId)!;
  const alt = [...question.alternatives].reverse().find((a) => !a.correct)!;
  const res = await request(app).delete(`/api/questions/${lastCreatedQuestionId}/alternatives/${alt.id}`);
  response = { status: res.status, body: res.body };
});

When('the teacher deletes the correct alternative of the last created question', async function () {
  const questions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Question[];
  const question = questions.find((q) => q.id === lastCreatedQuestionId)!;
  const alt = question.alternatives.find((a) => a.correct)!;
  const res = await request(app).delete(`/api/questions/${lastCreatedQuestionId}/alternatives/${alt.id}`);
  response = { status: res.status, body: res.body };
});

Then('the last created question should no longer exist in the repository', function () {
  const questions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Question[];
  const found = questions.find((q) => q.id === lastCreatedQuestionId);
  assert.strictEqual(found, undefined, 'Question should have been deleted from the repository');
});

When('the teacher sends a GET request to {string}', async function (endpoint: string) {
  const res = await request(app).get(endpoint);
  response = { status: res.status, body: res.body };
});

When('the teacher sends a POST request to the last created question at {string} with:', async function (endpointTemplate: string, docString: string) {
  const endpoint = endpointTemplate.replace(':id', lastCreatedQuestionId);
  const body = JSON.parse(docString);
  const res = await request(app).post(endpoint).send(body).set('Content-Type', 'application/json');
  response = { status: res.status, body: res.body };
});

Then('the response body should contain an empty list of questions', function () {
  const data = response.body.data as unknown[];
  assert.ok(Array.isArray(data), 'Response data should be an array');
  assert.strictEqual(data.length, 0, 'Response data should be an empty array');
});

Then('the response body should contain {int} questions', function (expectedCount: number) {
  const data = response.body.data as unknown[];
  assert.ok(Array.isArray(data), 'Response data should be an array');
  assert.strictEqual(data.length, expectedCount, `Expected ${expectedCount} questions but got ${data.length}`);
});

Then('the response question should have exactly 1 correct alternative', function () {
  const data = response.body.data as Record<string, unknown>;
  const alternatives = data.alternatives as Array<Record<string, unknown>>;
  const correctCount = alternatives.filter((a) => a.correct).length;
  assert.strictEqual(correctCount, 1, `Expected exactly 1 correct alternative but found ${correctCount}`);
});

Then('the bulk result should have {int} created questions and {int} failures', function (expectedCreated: number, expectedFailed: number) {
  const data = response.body.data as { created: unknown[]; failed: unknown[] };
  assert.ok(data, 'Response body should have a "data" field');
  assert.ok(Array.isArray(data.created), 'data.created should be an array');
  assert.ok(Array.isArray(data.failed), 'data.failed should be an array');
  assert.strictEqual(data.created.length, expectedCreated, `Expected ${expectedCreated} created but got ${data.created.length}`);
  assert.strictEqual(data.failed.length, expectedFailed, `Expected ${expectedFailed} failures but got ${data.failed.length}`);
});
