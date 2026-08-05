import { buildSalt } from './build-salt';

describe('buildSalt testing', () => {
  it('should join randomSalt and saltWord with a colon', () => {
    expect(buildSalt('abc', 'secret')).toBe('abc:secret');
  });
});
