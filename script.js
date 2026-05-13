// ========== GLOBAL VARIABLES ==========
var SECS = [
  {name:'Corp. Info',color:'#6366f1'},
  {name:'Pre-Screening',color:'#8b5cf6'},
  {name:'Carbon & Climate',color:'#16a34a'},
  {name:'Energy & Resource',color:'#f59e0b'},
  {name:'Env. Stewardship',color:'#0ea5e9'},
  {name:'Social & Workforce',color:'#a855f7'},
  {name:'Governance',color:'#64748b'}
];
var currentSlide = 0;

// ========== NAVIGATION ==========
function goToSlide(idx) {
  currentSlide = idx;
  document.getElementById('track').style.transform = 'translateX(-' + (idx * 100) + '%)';
  // Update pills
  for (var j = 0; j < SECS.length; j++) {
    var p = document.getElementById('pill-' + j);
    if (!p) continue;
    if (j === idx) {
      p.className = 'pl act';
      p.style.background = SECS[j].color;
      p.style.color = '#fff';
      p.style.borderColor = 'transparent';
    } else {
      p.className = 'pl';
      p.style.background = '#fff';
      p.style.color = '#64748b';
      p.style.borderColor = '#e2e8f0';
    }
  }
  doGate();
  doProgress();
  // Scroll slide to top
  var slides = document.querySelectorAll('.slide');
  if (slides[idx]) slides[idx].scrollTop = 0;
}

// ========== MARK ROW ==========
function markRow(btn, action) {
  var row = btn.closest('.qr');
  if (!row) return;
  if (action === 'r') {
    row.classList.remove('done', 'skip');
  } else if (action === 'c') {
    row.classList.remove('skip');
    row.classList.add('done');
  } else if (action === 's') {
    row.classList.remove('done');
    row.classList.add('skip');
  }
  doProgress();
}

// ========== HELPERS ==========
function getYN(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var s = el.querySelector('.sel');
  return s ? s.getAttribute('data-v') : null;
}

function getChecked(id) {
  var el = document.getElementById(id);
  if (!el) return [];
  var r = [];
  var cbs = el.querySelectorAll('input:checked');
  for (var i = 0; i < cbs.length; i++) r.push(cbs[i].value);
  return r;
}

// ========== CONDITIONALS ==========
function doCond() {
  var fac = getYN('preFac');
  var veh = getYN('preVeh');
  var ft = document.getElementById('boxFacType');
  var vf = document.getElementById('boxVehFuel');
  var vc = document.getElementById('boxVehCnt');
  if (ft) ft.style.display = (fac === 'Yes') ? 'flex' : 'none';
  if (vf) vf.style.display = (veh === 'Yes') ? 'flex' : 'none';
  if (vc) vc.style.display = (veh === 'Yes') ? 'flex' : 'none';
}

// ========== GATING ==========
function doGate() {
  var fac = getYN('preFac');
  var veh = getYN('preVeh');
  var mach = getYN('preMach');
  var water = getYN('preWater');
  var waste = getYN('preWaste');
  var board = getYN('preBoard');
  var inc = getChecked('preInc');
  var carbon = getYN('preCarbon');

  var rows = document.querySelectorAll('.qr[data-gate]');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var g = row.getAttribute('data-gate');
    var show = true;

    if (g === 'facilities' && fac === 'No') show = false;
    if (g === 'vehicles' && veh === 'No') show = false;
    if (g === 'machinery' && mach === 'No') show = false;
    if (g === 'water' && water === 'No') show = false;
    if (g === 'waste' && waste === 'No') show = false;
    if (g === 'board' && board === 'No') show = false;
    if (g === 'misconduct' && inc.indexOf('Misconduct or ethics incidents') === -1) show = false;
    if (g === 'cyber' && inc.indexOf('Cybersecurity breaches or data privacy incidents') === -1) show = false;
    if (g === 'carbon') show = true;
    if (g === 'carbon-no') show = (carbon === 'No');

    if (show) {
      row.classList.remove('gated');
    } else {
      row.classList.add('gated');
      row.classList.remove('done', 'skip');
    }
  }
  doProgress();
}

