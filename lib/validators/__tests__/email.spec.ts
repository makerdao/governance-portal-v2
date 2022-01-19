import { isValidEmail } from '../email';

describe('Email validator', () => {
  it('Should validate a correct email', () => {
    const valid = isValidEmail('aaa@asd.com');
    expect(valid).toBe(true);
  });

  it('Should say is not valid', () => {
    const valid = isValidEmail('foot');
    expect(valid).toBe(false);
  });
});
