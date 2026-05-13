// ===== SLIDE NAVIGATION =====
let currentSlide = 0;
const totalSlides = 7;

function goToSlide(n) {
    if (n < 0 || n >= totalSlides) return;
    currentSlide = n;
    document.querySelector('.slides-track').style.transform = `translateX(-${n * 100}%)`;
    
    // Update pills
    document.querySelectorAll('.pill').forEach((p, i) => {
        p.classList.toggle('active', i === n);
    });
    
    // Scroll slide to top
    document.querySelectorAll('.slide')[n].scrollTop = 0;
    
    // Update float nav
    document.querySelectorAll('.float-nav-item').forEach((item, i) => {
        item.classList.toggle('active', i === n);
    });
    
    // Close float nav
    document.getElementById('floatNav').classList.remove('open');
    
    updateProgress();
}

// Pill clicks
document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
        goToSlide(parseInt(pill.dataset.section));
    });
});

// ===== FLOATING NAV =====
function toggleFloatNav() {
    document.getElementById('floatNav').classList.toggle('open');
}

// Close float nav on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.float-nav-panel') && !e.target.closest('.float-nav-btn')) {
        document.getElementById('floatNav').classList.remove('open');
    }
});

// ===== YES/NO BUTTONS =====
document.querySelectorAll('.yn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.parentElement;
        group.querySelectorAll('.yn-btn').forEach(b => {
            b.classList.remove('selected', 'selected-no');
        });
        
        if (btn.dataset.value === 'no') {
            btn.classList.add('selected-no');
        } else {
            btn.classList.add('selected');
        }
        
        // Mark card as answered
        const card = btn.closest('.q-card');
        if (card) card.classList.add('answered');
        
        // Handle conditional fields
        const gate = card ? card.dataset.gate : null;
        if (gate) {
            const conditionals = document.querySelectorAll(`[data-depends="${gate}"]`);
            conditionals.forEach(c => {
                if (btn.dataset.value === c.dataset.show) {
                    c.style.display = 'flex';
                    c.style.animation = 'fadeIn .3s ease';
                } else {
                    c.style.display = 'none';
                    // Reset conditional inputs
                    c.querySelectorAll('input, select').forEach(inp => {
                        if (inp.type === 'checkbox') inp.checked = false;
                        else inp.value = '';
                    });
                    c.classList.remove('answered');
                }
            });
        }
        
        updateProgress();
    });
});

// ===== CHECKBOXES =====
document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const card = cb.closest('.q-card');
        if (card) {
            const anyChecked = card.querySelector('.check-item input:checked');
            card.classList.toggle('answered', !!anyChecked);
        }
        updateProgress();
    });
});

// ===== FORM INPUTS (Corporate Info) =====
document.querySelectorAll('.form-input, .form-select').forEach(inp => {
    const handler = () => updateProgress();
    inp.addEventListener('input', handler);
    inp.addEventListener('change', handler);
});

// ===== INDICATOR ACTION BUTTONS =====
document.querySelectorAll('.act-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const row = btn.closest('.indicator-row');
        const isComplete = btn.classList.contains('complete');
        const isSkip = btn.classList.contains('skip');
        
        // Toggle off if already active
        if (isComplete && btn.classList.contains('active-complete')) {
            btn.classList.remove('active-complete');
            row.classList.remove('completed');
            updateProgress();
            return;
        }
        if (isSkip && btn.classList.contains('active-skip')) {
            btn.classList.remove('active-skip');
            row.classList.remove('skipped');
            updateProgress();
            return;
        }
        
        // Reset both buttons
        row.querySelectorAll('.act-btn').forEach(b => {
            b.classList.remove('active-complete', 'active-skip');
        });
        row.classList.remove('completed', 'skipped');
        
        if (isComplete) {
            btn.classList.add('active-complete');
            row.classList.add('completed');
        } else if (isSkip) {
            btn.classList.add('active-skip');
            row.classList.add('skipped');
        }
        
        updateProgress();
    });
});

