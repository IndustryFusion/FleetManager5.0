import axios from "axios";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

/**
 * Exchanges the stored refresh token for a fresh pair.
 *
 * Raw axios on purpose: the `api` response interceptor is what calls this, so
 * routing the refresh through `api` would mean a failed refresh triggers
 * another refresh.
 */
export const refreshSession = async (ifricdr: string) => {
    // Bounded deliberately. Every request that hit a 401 is queued behind this
    // one call, so an unbounded wait here does not fail one request — it
    // stalls the whole page with no error and no end, which reads as the app
    // having hung. Ten seconds is far longer than the round trip needs
    // (Keycloak answers in ~100ms) and short enough to fail visibly.
    const response = await axios.post(
        `${BACKEND_API_URL}/auth/refresh`,
        { ifricdr },
        { timeout: 10000 },
    );
    return response.data;
};
