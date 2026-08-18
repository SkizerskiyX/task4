/**
 * API communication layer.
 *
 * Important: every function returns a Promise that resolves to the JSON
 * body of a successful response. On 401 the user is redirected to login.
 * Note: the base URL is relative — works in both dev and production.
 */

/* ── Low-level fetch wrapper ─────────────────────────────────────── */

/**
 * api — sends an authorised request and returns the parsed JSON.
 * Nota bene: on 401 the token is cleared and the user is redirected.
 * @param {string} url
 * @param {object} opts — { method, body }
 * @returns {Promise<any>}
 */
async function api(url, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var res = await fetch(url, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body
    });

    var data = null;
    try { data = await res.json(); } catch (_e) { /* no body */ }

    if (res.status === 401) {
        goLogin();
        throw new Error(data && data.message ? data.message : 'Unauthorized');
    }
    if (!res.ok) {
        throw new Error(data && data.message ? data.message : 'Error ' + res.status);
    }
    return data;
}

/* ── Auth endpoints ──────────────────────────────────────────────── */

/** login — authenticates a user and returns { token, status }. */
function login(email, password) {
    return api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
    });
}

/** register — creates a new account. Returns { message }. */
function registerUser(name, email, password) {
    return api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name, email: email, password: password })
    });
}

/** verifyEmail — calls the verify endpoint with a token. */
function verifyEmail(token) {
    return api('/api/auth/verify?token=' + encodeURIComponent(token));
}

/* ── Users endpoints ─────────────────────────────────────────────── */

/** getUsers — fetches the full user list (admin view). */
function getUsers() {
    return api('/api/users');
}

/** getMe — fetches the currently-authenticated user's profile. */
function getMe() {
    return api('/api/users/me');
}

/* ── Batch actions ───────────────────────────────────────────────── */

/** blockUsers — blocks the given user IDs. */
function blockUsers(ids) {
    return api('/api/users/block', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}

/** unblockUsers — unblocks the given user IDs. */
function unblockUsers(ids) {
    return api('/api/users/unblock', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}

/** deleteUsers — deletes the given user IDs. */
function deleteUsers(ids) {
    return api('/api/users/delete', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}

/** deleteUnverified — deletes only unverified users from the given IDs. */
function deleteUnverifiedUsers(ids) {
    return api('/api/users/delete-unverified', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}