// ===== PROGRESS TRACKING =====
function updateProgress() {
    let totalItems = 0;
    let completedItems = 0;
    let skippedItems = 0;
    
    // Count corporate info fields (slide 0)
    const corpFields = document.querySelectorAll('.form-card[data-field="corp"]');
    corpFields.forEach(card => {
        totalItems++;
        const inp = card.querySelector('.form-input, .form-select');
        if (inp && inp.value && inp.value.trim() !== '') completedItems++;
    });
    
    // Count pre-screening questions (slide 1) — only visible ones
    const preCards = document.querySelectorAll('.q-card[data-field="pre"]');
    preCards.forEach(card => {
        if (card.style.display === 'none') return;
        totalItems++;
        if (card.classList.contains('answered')) completedItems++;
    });
    
    // Count category indicators (slides 2-6)
    const catRows = document.querySelectorAll('.indicator-row[data-field="cat"]');
    catRows.forEach(row => {
        totalItems++;
        if (row.classList.contains('completed')) completedItems++;
        else if (row.classList.contains('skipped')) skippedItems++;
    });
    
    // Update status card
    document.querySelector('.status-completed').textContent = completedItems;
    document.querySelector('.status-total').textContent = '/' + totalItems;
    
    const pctCompleted = totalItems > 0 ? (completedItems / totalItems * 100) : 0;
    const pctSkipped = totalItems > 0 ? (skippedItems / totalItems * 100) : 0;
    const pctNotStarted = 100 - pctCompleted - pctSkipped;
    
    document.querySelector('.status-bar-completed').style.width = pctCompleted + '%';
    document.querySelector('.status-bar-skipped').style.width = pctSkipped + '%';
    document.querySelector('.status-bar-notstarted').style.width = pctNotStarted + '%';
    
    // Update per-slide metrics and pill counts
    updateSlideMetrics();
}

function updateSlideMetrics() {
    // Slide 0: Corporate Info
    const corpCards = document.querySelectorAll('.form-card[data-field="corp"]');
    let corpDone = 0;
    corpCards.forEach(card => {
        const inp = card.querySelector('.form-input, .form-select');
        if (inp && inp.value && inp.value.trim() !== '') corpDone++;
    });
    updateMetricDisplay(0, corpDone, corpCards.length);
    
    // Slide 1: Pre-Screening
    const preCards = document.querySelectorAll('.q-card[data-field="pre"]');
    let preTotal = 0, preDone = 0;
    preCards.forEach(card => {
        if (card.style.display === 'none') return;
        preTotal++;
        if (card.classList.contains('answered')) preDone++;
    });
    updateMetricDisplay(1, preDone, preTotal);
    
    // Slides 2-6: Categories
    for (let s = 2; s <= 6; s++) {
        const slide = document.querySelector(`[data-slide="${s}"]`);
        if (!slide) continue;
        const rows = slide.querySelectorAll('.indicator-row[data-field="cat"]');
        let done = 0;
        rows.forEach(r => {
            if (r.classList.contains('completed') || r.classList.contains('skipped')) done++;
        });
        updateMetricDisplay(s, done, rows.length);
    }
}

function updateMetricDisplay(slideIndex, done, total) {
    // Update section metric
    const slide = document.querySelector(`[data-slide="${slideIndex}"]`);
    if (slide) {
        const num = slide.querySelector('.metric-num');
        const den = slide.querySelector('.metric-den');
        if (num) num.textContent = done;
        if (den) den.textContent = '/' + total;
    }
    
    // Update pill count
    const pill = document.querySelector(`.pill[data-section="${slideIndex}"]`);
    if (pill) {
        const count = pill.querySelector('.pill-count');
        if (count) count.textContent = done + '/' + total;
    }
}

// ===== FADE IN ANIMATION =====
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(style);

// ===== INIT =====
updateProgress();
