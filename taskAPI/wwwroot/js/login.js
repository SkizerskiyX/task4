document.addEventListener('DOMContentLoaded', function () {
    if (getToken()) {
        window.location.href = '/users.html';
        return;
    }

    var form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;

        if (!email || !password) {
            showMsg('status-area', 'Please enter both email and password.', 'warning');
            return;
        }

        login(email, password)
            .then(function (r) {
                saveToken(r.token);
                showMsg('status-area', 'Signed in successfully. Redirecting…', 'success');
                setTimeout(function () { window.location.href = '/users.html'; }, 600);
            })
            .catch(function (err) {
                showMsg('status-area', err.message, 'danger');
            });
    });
});
