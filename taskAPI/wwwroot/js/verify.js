/**
 * Email verification page logic.
 *
 * Important: the token is read from the URL query string.
 * Nota bene: this page is publicly accessible — no auth required.
 */

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');

    if (!token) {
        showMsg('status-area', 'No verification token provided.', 'warning');
        return;
    }

    verifyEmail(token)
        .then(function (r) {
            showMsg('status-area', r.message || 'Email verified successfully.', 'success');
        })
        .catch(function (err) {
            showMsg('status-area', err.message, 'danger');
        });
});
