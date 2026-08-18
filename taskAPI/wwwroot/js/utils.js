let _uid = 0;

function getUniqIdValue(prefix) {
    _uid++;
    return (prefix || 'id') + _uid;
}

function formatDateTime(v) {
    if (!v) return '-';
    return new Date(v).toLocaleString();
}

function statusClass(s) {
    if (s === 'Active') return 'text-bg-success';
    if (s === 'Blocked') return 'text-bg-danger';
    return 'text-bg-secondary';
}

function saveToken(t) { localStorage.setItem('token', t); }
function getToken() { return localStorage.getItem('token'); }
function clearToken() { localStorage.removeItem('token'); }

function goLogin() {
    clearToken();
    location.href = '/login.html';
}

function needAuth() {
    if (!getToken()) { goLogin(); return false; }
    return true;
}

function showMsg(id, text, kind) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<div class="alert alert-' + (kind || 'info') + ' mb-0">' + text + '</div>';
}
