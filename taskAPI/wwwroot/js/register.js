document.addEventListener('DOMContentLoaded', function () {
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
