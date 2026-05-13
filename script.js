document.addEventListener('DOMContentLoaded', function() {

const SECTIONS = [
  {id:'corp', name:'Corp. Info', color:'#6366f1', icon:'📋'},
  {id:'pre', name:'Pre-Screening', color:'#8b5cf6', icon:'🔍'},
  {id:'cat1', name:'Carbon & Climate', color:'#16a34a', icon:'🌿'},
  {id:'cat2', name:'Energy & Resource', color:'#f59e0b', icon:'⚡'},
  {id:'cat3', name:'Env. Stewardship', color:'#0ea5e9', icon:'🌍'},
  {id:'cat4', name:'Social & Workforce', color:'#a855f7', icon:'👥'},
  {id:'cat5', name:'Governance', color:'#64748b', icon:'🏛️'}
];

let currentSlide = 0;

// Build pills
const pillsContainer = document.getElementById('pillsContainer');
SECTIONS.forEach((s, i) => {
  const pill = document.createElement('div');
  pill.className = 'pill' + (i === 0 ? ' active' : '');
  pill.dataset.slide = i;
  pill.innerHTML = `<span class="pill-dot" style="background:${s.color}"></span>${s.name}<span class="pill-count" id="pill-count-${i}">0/0</span>`;
  pill.style.cssText = i === 0 ? `background:${s.color};color:#fff;border-color:transparent` : '';
  pill.addEventListener('click', () => goToSlide(i));
  pillsContainer.appendChild(pill);
});

// Year dropdown
const yearSelect = document.getElementById('yearSelect');
if (yearSelect) {
  for (let y = 2025; y >= 1950; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

// Slide navigation
window.goToSlide = function(index) {
  currentSlide = index;
  document.getElementById('slidesTrack').style.transform = `translateX(-${index * 100}%)`;
  document.querySelectorAll('.pill').forEach((p, i) => {
    if (i === index) {
      p.className = 'pill active';
      p.style.background = SECTIONS[i].color;
      p.style.color = '#fff';
      p.style.borderColor = 'transparent';
    } else {
      p.className = 'pill';
      p.style.background = '#fff';
      p.style.color = '#64748b';
      p.style.borderColor = '#e2e8f0';
    }
  });
  applyGating();
  updateProgress();
};

// Pill button clicks (Yes/No)
document.querySelectorAll('.pill-buttons').forEach(group => {
  group.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      group.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      this.closest('.question-card').classList.add('answered');
      handleConditionals();
      applyGating();
      applyPrepopulation();
      updateProgress();
    });
  });
});

// Select/input changes
document.querySelectorAll('.q-select, .q-input').forEach(el => {
  el.addEventListener('change', function() {
    if (this.value) this.closest('.question-card').classList.add('answered');
    else this.closest('.question-card').classList.remove('answered');
    applyPrepopulation();
    updateProgress();
  });
  el.addEventListener('input', function() {
    if (this.value) this.closest('.question-card').classList.add('answered');
    else this.closest('.question-card').classList.remove('answered');
    updateProgress();
  });
});

// Checkbox changes
document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', function() {
    const group = this.closest('.checkbox-group');
    const card = this.closest('.question-card');
    const anyChecked = group.querySelectorAll('input:checked').length > 0;
    if (anyChecked) card.classList.add('answered');
    else card.classList.remove('answered');
    handleConditionals();
    applyGating();
    applyPrepopulation();
    updateProgress();
  });
});

// Conditional show/hide
function handleConditionals() {
  // Facilities -> facility types
  const facVal = getSelectedPill('preFacilities');
  const facTypes = document.getElementById('preFacilityTypes');
  if (facTypes) facTypes.style.display = facVal === 'Yes' ? 'flex' : 'none';

  // Vehicles -> fuel type, count
  const vehVal = getSelectedPill('preVehicles');
  const vehFuel = document.getElementById('preVehicleFuel');
  const vehCount = document.getElementById('preVehicleCount');
  if (vehFuel) vehFuel.style.display = vehVal === 'Yes' ? 'flex' : 'none';
  if (vehCount) vehCount.style.display = vehVal === 'Yes' ? 'flex' : 'none';
}

function getSelectedPill(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const selected = container.querySelector('.pill-btn.selected');
  return selected ? selected.dataset.value : null;
}

function getCheckedValues
