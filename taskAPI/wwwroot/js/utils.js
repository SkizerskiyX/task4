/**
 * Utility functions shared across all pages.
 *
 * Important: every helper is intentionally small so it can be unit-tested
 * in isolation. Note that getUniqIdValue generates sequential IDs that are
 * unique within a single page session.
 */

/* ── Unique-ID generator ─────────────────────────────────────────── */
let _uid = 0;

/**
 * getUniqIdValue — returns a globally unique string within the page.
 * Important: the prefix makes the ID readable in DevTools.
 * @param {string} prefix — e.g. "row", "user", "chk"
 * @returns {string}
 */
function getUniqIdValue(prefix) {
    _uid++;
    return (prefix || 'id') + _uid;
}

/* ── Date / time formatting ──────────────────────────────────────── */

/**
 * formatDateTime — renders an ISO-ish timestamp as a locale string.
 * Note: returns a dash when the value is null/undefined.
 * @param {string|null} v
 * @returns {string}
 */
function formatDateTime(v) {
    if (!v) return '—';
    try {
        return new Date(v).toLocaleString();
    } catch (_e) {
        return '—';
    }
}

/* ── Auth helpers ────────────────────────────────────────────────── */

/** saveToken — persists the JWT in localStorage. Nota bene: clearing
 *  the token is done via clearToken(). */
function saveToken(t) { localStorage.setItem('authToken', t); }

/** getToken — retrieves the JWT or null. */
function getToken() { return localStorage.getItem('authToken'); }

/** clearToken — removes the stored JWT. */
function clearToken() { localStorage.removeItem('authToken'); }

/** goLogin — redirects to the sign-in page and clears the token. */
function goLogin() {
    clearToken();
    window.location.href = '/login.html';
}

/** redirectToLogin — alias so users.js can call it directly. */
function redirectToLogin() {
    goLogin();
}

/** requireAuth — guard for pages that require a valid token.
 *  Returns true if the user may proceed, false otherwise. */
function requireAuth() {
    if (!getToken()) { goLogin(); return false; }
    return true;
}

/* ── Current-user cache ──────────────────────────────────────────── */

/** saveCurrentUser — stores the current user object in sessionStorage
 *  so other parts of the UI can read name/email without another fetch. */
function saveCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/** getCurrentUser — returns the cached user object or null. */
function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (_e) {
        return null;
    }
}

/* ── HTML escaping ───────────────────────────────────────────────── */

/** escapeHtml — prevents XSS when injecting user-supplied strings.
 * Important: always call this before inserting into innerHTML. */
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/* ── Status helpers ──────────────────────────────────────────────── */

/** statusClass — maps a status string to a Bootstrap color utility. */
function statusClass(s) {
    if (s === 'Active') return 'text-bg-success';
    if (s === 'Blocked') return 'text-bg-danger';
    return 'text-bg-secondary';
}

/** getStatusBadgeClass — returns the Tailwind-like class for a badge.
 *  Note: used by users.js to colour-code rows. */
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active':   return 'bg-success';
        case 'Blocked':  return 'bg-danger';
        case 'Unverified': return 'bg-secondary';
        default:         return 'bg-light text-dark';
    }
}

/* ── Message display ─────────────────────────────────────────────── */

/**
 * showMsg — renders an alert inside the element with the given id.
 * @param {string} id   — DOM element id
 * @param {string} text — message text (plain)
 * @param {string} kind — Bootstrap alert colour ('success','danger',…)
 */
function showMsg(id, text, kind) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<div class="alert alert-' + (kind || 'info') + ' alert-dismissible fade show" role="alert">'
        + escapeHtml(text)
        + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
        + '</div>';
}
