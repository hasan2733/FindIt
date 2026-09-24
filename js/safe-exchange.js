// safe-exchange.js - Safe handover flow and contact modal

document.addEventListener('DOMContentLoaded', function() {
    setupSafeExchangePage();
    setupContactModal();
});

function setupSafeExchangePage() {
    const form = document.getElementById('handover-form');
    if (!form) return;

    form.addEventListener('submit', handleHandoverSubmit);
    renderRecentExchanges();
}

function setupContactModal() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;

    const closeBtn = document.getElementById('contactModalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSafeExchangeModal);
    }

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeSafeExchangeModal();
    });
}

function openSafeExchangeModal(itemId) {
    const item = getItems().find(i => i.id === itemId);
    if (!item) {
        showToast('Item not found.');
        return;
    }

    const finder = getUsers().find(u => u.id === item.userId);
    if (!finder) {
        showToast('Finder details are not available.');
        return;
    }

    const currentUser = getCurrentUser();
    const senderEmail = currentUser ? currentUser.email : '';
    const code = generateVerificationCode();

    const modalBody = document.getElementById('contact-modal-body');
    if (!modalBody) return;

    const subject = `Safe Exchange Request - ${item.itemName}`;
    const body = [
        `Hi ${finder.name},`,
        '',
        `A FindIt user would like to arrange a safe handover for this item:`,
        '',
        `Item: ${item.itemName}`,
        `Location: ${item.location}`,
        `Date: ${item.date}`,
        `Verification code: ${code}`,
        '',
        `Please meet in a public place. Suggested locations:`,
        ...getMeetingLocations().map(loc => `- ${loc.name}`),
        '',
        `Thanks,`
    ].join('\n');

    const mailto = `mailto:${encodeURIComponent(finder.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    modalBody.innerHTML = `
        <p>We will contact the finder for you.</p>
        <p><strong>Finder:</strong> ${escapeHtml(finder.name)}</p>
        <p><strong>Item:</strong> ${escapeHtml(item.itemName)}</p>
        <p><strong>Suggested meeting locations:</strong></p>
        <ul>
            ${getMeetingLocations().map(loc => `<li>${escapeHtml(loc.name)}</li>`).join('')}
        </ul>
        <p><strong>Verification code:</strong> <span class="verification-code">${code}</span></p>
        <a href="${mailto}" class="btn btn-primary btn-block">Send Email to Finder</a>
        ${senderEmail ? `<p class="modal-subtitle">The email will be sent from ${escapeHtml(senderEmail)}.</p>` : ''}
    `;

    document.getElementById('contactModal').style.display = 'flex';
}

function closeSafeExchangeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.style.display = 'none';
}

function handleHandoverSubmit(event) {
    event.preventDefault();

    const itemId = document.getElementById('handover-item-id').value.trim();
    const ownerName = document.getElementById('handover-owner-name').value.trim();
    const description = document.getElementById('handover-item-desc').value.trim();
    const meeting = document.getElementById('handover-meeting').value;

    if (!itemId || !ownerName || !description) {
        showToast('Please fill in all fields.');
        return;
    }

    const item = getItems().find(i => i.id === itemId);
    const code = generateVerificationCode();
    const exchange = {
        id: 'exchange' + Date.now(),
        itemId,
        ownerName,
        description,
        meeting,
        code,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    const exchanges = getSafeExchanges();
    exchanges.push(exchange);
    setSafeExchanges(exchanges);
    localStorage.setItem('findit_current_exchange_id', exchange.id);

    showHandoverResult(exchange);
    showToast('Handover request created. Share the code with the verified owner.');
}

function showHandoverResult(exchange) {
    let container = document.getElementById('handover-result');
    if (!container) {
        container = document.createElement('div');
        container.id = 'handover-result';
        const card = document.querySelector('.exchange-card');
        if (card) card.after(container);
    }

    container.className = 'exchange-result';
    container.innerHTML = `
        <h2>Handover Started</h2>
        <p><strong>Item ID:</strong> ${escapeHtml(exchange.itemId)}</p>
        <p><strong>Owner:</strong> ${escapeHtml(exchange.ownerName)}</p>
        <p><strong>Meeting location:</strong> ${escapeHtml(meetingLocationName(exchange.meeting))}</p>
        <p><strong>Verification code:</strong> <span class="verification-code">${escapeHtml(exchange.code)}</span></p>
        <div class="modal-actions">
            <button class="btn btn-primary btn-sm" id="markReturnedBtn">Mark as Returned</button>
            <button class="btn btn-outline btn-sm" id="reportSuspiciousBtn">Report Suspicious Behavior</button>
        </div>
    `;

    document.getElementById('markReturnedBtn').addEventListener('click', markAsReturned);
    document.getElementById('reportSuspiciousBtn').addEventListener('click', openSuspiciousReportModal);
}

function markAsReturned() {
    const currentId = localStorage.getItem('findit_current_exchange_id');
    if (!currentId) return;

    const exchanges = getSafeExchanges();
    const updated = exchanges.map(ex => ex.id === currentId ? { ...ex, status: 'returned' } : ex);
    setSafeExchanges(updated);
    localStorage.removeItem('findit_current_exchange_id');

    showToast('Exchange marked as returned.');
    renderRecentExchanges();
}

function openSuspiciousReportModal() {
    let modal = document.getElementById('suspiciousReportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'suspiciousReportModal';
        modal.innerHTML = `
            <div class="modal">
                <button class="modal-close" id="suspiciousReportClose">Close</button>
                <h2>Report Suspicious Behavior</h2>
                <p class="modal-subtitle">Describe what happened so the safe exchange can be reviewed.</p>
                <form id="suspiciousReportForm">
                    <div class="form-group">
                        <label for="suspiciousReportText">What happened?</label>
                        <textarea id="suspiciousReportText" rows="4" placeholder="Describe the suspicious behavior..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Submit Report</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('suspiciousReportClose').addEventListener('click', function() {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.style.display = 'none';
        });

        document.getElementById('suspiciousReportForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const text = document.getElementById('suspiciousReportText').value.trim();
            if (!text) return;

            const reports = getSuspiciousReports();
            reports.push({
                id: 'report' + Date.now(),
                text,
                createdAt: new Date().toISOString()
            });
            setSuspiciousReports(reports);

            modal.style.display = 'none';
            showToast('Suspicious behavior reported. Thank you.');
        });
    }

    modal.style.display = 'flex';
}

function renderRecentExchanges() {
    const container = document.getElementById('recent-exchanges');
    if (!container) return;

    const exchanges = getSafeExchanges().slice().reverse();
    if (!exchanges.length) {
        container.innerHTML = '<p class="loading-placeholder">No exchanges yet.</p>';
        return;
    }

    container.innerHTML = exchanges.map(ex => `
        <div class="exchange-item">
            <p><strong>${escapeHtml(ex.itemId)}</strong> · ${escapeHtml(ex.ownerName)}</p>
            <p class="dashboard-item-meta">${escapeHtml(meetingLocationName(ex.meeting))} · ${escapeHtml(ex.status)}</p>
        </div>
    `).join('');
}

function generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('findit_verification_code', code);
    return code;
}

function meetingLocationName(value) {
    const location = getMeetingLocations().find(loc => loc.id === value);
    return location ? location.name : value;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
