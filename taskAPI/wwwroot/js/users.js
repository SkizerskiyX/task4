let allUsers = [];
let selectedIds = new Set();
let currentUserId = null;

function showStatus(message, type) {
    type = type || 'success';
    var el = document.getElementById('status-area');
    if (!el) return;

    el.innerHTML =
        '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' +
            escapeHtml(message) +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
        '</div>';

    if (type !== 'danger') {
        setTimeout(function () {
            var alertEl = el.querySelector('.alert');
            if (alertEl) {
                alertEl.classList.remove('show');
                setTimeout(function () { el.innerHTML = ''; }, 200);
            }
        }, 5000);
    }
}

function clearStatus() {
    var el = document.getElementById('status-area');
    if (el) el.innerHTML = '';
}

function getSelectedUsers() {
    return allUsers.filter(function (u) { return selectedIds.has(u.id); });
}

function updateToolbarState() {
    var selected = getSelectedUsers();
    var hasSelection = selected.length > 0;
    var hasBlocked = selected.some(function (u) { return u.status === 'Blocked'; });
    var hasUnverified = selected.some(function (u) { return u.status === 'Unverified'; });

    document.getElementById('btn-block').disabled = !hasSelection;
    document.getElementById('btn-unblock').disabled = !hasBlocked;
    document.getElementById('btn-delete').disabled = !hasSelection;
    document.getElementById('btn-delete-unverified').disabled = !hasUnverified;

    var selectAll = document.getElementById('select-all');
    if (allUsers.length === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    } else if (selectedIds.size === allUsers.length) {
        selectAll.checked = true;
        selectAll.indeterminate = false;
    } else if (selectedIds.size === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    } else {
        selectAll.checked = false;
        selectAll.indeterminate = true;
    }
}

function renderUsersTable() {
    var tbody = document.getElementById('users-body');
    tbody.innerHTML = '';

    if (allUsers.length === 0) {
        var emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center text-muted py-4">No users found.</td>';
        tbody.appendChild(emptyRow);
        updateToolbarState();
        return;
    }

    allUsers.forEach(function (user) {
        var checkboxId = getUniqIdValue('chk');
        var isChecked = selectedIds.has(user.id);

        var row = document.createElement('tr');
        row.className = user.id === currentUserId ? 'table-active' : '';
        row.innerHTML =
            '<td class="col-select text-center">' +
                '<input class="form-check-input user-select" type="checkbox" id="' + checkboxId + '"' +
                ' data-user-id="' + escapeHtml(user.id) + '"' +
                (isChecked ? ' checked' : '') +
                ' aria-label="Select ' + escapeHtml(user.name) + '">' +
            '</td>' +
            '<td>' + escapeHtml(user.name) + '</td>' +
            '<td class="text-wrap-cell">' + escapeHtml(user.email) + '</td>' +
            '<td>' + formatDateTime(user.lastLogInAt) + '</td>' +
            '<td>' + formatDateTime(user.createdAt) + '</td>' +
            '<td class="text-center">' +
                '<span class="badge rounded-pill status-badge ' + getStatusBadgeClass(user.status) + '">' +
                    escapeHtml(user.status) +
                '</span>' +
            '</td>';

        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.user-select').forEach(function (cb) {
        cb.addEventListener('change', function (e) {
            var uid = e.target.dataset.userId;
            if (e.target.checked) {
                selectedIds.add(uid);
            } else {
                selectedIds.delete(uid);
            }
            updateToolbarState();
        });
    });

    updateToolbarState();
}

async function loadUsers() {
    allUsers = await getUsers();
    renderUsersTable();
}

async function handleAction(actionFn, successMessageBuilder) {
    var userIds = Array.from(selectedIds);
    if (userIds.length === 0) {
        showStatus('No users selected.', 'warning');
        return;
    }

    clearStatus();
    try {
        var result = await actionFn(userIds);
        showStatus(result.message || successMessageBuilder(userIds.length), 'success');

        selectedIds.clear();
        await loadUsers();
    } catch (err) {
        showStatus(err.message, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireAuth()) return;

    var tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach(function (el) { new bootstrap.Tooltip(el); });

    document.getElementById('logout-link').addEventListener('click', function (e) {
        e.preventDefault();
        redirectToLogin();
    });

    document.getElementById('select-all').addEventListener('change', function (e) {
        if (e.target.checked) {
            allUsers.forEach(function (u) { selectedIds.add(u.id); });
        } else {
            selectedIds.clear();
        }
        renderUsersTable();
    });

    document.getElementById('btn-block').addEventListener('click', function () {
        handleAction(blockUsers, function (c) { return 'Blocked ' + c + ' user(s).'; });
    });
    document.getElementById('btn-unblock').addEventListener('click', function () {
        handleAction(unblockUsers, function (c) { return 'Unblocked ' + c + ' user(s).'; });
    });
    document.getElementById('btn-delete').addEventListener('click', function () {
        handleAction(deleteUsers, function (c) { return 'Deleted ' + c + ' user(s).'; });
    });
    document.getElementById('btn-delete-unverified').addEventListener('click', function () {
        handleAction(deleteUnverifiedUsers, function (c) { return 'Deleted ' + c + ' unverified user(s).'; });
    });

    try {
        var currentUser = await getMe();
        currentUserId = currentUser.id;
        saveCurrentUser(currentUser);
        document.getElementById('current-user-label').textContent =
            currentUser.name + ' (' + currentUser.email + ')';
        await loadUsers();
    } catch (err) {
        showStatus(err.message, 'danger');
    }
});
