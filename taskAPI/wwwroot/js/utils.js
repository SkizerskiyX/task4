let _uid = 0;

function getUniqIdValue(prefix) {
    _uid++;
    return (prefix || 'id') + _uid;
}

function formatDateTime(v) {
    if (!v) return '—';
    try {
        return new Date(v).toLocaleString();
    } catch (_e) {
        return '—';
    }
}

function saveToken(t) { localStorage.setItem('authToken', t); }

function getToken() { return localStorage.getItem('authToken'); }

function clearToken() { localStorage.removeItem('authToken'); }

function goLogin() {
    clearToken();
    window.location.href = '/login.html';
}

function redirectToLogin() {
    goLogin();
}

function requireAuth() {
    if (!getToken()) { goLogin(); return false; }
    return true;
}

function saveCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (_e) {
        return null;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function statusClass(s) {
    if (s === 'Active') return 'text-bg-success';
    if (s === 'Blocked') return 'text-bg-danger';
    return 'text-bg-secondary';
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active':   return 'bg-success';
        case 'Blocked':  return 'bg-danger';
        case 'Unverified': return 'bg-secondary';
        default:         return 'bg-light text-dark';
    }
}

function showMsg(id, text, kind) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<div class="alert alert-' + (kind || 'info') + ' alert-dismissible fade show" role="alert">'
        + escapeHtml(text)
        + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
        + '</div>';
}
