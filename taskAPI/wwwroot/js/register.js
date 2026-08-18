/**
 * Registration page logic.
 *
 * Important: the user is registered right away. A verification email
 * is sent asynchronously (server-side). The response message tells the
 * user to check their inbox.
 * Note: unverified users can still log in — verification is optional
 * for login but required for full status.
 */

document.addEventListener('DOMContentLoaded', function () {
    /* Already authenticated — no need to register. */
    if (getToken()) {
        window.location.href = '/users.html';
        return;
    }

    var form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;

        /* Nota bene: all three fields are required. */
        if (!name || !email || !password) {
            showMsg('status-area', 'Name, email and password are required.', 'warning');
            return;
        }

        registerUser(name, email, password)
            .then(function (r) {
                showMsg('status-area', r.message || 'Registration successful.', 'success');
                form.reset();
            })
            .catch(function (err) {
                showMsg('status-area', err.message, 'danger');
            });
    });
});
