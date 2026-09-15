import { Injectable } from '@nestjs/common';

interface HandoffEntry {
  ifricdr: string;
  expiresAt: number;
}

/**
 * Holds a refresh token that IFX Suite pushed here moments before sending the
 * user over, so `decryptRoute` can hand it to the browser and the session can
 * refresh instead of dying with its access token.
 *
 * The refresh token is delivered by a push rather than fetched by this app,
 * and that direction is the whole point. IFX Suite runs on the customer's own
 * server; several targets run in the cloud. A cloud application cannot open a
 * connection back into a customer's network, so anything pull-based works only
 * for the on-premise pair. Pushing works for both, because IFX Suite can reach
 * outward in either case.
 *
 * It is also not carried in the URL: encrypted and masked, a refresh token is
 * 2,300-4,400 characters, and it would land in access logs, proxy logs and
 * browser history — a longer-lived credential than the access token already
 * travelling there.
 *
 * In-memory on purpose: entries live for sixty seconds and are read once. If
 * this application runs more than one replica, the push and the redirect can
 * land on different pods; a miss is not a failure — the session simply behaves
 * as it did before, with no refresh — but a shared store would be needed to
 * close that window.
 */
@Injectable()
export class RouteHandoffService {
  private static readonly TTL_MS = 60_000;
  // Bounds memory if the endpoint is ever hammered. Entries are tiny and
  // short-lived, so this is far above any real burst.
  private static readonly MAX_ENTRIES = 10_000;

  private readonly store = new Map<string, HandoffEntry>();

  /** Records a refresh token against the handoff id inside the route token. */
  put(id: string, ifricdr: string): void {
    this.sweep();
    if (this.store.size >= RouteHandoffService.MAX_ENTRIES) {
      return;
    }
    this.store.set(id, {
      ifricdr,
      expiresAt: Date.now() + RouteHandoffService.TTL_MS,
    });
  }

  /**
   * Returns the refresh token once and forgets it. Single use, so an id read
   * from a log or from browser history is already spent.
   */
  take(id: string): string | null {
    this.sweep();
    const entry = this.store.get(id);
    if (!entry) {
      return null;
    }
    this.store.delete(id);
    return entry.expiresAt < Date.now() ? null : entry.ifricdr;
  }

  // Swept on access rather than on a timer, which would keep the process alive.
  private sweep(): void {
    const now = Date.now();
    for (const [id, entry] of this.store) {
      if (entry.expiresAt < now) {
        this.store.delete(id);
      }
    }
  }
}
