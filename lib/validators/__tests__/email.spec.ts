import { test } from "gray-matter";
import { isValidEmail } from "../email";

describe('Email validator', () => {
  test('Should validate a correct email', () => {
    const valid = isValidEmail('aaa@asd.com');
    expect(valid).toBe(true);
  });

  test('Should say is not valid', () => {
    const valid = isValidEmail('foot');
    expect(valid).toBe(false);
  })
})