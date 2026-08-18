document.addEventListener('DOMContentLoaded', function () {
    if (getToken()) {
        location.href = '/users.html';
        return;
    }

    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = document.getElementById('email').value.trim();
            var pass = document.getElementById('password').value;
            login(email, pass).then(function (r) {
                saveToken(r.token);
                location.href = '/users.html';
            }).catch(function (err) {
                showMsg('status-area', err.message, 'danger');
            });
        });
        return;
    }

    var regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var pass = document.getElementById('password').value;
            register(name, email, pass).then(function (r) {
                showMsg('status-area', r.message, 'success');
                regForm.reset();
            }).catch(function (err) {
                showMsg('status-area', err.message, 'danger');
            });
        });
    }

    var params = new URLSearchParams(location.search);
    var token = params.get('token');
    if (token) {
        fetch('/api/auth/verify?token=' + encodeURIComponent(token))
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (x) {
                if (!x.ok) throw new Error(x.d.message || 'Failed');
                showMsg('status-area', x.d.message, 'success');
            })
            .catch(function (err) {
                showMsg('status-area', err.message, 'danger');
            });
    }
});
