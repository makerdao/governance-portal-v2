import { validateText } from '../../../lib/polling/validator';
import fs from 'fs';
const validMarkdown = fs.readFileSync(__dirname + '/poll-327.md').toString();

test('accept a valid document', () => {
  const result = validateText(validMarkdown);
  expect(result.valid).toBeTruthy();  
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

xtest('reject a document with no options', () => {
  const result = validateText(todo);
  expect(result.valid).toBeFalsy();  
});

xtest('reject a document with missing start time', () => {
  const result = validateText(todo);
  expect(result.valid).toBeFalsy();  
});

xtest('reject a document with too-short duration', () => {
  const result = validateText(todo);
  expect(result.valid).toBeFalsy();  
});

xtest('reject a document with invalid vote type', () => {
  const result = validateText(validMarkdown.replace('Plurality', 'Blurality'));
  expect(result.valid).toBeFalsy();
  expect(result.errors).toContain('Invalid vote type: "Blurality Voting"');
});

xtest('reject a document with invalid category', () => {
  const result = validateText(todo);
  expect(result.valid).toBeFalsy();  
});