// ========== PREPOPULATION ==========
function doPrepop() {
  var els = document.querySelectorAll('.rp');
  for (var i = 0; i < els.length; i++) els[i].innerHTML = '';

  var emp = document.getElementById('preEmp') ? document.getElementById('preEmp').value : '';
  var facTypes = getChecked('preFacType');
  var energy = getChecked('preEnergy');
  var vehFuel = getChecked('preVehFuel');
  var vehCnt = document.getElementById('preVehCnt') ? document.getElementById('preVehCnt').value : '';
  var carbon = getYN('preCarbon');
  var sust = getChecked('preSust');
  var hs = getYN('preHS');

  function badge(id, t) {
    var el = document.getElementById('pp-' + id);
    if (el && t) el.innerHTML += '<span class="ppb">\u{1F4CB} ' + t + '</span>';
  }

  if (emp) {
    var empQs = ['q3.2','q3.3','q3.4','q3.8','q3.12'];
    for (var j = 0; j < empQs.length; j++) badge(empQs[j], 'Employees: ' + emp);
  }
  if (facTypes.length > 0) {
    var ft = facTypes.join(', ');
    badge('q2.4', 'Facilities: ' + ft);
    badge('q2.17', 'Facilities: ' + ft);
  }
  if (energy.length > 0) {
    var es = energy.join(', ');
    badge('q2.7', 'Energy: ' + es);
    badge('q2.10', 'Energy: ' + es);
    if (energy.indexOf('Solar') !== -1) {
      badge('q2.11', 'Solar flagged');
      badge('q2.12', 'Solar flagged');
    }
  }
  if (vehCnt) badge('q2.8', 'Vehicles: ' + vehCnt);
  if (vehFuel.length > 0) badge('q2.9', 'Fuel: ' + vehFuel.join(', '));
  if (carbon) {
    badge('q2.1', 'Tracking: ' + carbon);
    badge('q2.2', 'Tracking: ' + carbon);
    if (carbon === 'No') badge('q2.3', 'Not tracking — describe challenges');
  }
  if (sust.length > 0 && sust.indexOf('None') === -1) {
    if (sust.indexOf('Dedicated sustainability officer or team') !== -1) badge('q4.4', 'Has personnel');
    if (sust.indexOf('Sustainability strategy') !== -1) badge('q4.5', 'Has strategy');
    if (sust.indexOf('Sustainability report') !== -1) badge('q4.11', 'Has report');
    if (sust.indexOf('ESG rating') !== -1) badge('q4.13', 'Has ESG rating');
  }
  if (hs) badge('q3.9', 'H&S Policy: ' + hs);
}

// ========== PROGRESS ==========
function doProgress() {
  // Slide 0: corp info
  var corpCards = document.querySelectorAll('.slide[data-idx="0"] .q-card');
  var corpAns = 0, corpTot = corpCards.length;
  for (var i = 0; i < corpCards.length; i++) {
    if (corpCards[i].classList.contains('ans')) corpAns++;
  }

  // Slide 1: pre-screening
  var preCards = document.querySelectorAll('.slide[data-idx="1"] .q-card');
  var preAns = 0, preTot = 0;
  for (var i = 0; i < preCards.length; i++) {
    if (preCards[i].style.display !== 'none') {
      preTot++;
      if (preCards[i].classList.contains('ans')) preAns++;
    }
  }

  // Slides 2-6: categories
  var cats = [];
  for (var s = 2; s <= 6; s++) {
    var rows = document.querySelectorAll('.slide[data-idx="' + s + '"] .qr');
    var t = 0, d = 0, sk = 0;
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].classList.contains('gated')) {
        t++;
        if (rows[i].classList.contains('done')) d++;
        if (rows[i].classList.contains('skip')) sk++;
      }
    }
    cats.push({t:t, d:d, s:sk});
  }

  // Update pill counts
  var counts = [corpAns + '/' + corpTot, preAns + '/' + preTot];
  for (var i = 0; i < cats.length; i++) counts.push(cats[i].d + '/' + cats[i].t);
  for (var i = 0; i < counts.length; i++) {
    var el = document.getElementById('pc-' + i);
    if (el) el.textContent = counts[i];
  }

  // Update section metrics
  var mEl0 = document.getElementById('m0'); if (mEl0) mEl0.textContent = corpAns;
  var mEl1 = document.getElementById('m1'); if (mEl1) mEl1.textContent = preAns;
  var mEl1t = document.getElementById('m1t'); if (mEl1t) mEl1t.textContent = '/' + preTot;

  for (var j = 0; j < 5; j++) {
    var mn = document.getElementById('m' + (j + 2)); if (mn) mn.textContent = cats[j].d;
    var mt = document.getElementById('m' + (j + 2) + 't'); if (mt) mt.textContent = '/' + cats[j].t;
  }

  // Overall
  var totalAll = corpTot + preTot;
  var compAll = corpAns + preAns;
  var skipAll = 0;
  for (var i = 0; i < cats.length; i++) {
    totalAll += cats[i].t;
    compAll += cats[i].d;
    skipAll += cats[i].s;
  }

  var sc = document.getElementById('statusCurrent'); if (sc) sc.textContent = compAll;
  var st = document.getElementById('statusTotal'); if (st) st.textContent = '/' + totalAll;

  var pctC = totalAll > 0 ? (compAll / totalAll * 100) : 0;
  var pctS = totalAll > 0 ? (skipAll / totalAll * 100) : 0;
  var bc = document.getElementById('barCompleted'); if (bc) bc.style.width = pctC + '%';
  var bs = document.getElementById('barSkipped'); if (bs) bs.style.width = pctS + '%';
}

