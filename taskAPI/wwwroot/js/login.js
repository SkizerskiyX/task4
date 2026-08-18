/**
 * Login page logic.
 *
 * Important: if the user already has a token we skip the form entirely
 * and redirect to the users table.
 * Nota bene: the form is validated client-side before the request.
 */

document.addEventListener('DOMContentLoaded', function () {
    /* Already authenticated — go straight to the admin panel. */
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

        /* Basic validation — note that password can be any non-empty string. */
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
