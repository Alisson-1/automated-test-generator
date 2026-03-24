import { Before, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import app from '../app';
import { setResponse } from './manage_questions.steps';

let lastResponseBody: Record<string, unknown> = {};

function sync(status: number, body: Record<string, unknown>): void {
  lastResponseBody = body;
  setResponse(status, body);
}

Before(function () {
  lastResponseBody = {};
});

When('the teacher grades the exam with:', async function (docString: string) {
  const body = JSON.parse(docString);
  const res = await request(app)
    .post('/api/grade')
    .send(body)
    .set('Content-Type', 'application/json');
  sync(res.status, res.body);
});

Then('the report should contain a {string} field', function (fieldName: string) {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response should have a "data" field');
  assert.ok(
    fieldName in data,
    `Response data should contain field "${fieldName}"`,
  );
});

Then(
  'the report should show student {string} with total score {string}',
  function (studentId: string, expectedScore: string) {
    const data = lastResponseBody.data as Record<string, unknown>;
    assert.ok(data, 'Response should have a "data" field');
    const csv = data.reportCsv as string;
    assert.ok(typeof csv === 'string' && csv.length > 0, 'reportCsv should be a non-empty string');

    const lines = csv.trim().split('\n');
    const studentRow = lines.find((line) => line.startsWith(`${studentId},`));
    assert.ok(
      studentRow,
      `Could not find a row for student "${studentId}" in the report CSV.\nCSV:\n${csv}`,
    );

    const columns = studentRow.split(',');
    const totalScore = columns[columns.length - 1].trim();
    assert.strictEqual(
      totalScore,
      expectedScore,
      `Expected total score "${expectedScore}" for student "${studentId}" but got "${totalScore}"`,
    );
  },
);

Then(
  'the report should show student {string} with question {int} score {string}',
  function (studentId: string, questionIndex: number, expectedScore: string) {
    const data = lastResponseBody.data as Record<string, unknown>;
    assert.ok(data, 'Response should have a "data" field');
    const csv = data.reportCsv as string;

    const lines = csv.trim().split('\n');
    const studentRow = lines.find((line) => line.startsWith(`${studentId},`));
    assert.ok(
      studentRow,
      `Could not find a row for student "${studentId}" in the report CSV.\nCSV:\n${csv}`,
    );

    const columns = studentRow.split(',');
    const scoreColumnIndex = 1 + questionIndex;
    const questionScore = columns[scoreColumnIndex]?.trim();
    assert.strictEqual(
      questionScore,
      expectedScore,
      `Expected question ${questionIndex} score "${expectedScore}" for student "${studentId}" but got "${questionScore}".\nRow: ${studentRow}`,
    );
  },
);

Then('the report CSV header should be {string}', function (expectedHeader: string) {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response should have a "data" field');
  const csv = data.reportCsv as string;

  const headerRow = csv.trim().split('\n')[0].trim();
  assert.strictEqual(
    headerRow,
    expectedHeader,
    `Expected CSV header "${expectedHeader}" but got "${headerRow}"`,
  );
});

Then('the report CSV should have {int} rows', function (totalRows: number) {
  const data = lastResponseBody.data as Record<string, unknown>;
  assert.ok(data, 'Response should have a "data" field');
  const csv = data.reportCsv as string;
  const lines = csv.trim().split('\n');
  assert.strictEqual(
    lines.length,
    totalRows,
    `Expected ${totalRows} rows in report CSV but got ${lines.length}`,
  );
});
