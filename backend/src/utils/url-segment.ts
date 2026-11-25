import { BadRequestException } from '@nestjs/common';

/**
 * A request value placed into the path or query of an upstream URL.
 *
 * Unescaped, an id such as `../x` or `a?b` changes which upstream route is
 * called, with this service's or the user's token attached (CodeQL
 * js/request-forgery). encodeURIComponent keeps the value one segment, and the
 * receiving service decodes it back to what it was. `.` and `..` are refused
 * because they stay dot-segments even when escaped. Anything else is turned
 * into text exactly as the template literal did before, so a missing id still
 * reaches the upstream as "undefined" and fails there the same way.
 */
export function urlSegment(value: unknown, field = 'id'): string {
  const text = String(value);
  if (text === '.' || text === '..') {
    throw new BadRequestException(`${field} is not a valid id`);
  }
  return encodeURIComponent(text);
}
