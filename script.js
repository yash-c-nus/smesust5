(function(){

// ============ STATE ============
var psAnswers = {};
var curTF = 0;
var curCat = 0;
var CATS = [
  {name:'Carbon & Climate',color:'#16a34a'},
  {name:'Energy & Resource',color:'#f59e0b'},
  {name:'Env. Stewardship',color:'#0ea5e9'},
  {name:'Social & Workforce',color:'#a855f7'},
  {name:'Governance',color:'#64748b'}
];

// ============ YEAR PICKER ============
var yp = document.getElementById('corpYear');
if(yp){for(var y=2025;y>=1950;y--){var o=document.createElement('option');o.value=y;o.textContent=y;yp.appendChild(o);}}

// ============ TYPEFORM SLIDES ============
var allTFSlides = ['q17','q17a','q18','q19','q19a','q19b','q110','q113'];
var activeTF = [];

function buildActiveTF(){
  activeTF = [];
  allTFSlides.forEach(function(s){
    var el = document.querySelector('[data-ps="'+s+'"]');
    if(!el) return;
    if(s === 'q17a'){
      if(psAnswers.q17 === 'Yes') activeTF.push(s);
    } else if(s === 'q19a' || s === 'q19b'){
      if(psAnswers.q19 === 'Yes') activeTF.push(s);
    } else {
      activeTF.push(s);
    }
  });
}

function showTFSlide(idx){
  if(idx < 0) idx = 0;
  if(idx >= activeTF.length){
    finishPrescreen();
    return;
  }
  curTF = idx;
  document.querySelectorAll('.tf-slide').forEach(function(s){s.classList.remove('active');s.style.display='none';});
  var name = activeTF[idx];
  var el = document.querySelector('[data-ps="'+name+'"]');
  if(el){el.style.display='block';setTimeout(function(){el.classList.add('active');},10);}
  // progress bar
  var pct = activeTF.length > 0 ? ((idx) / activeTF.length * 100) : 0;
  document.getElementById('tfBar').style.width = pct+'%';
  // dots
  var dotsEl = document.getElementById('tfDots');
  dotsEl.innerHTML = '';
  activeTF.forEach(function(s,i){
    var d = document.createElement('div');
    d.className = 'tf-dot';
    if(i === idx) d.className += ' act';
    else if(i < idx) d.className += ' done';
    dotsEl.appendChild(d);
  });
}

// ============ CORP INFO -> PRESCREEN ============
document.getElementById('btnToPrescreen').addEventListener('click',function(){
  document.getElementById('phaseCorpInfo').style.display = 'none';
  document.getElementById('phasePrescreen').style.display = 'flex';
  buildActiveTF();
  showTFSlide(0);
});

// ============ TYPEFORM BACK ============
document.getElementById('tfBack').addEventListener('click',function(){
  if(curTF === 0){
    document.getElementById('phasePrescreen').style.display = 'none';
    document.getElementById('phaseCorpInfo').style.display = 'flex';
  } else {
    showTFSlide(curTF - 1);
  }
});

// ============ YES/NO BUTTONS ============
document.querySelectorAll('.tf-options.yn').forEach(function(g){
  g.querySelectorAll('.tf-opt').forEach(function(btn){
    btn.addEventListener('click',function(){
      g.querySelectorAll('.tf-opt').forEach(function(b){b.classList.remove('sel');});
      btn.classList.add('sel');
      var psId = g.id.replace('ps-','');
      psAnswers[psId] = btn.getAttribute('data-v');
      // Rebuild active slides (conditionals may change)
      buildActiveTF();
      // Auto-advance after short delay
      setTimeout(function(){
        showTFSlide(curTF + 1);
      }, 300);
    });
  });
});

// ============ TRI BUTTONS (q113) ============
document.querySelectorAll('.tf-options.tri').forEach(function(g){
  g.querySelectorAll('.tf-opt').forEach(function(btn){
    btn.addEventListener('click',function(){
      g.querySelectorAll('.tf-opt').forEach(function(b){b.classList.remove('sel');});
      btn.classList.add('sel');
      var psId = g.id.replace('ps-','');
      psAnswers[psId] = btn.getAttribute('data-v');
      setTimeout(function(){
        showTFSlide(curTF + 1);
      }, 300);
    });
  });
});

// ============ MULTI-SELECT CONTINUE BUTTONS ============
document.querySelectorAll('.tf-next').forEach(function(btn){
  btn.addEventListener('click',function(){
    var slide = btn.closest('.tf-slide');
    var psId = slide.getAttribute('data-ps');
    var checks = slide.querySelectorAll('.tf-check input:checked');
    var vals = [];
    checks.forEach(function(c){vals.push(c.value);});
    psAnswers[psId] = vals;
    buildActiveTF();
    showTFSlide(curTF + 1);
  });
});

// ============ FINISH PRESCREEN -> ASSESSMENT ============
function finishPrescreen(){
  document.getElementById('phasePrescreen').style.display = 'none';
  document.getElementById('phaseAssess').style.display = 'block';
  document.getElementById('pillsBar').style.display = 'block';
  buildPills();
  applyGating();
  applyAutoComplete();
  applyPrepop();
  updateProgress();
  goToCat(0);
}

// ============ BUILD PILLS ============
function buildPills(){
  var wrap = document.getElementById('pillsWrap');
  wrap.innerHTML = '';
  CATS.forEach(function(c,i){
    var p = document.createElement('div');
    p.className = 'pill' + (i === 0 ? ' active' : '');
    p.id = 'pill-'+i;
    p.innerHTML = '<span class="pill-dot" style="background:'+c.color+'"></span>'+c.name+'<span class="pill-cnt" id="pc-'+i+'">0/0</span>';
    if(i === 0){p.style.background=c.color;p.style.color='#fff';p.style.borderColor='transparent';}
    p.addEventListener('click',function(){goToCat(i);});
    wrap.appendChild(p);
  });
}

// ============ NAVIGATE CATEGORIES ============
function goToCat(i){
  curCat = i;
  document.getElementById('assessTrack').style.transform = 'translateX(-'+(i*100)+'%)';
  CATS.forEach(function(c,j){
    var p = document.getElementById('pill-'+j);
    if(!p) return;
    if(j===i){p.className='pill active';p.style.background=c.color;p.style.color='#fff';p.style.borderColor='transparent';}
    else{p.className='pill';p.style.background='#fff';p.style.color='#64748b';p.style.borderColor='#e2e8f0';}
  });
  updateProgress();
}

// Assessment nav buttons
document.querySelectorAll('[data-go]').forEach(function(btn){
  btn.addEventListener('click',function(){
    goToCat(parseInt(btn.getAttribute('data-go')));
  });
});

// ============ GATING ============
function applyGating(){
  var fac = psAnswers.q17;
  var veh = psAnswers.q19;
  var mach = psAnswers.q110;
  var carbon = psAnswers.q113;

  document.querySelectorAll('.qrow[data-gate]').forEach(function(row){
    var g = row.getAttribute('data-gate');
    var show = true;
    if(g === 'facilities' && fac === 'No') show = false;
    if(g === 'vehicles' && veh === 'No') show = false;
    if(g === 'machinery' && mach === 'No') show = false;
    if(g === 'carbon-no' && carbon !== 'No') show = false;

    if(!show){
      row.classList.add('gated');
      row.classList.remove('done','skip','auto-done');
    } else {
      row.classList.remove('gated');
    }
  });
}

// ============ AUTO-COMPLETE ============
function applyAutoComplete(){
  var carbon = psAnswers.q113;
  if(carbon === 'Yes, formally'){
    var r1 = document.querySelector('[data-q="q2.1"]');
    var r2 = document.querySelector('[data-q="q2.2"]');
    if(r1 && !r1.classList.contains('gated')){r1.classList.add('auto-done');r1.classList.remove('skip');}
    if(r2 && !r2.classList.contains('gated')){r2.classList.add('auto-done');r2.classList.remove('skip');}
  }
}

// ============ PRE-POPULATE ============
function applyPrepop(){
  document.querySelectorAll('.qpre').forEach(function(el){el.innerHTML='';});

  function badge(qid, txt){
    var el = document.getElementById('pp-'+qid);
    if(el && txt) el.innerHTML += '<span class="ppill">📋 '+txt+'</span>';
  }

  var facTypes = psAnswers.q17a || [];
  var energy = psAnswers.q18 || [];
  var vehFuel = psAnswers.q19a || [];
  var vehCnt = psAnswers.q19b;
  var carbon = psAnswers.q113;

  if(facTypes.length > 0){
    var ft = facTypes.join(', ');
    badge('q2.4','Facilities: '+ft);
    badge('q2.17','Facilities: '+ft);
  }
  if(energy.length > 0){
    var es = energy.join(', ');
    badge('q2.7','Energy: '+es);
    badge('q2.10','Energy: '+es);
    if(energy.indexOf('Solar') !== -1){
      badge('q2.11','⚡ Solar flagged');
      badge('q2.12','⚡ Solar flagged');
    }
  }
  if(vehCnt) badge('q2.8','Vehicles: '+vehCnt);
  if(vehFuel.length > 0) badge('q2.9','Fuel: '+vehFuel.join(', '));
  if(carbon){
    badge('q2.1','Tracking: '+carbon);
    badge('q2.2','Tracking: '+carbon);
    if(carbon === 'No') badge('q2.3','⚠️ Not tracking');
  }
}

// ============ MARK ROWS ============
document.querySelectorAll('.qa').forEach(function(btn){
  btn.addEventListener('click',function(){
    var row = btn.closest('.qrow');
    if(row.classList.contains('auto-done')) return;
    var action = btn.getAttribute('data-a');
    if(action === 'r'){row.classList.remove('done','skip');}
    else if(action === 'c'){row.classList.remove('skip');row.classList.add('done');}
    else if(action === 's'){row.classList.remove('done');row.classList.add('skip');}
    updateProgress();
  });
});

// ============ FINISH ============
document.getElementById('btnFinish').addEventListener('click',function(){
  alert('Assessment complete! Thank you for your submission.');
});

// ============ PROGRESS ============
function updateProgress(){
  var slides = document.querySelectorAll('.a-slide');
  var totalAll = 0, doneAll = 0, skipAll = 0;

  slides.forEach(function(slide, i){
    var rows = slide.querySelectorAll('.qrow');
    var t = 0, d = 0, s = 0;
    rows.forEach(function(r){
      if(r.classList.contains('gated')) return;
      t++;
      if(r.classList.contains('done') || r.classList.contains('auto-done')) d++;
      if(r.classList.contains('skip')) s++;
    });
    totalAll += t;
    doneAll += d;
    skipAll += s;

    // Update category metric
    var acEl = document.getElementById('ac'+i);
    var atEl = document.getElementById('at'+i);
    if(acEl) acEl.textContent = d;
    if(atEl) atEl.textContent = '/'+t;

    // Update pill count
    var pcEl = document.getElementById('pc-'+i);
    if(pcEl) pcEl.textContent = d+'/'+t;
  });

  // Status
  document.getElementById('statusCur').textContent = doneAll;
  document.getElementById('statusTot').textContent = '/'+totalAll;

  var pctD = totalAll > 0 ? (doneAll/totalAll*100) : 0;
  var pctS = totalAll > 0 ? (skipAll/totalAll*100) : 0;
  document.getElementById('barDone').style.width = pctD+'%';
  document.getElementById('barSkip').style.width = pctS+'%';

  // Time remaining
  var remaining = totalAll - doneAll - skipAll;
  var mins = Math.ceil(remaining * 0.5);
  var timeEl = document.getElementById('timeLeft');
  if(remaining <= 0) timeEl.textContent = 'Done!';
  else if(mins <= 1) timeEl.textContent = '~1 min';
  else timeEl.textContent = '~'+mins+' min';
}

})();