// ========== INIT ON DOM READY ==========
document.addEventListener('DOMContentLoaded', function() {

  // Build pills
  var wrap = document.getElementById('pillsWrap');
  for (var i = 0; i < SECS.length; i++) {
    var d = document.createElement('div');
    d.className = 'pl' + (i === 0 ? ' act' : '');
    d.id = 'pill-' + i;
    d.innerHTML = '<span class="pl-d" style="background:' + SECS[i].color + '"></span>' + SECS[i].name + '<span class="pl-c" id="pc-' + i + '">0/0</span>';
    if (i === 0) {
      d.style.background = SECS[i].color;
      d.style.color = '#fff';
      d.style.borderColor = 'transparent';
    }
    (function(idx) {
      d.addEventListener('click', function() { goToSlide(idx); });
    })(i);
    wrap.appendChild(d);
  }

  // Year picker
  var yp = document.getElementById('yearPick');
  if (yp) {
    for (var y = 2025; y >= 1950; y--) {
      var o = document.createElement('option');
      o.value = y; o.textContent = y;
      yp.appendChild(o);
    }
  }

  // Navigation buttons (data-go attribute)
  var navBtns = document.querySelectorAll('[data-go]');
  for (var i = 0; i < navBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        var target = parseInt(btn.getAttribute('data-go'));
        goToSlide(target);
      });
    })(navBtns[i]);
  }

  // Complete button
  var btnComplete = document.getElementById('btnComplete');
  if (btnComplete) {
    btnComplete.addEventListener('click', function() {
      alert('Assessment complete! Thank you.');
    });
  }

  // Yes/No pill buttons
  var yesnoGroups = document.querySelectorAll('.yesno');
  for (var i = 0; i < yesnoGroups.length; i++) {
    var btns = yesnoGroups[i].querySelectorAll('button');
    for (var j = 0; j < btns.length; j++) {
      (function(btn, group) {
        btn.addEventListener('click', function() {
          var siblings = group.querySelectorAll('button');
          for (var k = 0; k < siblings.length; k++) siblings[k].classList.remove('sel');
          btn.classList.add('sel');
          btn.closest('.q-card').classList.add('ans');
          doCond();
          doGate();
          doPrepop();
          doProgress();
        });
      })(btns[j], yesnoGroups[i]);
    }
  }

  // Select and input fields
  var fields = document.querySelectorAll('.qs, .qi');
  for (var i = 0; i < fields.length; i++) {
    (function(el) {
      el.addEventListener('change', function() {
        var c = el.closest('.q-card');
        if (c) {
          if (el.value) c.classList.add('ans'); else c.classList.remove('ans');
        }
        doPrepop();
        doProgress();
      });
      el.addEventListener('input', function() {
        var c = el.closest('.q-card');
        if (c) {
          if (el.value) c.classList.add('ans'); else c.classList.remove('ans');
        }
        doProgress();
      });
    })(fields[i]);
  }

  // Checkboxes
  var checkboxes = document.querySelectorAll('.cg input[type="checkbox"]');
  for (var i = 0; i < checkboxes.length; i++) {
    (function(cb) {
      cb.addEventListener('change', function() {
        var g = cb.closest('.cg');
        var c = cb.closest('.q-card');
        if (g && c) {
          if (g.querySelectorAll('input:checked').length > 0) c.classList.add('ans');
          else c.classList.remove('ans');
        }
        doCond();
        doGate();
        doPrepop();
        doProgress();
      });
    })(checkboxes[i]);
  }

  // Action buttons on question rows (complete/skip/reset)
  var actBtns = document.querySelectorAll('.ab[data-act]');
  for (var i = 0; i < actBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        markRow(btn, btn.getAttribute('data-act'));
      });
    })(actBtns[i]);
  }

  // Initialize
  doCond();
  doProgress();
});
