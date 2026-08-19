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
    try { data = await res.json(); } catch (_e) { }

    if (res.status === 401) {
        goLogin();
        throw new Error(data && data.message ? data.message : 'Unauthorized');
    }
    if (!res.ok) {
        throw new Error(data && data.message ? data.message : 'Error ' + res.status);
    }
    return data;
}

function login(email, password) {
    return api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
    });
}

function registerUser(name, email, password) {
    return api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name, email: email, password: password })
    });
}

function verifyEmail(token) {
    return api('/api/auth/verify?token=' + encodeURIComponent(token));
}

function getUsers() {
    return api('/api/users');
}

function getMe() {
    return api('/api/users/me');
}

function blockUsers(ids) {
    return api('/api/users/block', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}

function unblockUsers(ids) {
    return api('/api/users/unblock', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}

function deleteUsers(ids) {
    return api('/api/users/delete', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}

function deleteUnverifiedUsers(ids) {
    return api('/api/users/delete-unverified', {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
    });
}
