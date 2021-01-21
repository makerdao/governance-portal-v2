import { validateText } from '../../../lib/polling/validator';
import fs from 'fs';
const pollMetadata = fs.readFileSync(__dirname + '/poll-431.md').toString();

test('accept a valid document', () => {
  const result = validateText(pollMetadata);
  expect(result.valid).toBeTruthy();
  expect(result.errors.length).toBe(0);
});

test('reject a blank document', () => {
  const result = validateText('');
  expect(result.valid).toBeFalsy();
});

test('reject null', () => {
  const result = validateText(null);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('expected input to be a string or buffer');
});

test('reject a document with no options', () => {
  const result = validateText(`---
vote_type: Plurality Voting
---
# Hello world
  `);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Vote options are missing');
});

test('reject a document with bad options type', () => {
  const result = validateText(`---
vote_type: Plurality Voting
options: wat
---
# Hello world
    `);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Vote options must be a numbered list');
});

test('reject a document with bad options keys', () => {
  const result = validateText(`---
vote_type: Plurality Voting
options:
  0: foo
  1: bar
  three: baz
---
# Hello world
    `);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Vote option IDs must be numbers');
});

test('reject a document with invalid vote type', () => {
  const result = validateText(pollMetadata.replace('Plurality', 'Blurality'));
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Invalid vote type: "Blurality Voting"');
});

test('reject a document with no categories', () => {
  const result = validateText(`---
vote_type: Plurality Voting
options:
  0: foo
  1: bar
  
---
# Hello world`);
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Categories are missing');
});

test('reject a document with invalid category', () => {
  const result = validateText(
    pollMetadata.replace('Technical', 'Jechnical').replace('Risk Variable', 'Zisk Zariable')
  );
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Invalid categories: Zisk Zariable, Jechnical');
});
