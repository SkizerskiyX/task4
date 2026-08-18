let allUsers = [];
let selectedIds = new Set();
let currentUserId = null;

function showStatus(message, type = 'success') {
    const element = document.getElementById('status-area');
    if (!element) {
        return;
    }

    element.innerHTML = `
        <div class="alert alert-${type} mb-3" role="alert">${message}</div>
    `;
}

function clearStatus() {
    const element = document.getElementById('status-area');
    if (element) {
        element.innerHTML = '';
    }
}

function getSelectedUsers() {
    return allUsers.filter((user) => selectedIds.has(user.id));
}

function updateToolbarState() {
    const selected = getSelectedUsers();
    const hasSelection = selected.length > 0;
    const hasBlocked = selected.some((user) => user.status === 'Blocked');
    const hasUnverified = selected.some((user) => user.status === 'Unverified');

    document.getElementById('btn-block').disabled = !hasSelection;
    document.getElementById('btn-unblock').disabled = !hasBlocked;
    document.getElementById('btn-delete').disabled = !hasSelection;
    document.getElementById('btn-delete-unverified').disabled = !hasUnverified;

    const selectAll = document.getElementById('select-all');
    if (allUsers.length === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
        return;
    }

    if (selected.length === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    } else if (selected.length === allUsers.length) {
        selectAll.checked = true;
        selectAll.indeterminate = false;
    } else {
        selectAll.checked = false;
        selectAll.indeterminate = true;
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-body');
    tbody.innerHTML = '';

    allUsers.forEach((user) => {
        const rowId = getUniqIdValue('row');
        const checkboxId = getUniqIdValue('user');
        const isChecked = selectedIds.has(user.id);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="col-select">
                <input class="form-check-input user-select" type="checkbox" id="${checkboxId}"
                    data-user-id="${user.id}" ${isChecked ? 'checked' : ''}>
            </td>
            <td>${escapeHtml(user.name)}</td>
            <td class="text-wrap-cell">${escapeHtml(user.email)}</td>
            <td>${formatDateTime(user.lastLogInAt)}</td>
            <td>${formatDateTime(user.createdAt)}</td>
            <td><span class="badge status-badge ${getStatusBadgeClass(user.status)}">${user.status}</span></td>
        `;

        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.user-select').forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const userId = event.target.dataset.userId;
            if (event.target.checked) {
                selectedIds.add(userId);
            } else {
                selectedIds.delete(userId);
            }
            updateToolbarState();
        });
    });

    updateToolbarState();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function loadUsers() {
    allUsers = await fetchUsers();
    renderUsersTable();
}

async function handleAction(actionFn, successMessageBuilder) {
    const userIds = Array.from(selectedIds);
    if (userIds.length === 0) {
        showStatus('No users selected.', 'warning');
        return;
    }

    clearStatus();
    try {
        const result = await actionFn(userIds);
        showStatus(result.message || successMessageBuilder(userIds.length), 'success');

        if (result.blockedSelf || result.deletedSelf) {
            setTimeout(() => redirectToLogin(), 800);
            return;
        }

        selectedIds.clear();
        await loadUsers();
    } catch (error) {
        showStatus(error.message, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) {
        return;
    }

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((element) => new bootstrap.Tooltip(element));

    document.getElementById('logout-link').addEventListener('click', (event) => {
        event.preventDefault();
        redirectToLogin();
    });

    document.getElementById('select-all').addEventListener('change', (event) => {
        if (event.target.checked) {
            allUsers.forEach((user) => selectedIds.add(user.id));
        } else {
            selectedIds.clear();
        }
        renderUsersTable();
    });

    document.getElementById('btn-block').addEventListener('click', () => {
        handleAction(blockUsers, (count) => `Blocked ${count} user(s).`);
    });

    document.getElementById('btn-unblock').addEventListener('click', () => {
        handleAction(unblockUsers, (count) => `Unblocked ${count} user(s).`);
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        handleAction(deleteUsers, (count) => `Deleted ${count} user(s).`);
    });

    document.getElementById('btn-delete-unverified').addEventListener('click', () => {
        handleAction(deleteUnverifiedUsers, (count) => `Deleted ${count} unverified user(s).`);
    });

    try {
        const currentUser = await fetchCurrentUser();
        currentUserId = currentUser.id;
        saveCurrentUser(currentUser);
        document.getElementById('current-user-label').textContent =
            `${currentUser.name} (${currentUser.email})`;
        await loadUsers();
    } catch (error) {
        showStatus(error.message, 'danger');
    }
});
