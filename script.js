// ===== SLIDE NAVIGATION =====
let currentSlide = 0;
const totalSlides = 7;

function goToSlide(n) {
    if (n < 0 || n >= totalSlides) return;
    currentSlide = n;
    const track = document.getElementById('slidesTrack');
    track.style.transform = `translateX(-${n * (100 / totalSlides)}%)`;

    // Update pills
    document.querySelectorAll('.pill').forEach((p, i) => {
        p.classList.toggle('active', i === n);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateProgress();
}

// Pill clicks
document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
        goToSlide(parseInt(pill.dataset.section));
    });
});

// ===== FAB NAV =====
function toggleNav() {
    document.getElementById('fabPanel').classList.toggle('open');
}

// Close fab when clicking outside
document.addEventListener('click', (e) => {
    const fab = document.getElementById('fabBtn');
    const panel = document.getElementById('fabPanel');
    if (!fab.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('open');
    }
});

// ===== CORPORATE INFO TRACKING =====
document.querySelectorAll('.form-input, .form-select').forEach(input => {
    const handler = () => {
        const card = input.closest('.form-card');
        if (card) {
            card.classList.toggle('answered', input.value.trim() !== '');
        }
        updateProgress();
    };
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);
});

// ===== PRE-SCREENING: PILL OPTIONS =====
document.querySelectorAll('.pill-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const field = btn.dataset.psField;
        // Deselect siblings
        btn.parentElement.querySelectorAll('.pill-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Mark card as answered
        const card = btn.closest('.form-card');
        if (card) card.classList.add('answered');

        // Handle conditional fields
        handleConditional(field, btn.dataset.value);

        updateProgress();
    });
});

// ===== PRE-SCREENING: CHECKBOXES =====
document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const card = cb.closest('.form-card');
        if (card) {
            const anyChecked = card.querySelectorAll('input[type="checkbox"]:checked').length > 0;
            card.classList.toggle('answered', anyChecked);
        }
        updateProgress();
    });
});

// ===== CONDITIONAL LOGIC =====
function handleConditional(field, value) {
    document.querySelectorAll(`.form-card.conditional[data-depends="${field}"]`).forEach(card => {
        const showValue = card.dataset.dependsValue;
        if (value === showValue) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
            card.classList.remove('answered');
            // Reset inputs inside
            card.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            card.querySelectorAll('select').forEach(s => s.value = '');
            card.querySelectorAll('.pill-option').forEach(b => b.classList.remove('selected'));
        }
    });
    updateProgress();
}

// ===== INDICATOR ACTIONS =====
document.querySelectorAll('.indicator-row').forEach(row => {
    const btnComplete = row.querySelector('.btn-complete');
    const btnSkip = row.querySelector('.btn-skip');

    if (btnComplete) {
        btnComplete.addEventListener('click', () => {
            if (row.classList.contains('completed')) {
                row.classList.remove('completed');
                btnComplete.classList.remove('active');
            } else {
                row.classList.remove('skipped');
                row.classList.add('completed');
                btnComplete.classList.add('active');
                btnSkip.classList.remove('active');
            }
            updateProgress();
        });
    }

    if (btnSkip) {
        btnSkip.addEventListener('click', () => {
            if (row.classList.contains('skipped')) {
                row.classList.remove('skipped');
                btnSkip.classList.remove('active');
            } else {
                row.classList.remove('completed');
                row.classList.add('skipped');
                btnSkip.classList.add('active');
                btnComplete.classList.remove('active');
            }
            updateProgress();
        });
    }
});

// ===== PROGRESS TRACKING =====
function updateProgress() {
    // Count corporate info fields filled
    let corpFilled = 0;
    const corpTotal = 5;
    document.querySelectorAll('[data-slide="0"] .form-card').forEach(card => {
        if (card.classList.contains('answered')) corpFilled++;
        else {
            const input = card.querySelector('.form-input');
            const select = card.querySelector('.form-select');
            if ((input && input.value.trim()) || (select && select.value)) {
                corpFilled++;
            }
        }
    });

    // Count pre-screening answered (only visible ones)
    let psFilled = 0;
    let psTotal = 0;
    document.querySelectorAll('[data-slide="1"] .form-card[data-field="ps"]').forEach(card => {
        if (card.style.display === 'none') return;
        psTotal++;
        if (card.classList.contains('answered')) psFilled++;
    });

    // Count indicator rows
    let indCompleted = 0;
    let indSkipped = 0;
    let indTotal = 0;
    document.querySelectorAll('.indicator-row').forEach(row => {
        indTotal++;
        if (row.classList.contains('completed')) indCompleted++;
        else if (row.classList.contains('skipped')) indSkipped++;
    });

    const totalItems = corpTotal + psTotal + indTotal;
    const totalDone = corpFilled + psFilled + indCompleted;
    const totalSkippedCount = indSkipped;

    // Update status card
    document.getElementById('statusDone').textContent = totalDone;
    document.getElementById('statusTotal').textContent = totalItems;

    const pctDone = totalItems > 0 ? (totalDone / totalItems) * 100 : 0;
    const pctSkipped = totalItems > 0 ? (totalSkippedCount / totalItems) * 100 : 0;

    document.getElementById('barCompleted').style.width = pctDone + '%';
    document.getElementById('barSkipped').style.width = pctSkipped + '%';

    // Update per-section pill counts and metrics

    // Slide 0: Corp Info
    updatePillAndMetric(0, corpFilled, corpTotal);

    // Slide 1: Pre-Screening
    updatePillAndMetric(1, psFilled, psTotal);

    // Slides 2-6: Categories
    const slideIndicatorCounts = [
        { slide: 2, total: 5 },
        { slide: 3, total: 7 },
        { slide: 4, total: 2 },
        { slide: 5, total: 10 },
        { slide: 6, total: 9 }
    ];

    slideIndicatorCounts.forEach(({ slide, total }) => {
        let completed = 0;
        let skipped = 0;
        document.querySelectorAll(`[data-slide="${slide}"] .indicator-row`).forEach(row => {
            if (row.classList.contains('completed')) completed++;
            else if (row.classList.contains('skipped')) skipped++;
        });
        const active = completed;
        updatePillAndMetric(slide, active, total);
    });
}

function updatePillAndMetric(slideIndex, done, total) {
    const pillCount = document.getElementById(`pillCount${slideIndex}`);
    if (pillCount) pillCount.textContent = `${done}/${total}`;

    const metricNum = document.getElementById(`metricNum${slideIndex}`);
    if (metricNum) metricNum.textContent = done;
}

// Initialize
updateProgress();
