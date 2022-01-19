import { validateText, hardcodedCategories } from '../validator';
import fs from 'fs';
const pollMetadata = fs.readFileSync(__dirname + '/__helpers__/poll-431.md').toString();

test('accept a valid document', () => {
  const result = validateText(pollMetadata, hardcodedCategories);
  expect(result.valid).toBeTruthy();
  expect(result.errors.length).toBe(0);
});

test('reject a blank document', () => {
  const result = validateText('', hardcodedCategories);
  expect(result.valid).toBeFalsy();
});

test('reject null', () => {
  const result = validateText(null, hardcodedCategories);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('expected input to be a string or buffer');
});

test('reject a document with no options', () => {
  const result = validateText(
    `---
vote_type: Plurality Voting
---
# Hello world
  `,
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Vote options are missing');
});

test('reject a document with bad options type', () => {
  const result = validateText(
    `---
vote_type: Plurality Voting
options: wat
---
# Hello world
    `,
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Vote options must be a numbered list');
});

test('reject a document with bad options keys', () => {
  const result = validateText(
    `---
vote_type: Plurality Voting
options:
  0: foo
  1: bar
  three: baz
---
# Hello world
    `,
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Vote option IDs must be numbers');
});

test('reject a document with invalid vote type', () => {
  const result = validateText(pollMetadata.replace('Plurality', 'Blurality'), hardcodedCategories);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Invalid vote type: "Blurality Voting"');
});

test('reject a document with no categories', () => {
  const result = validateText(
    `---
vote_type: Plurality Voting
options:
  0: foo
  1: bar
  
---
# Hello world`,
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Categories are missing');
});

test('reject a document with invalid category', () => {
  const result = validateText(
    pollMetadata.replace('Technical', 'Jechnical').replace('Risk Variable', 'Zisk Zariable'),
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Invalid categories: Zisk Zariable, Jechnical');
});

test('reject a document with a missing date', () => {
  const result = validateText(
    pollMetadata.replace('start_date', 'x').replace('end_date', 'y'),
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Start date is missing');
  expect(result.errors).toContain('End date is missing');
});

test('reject a document with an invalid date', () => {
  const result = validateText(
    pollMetadata.replace(/start_date: .*/, 'start_date: foo').replace(/end_date: .*/, 'end_date: bar'),
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Invalid start date (should be like "2020-08-16T08:00:00")');
  expect(result.errors).toContain('Invalid end date (should be like "2020-08-16T08:00:00")');
});

test('reject a document with an invalid duration', () => {
  const result = validateText(
    pollMetadata.replace(/end_date: .*/, 'end_date: 2021-01-18T16:59:00'),
    hardcodedCategories
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Poll duration is too short');
});
