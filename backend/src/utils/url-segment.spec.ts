import { BadRequestException } from '@nestjs/common';
import { urlSegment } from './url-segment';

describe('urlSegment', () => {
  it('escapes a value into one path segment', () => {
    expect(urlSegment('urn:ngsi-ld:asset:2:1')).toBe('urn%3Angsi-ld%3Aasset%3A2%3A1');
    expect(urlSegment('../auth/x')).toBe('..%2Fauth%2Fx');
    expect(urlSegment('a b?c=d#e')).toBe('a%20b%3Fc%3Dd%23e');
    expect(urlSegment(42)).toBe('42');
  });

  it('keeps the old text for a missing value', () => {
    expect(urlSegment(undefined)).toBe('undefined');
    expect(urlSegment('')).toBe('');
  });

  it.each([['.'], ['..']])('refuses the dot-segment %p', (value) => {
    expect(() => urlSegment(value)).toThrow(BadRequestException);
  });
});
