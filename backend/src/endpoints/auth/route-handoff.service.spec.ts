import { RouteHandoffService } from './route-handoff.service';

describe('RouteHandoffService', () => {
  let service: RouteHandoffService;
  beforeEach(() => { service = new RouteHandoffService(); });

  it('returns the refresh token pushed for an id', () => {
    service.put('id-1', 'IFRICDR');
    expect(service.take('id-1')).toBe('IFRICDR');
  });

  it('is single use — a replayed id yields nothing', () => {
    service.put('id-1', 'IFRICDR');
    service.take('id-1');
    // An id read from a log or from browser history must already be spent.
    expect(service.take('id-1')).toBeNull();
  });

  it('returns null for an id that was never pushed', () => {
    expect(service.take('never')).toBeNull();
  });

  it('expires after its TTL', () => {
    service.put('id-1', 'IFRICDR');
    const realNow = Date.now;
    Date.now = () => realNow() + 61_000;
    try {
      expect(service.take('id-1')).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it('keeps separate handoffs independent', () => {
    service.put('a', '1');
    service.put('b', '2');
    expect(service.take('b')).toBe('2');
    expect(service.take('a')).toBe('1');
  });

  it('bounds memory if the endpoint is hammered', () => {
    for (let i = 0; i < 10_050; i++) service.put(`id-${i}`, 'x');
    // Past the cap, further pushes are dropped rather than growing without limit.
    expect(service.take('id-10049')).toBeNull();
    expect(service.take('id-0')).toBe('x');
  });
});
