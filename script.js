// State
let currentSlide = 0;
const totalSlides = 7;
const sectionTotals = [5, 15, 5, 7, 2, 10, 9];

// Go to slide
function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlide = index;
    const track = document.getElementById('slidesTrack');
    track.style.transform = `translateX(-${index * 100}%)`;

    // Update pills
    document.querySelectorAll('.pill').forEach((p, i) => {
        p.classList.toggle('active', i === index);
    });

    // Update float nav
    document.querySelectorAll('.float-nav-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Close float nav
    document.getElementById('floatNavPanel').classList.remove('open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateProgress();
}

// Handle Yes/No buttons
function handleYN(btn, value) {
    const group = btn.parentElement;
    const buttons = group.querySelectorAll('.yn-btn');

    buttons.forEach(b => {
        b.classList.remove('selected-yes', 'selected-no');
    });

    if (value === 'yes') {
        btn.classList.add('selected-yes');
    } else {
        btn.classList.add('selected-no');
    }

    // Handle conditional fields
    const conditionalId = btn.dataset.conditional;
    if (conditionalId) {
        const conditionalEl = document.getElementById(conditionalId);
        if (conditionalEl) {
            if (value === 'yes') {
                conditionalEl.style.display = 'block';
            } else {
                conditionalEl.style.display = 'none';
            }
        }
    }

    updateProgress();
}

// Mark indicator complete/skip
function markIndicator(btn, action) {
    const row = btn.closest('.indicator-row');
    const completeBtn = row.querySelector('.action-btn.complete');
    const skipBtn = row.querySelector('.action-btn.skip');
    const statusCircle = row.querySelector('.indicator-status');

    if (action === 'complete') {
        if (row.classList.contains('completed')) {
            // Undo
            row.classList.remove('completed');
            completeBtn.classList.remove('active-complete');
            statusCircle.textContent = '';
        } else {
            row.classList.remove('skipped');
            skipBtn.classList.remove('active-skip');
            row.classList.add('completed');
            completeBtn.classList.add('active-complete');
            statusCircle.textContent = '✓';
        }
    } else if (action === 'skip') {
        if (row.classList.contains('skipped')) {
            // Undo
            row.classList.remove('skipped');
            skipBtn.classList.remove('active-skip');
            statusCircle.textContent = '';
        } else {
            row.classList.remove('completed');
            completeBtn.classList.remove('active-complete');
            row.classList.add('skipped');
            skipBtn.classList.add('active-skip');
            statusCircle.textContent = '—';
        }
    }

    updateProgress();
}

// Toggle float nav
function toggleFloatNav() {
    document.getElementById('floatNavPanel').classList.toggle('open');
}

// Close float nav on outside click
document.addEventListener('click', (e) => {
    const panel = document.getElementById('floatNavPanel');
    const btn = document.getElementById('floatNavBtn');
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('open');
    }
});

// Count completed items in a section
function countSection(slideIndex) {
    const slide = document.querySelectorAll('.slide')[slideIndex];
    let completed = 0;
    let total = 0;

    if (slideIndex === 0) {
        // Corporate Info - count filled inputs and selects
        const inputs = slide.querySelectorAll('.tracked-input');
        total = inputs.length;
        inputs.forEach(input => {
            if (input.value && input.value.trim() !== '') completed++;
        });
    } else if (slideIndex === 1) {
        // Pre-Screening - count answered questions
        // Count form cards that are not conditional or are visible conditional
        const formCards = slide.querySelectorAll('.form-card:not(.conditional-card)');
        const visibleConditional = slide.querySelectorAll('.conditional-card');

        total = 0;
        completed = 0;

        // Regular form cards
        formCards.forEach(card => {
            total++;
            // Check if it has a select
            const sel = card.querySelector('.tracked-input');
            if (sel && sel.value && sel.value.trim() !== '') { completed++; return; }
            // Check if it has YN buttons
            const ynSelected = card.querySelector('.yn-btn.selected-yes, .yn-btn.selected-no');
            if (ynSelected) { completed++; return; }
            // Check if it has checkboxes
            const checks = card.querySelectorAll('.tracked-check');
            if (checks.length > 0) {
                const anyChecked = Array.from(checks).some(c => c.checked);
                if (anyChecked) { completed++; return; }
            }
        });

        // Visible conditional cards
        visibleConditional.forEach(card => {
            if (card.style.display !== 'none') {
                total++;
                const checks = card.querySelectorAll('.tracked-check');
                const sel = card.querySelector('.tracked-input');
                if (checks.length > 0) {
                    const anyChecked = Array.from(checks).some(c => c.checked);
                    if (anyChecked) completed++;
                }
                if (sel && sel.value && sel.value.trim() !== '') completed++;
            }
        });
    } else {
        // ESG Categories - count indicator rows
        const rows = slide.querySelectorAll('.indicator-row');
        total = rows.length;
        rows.forEach(row => {
            if (row.classList.contains('completed') || row.classList.contains('skipped')) {
                completed++;
            }
        });
    }

    return { completed, total };
}

// Update all progress
function updateProgress() {
    let totalCompleted = 0;
    let totalItems = 0;

    for (let i = 0; i < totalSlides; i++) {
        const { completed, total } = countSection(i);
        totalCompleted += completed;
        totalItems += total;

        // Update pill count
        const pillCount = document.getElementById(`pillCount${i}`);
        if (pillCount) pillCount.textContent = `${completed}/${total}`;

        // Update section metric
        const metricNum = document.getElementById(`metricNum${i}`);
        if (metricNum) metricNum.textContent = completed;
    }

    // Update status card
    document.getElementById('statusCompleted').textContent = totalCompleted;
    document.getElementById('statusTotal').textContent = totalItems;

    const pct = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;
    document.getElementById('statusBarFilled').style.width = pct + '%';

    // Count skipped for the skipped bar
    let totalSkipped = 0;
    for (let i = 2; i < totalSlides; i++) {
        const slide = document.querySelectorAll('.slide')[i];
        const skippedRows = slide.querySelectorAll('.indicator-row.skipped');
        totalSkipped += skippedRows.length;
    }
    const skipPct = totalItems > 0 ? (totalSkipped / totalItems) * 100 : 0;
    document.getElementById('statusBarSkipped').style.width = skipPct + '%';
}

// Listen for input changes
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('tracked-input')) {
        updateProgress();
    }
});

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('tracked-input') || e.target.classList.contains('tracked-check')) {
        updateProgress();
    }
});

// Pill clicks
document.querySelectorAll('.pill').forEach((pill, i) => {
    pill.addEventListener('click', () => goToSlide(i));
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
});
