// These cue points follow the pauses in the published Kokoro recordings.
const narrationMeta = {
  risk: {duration:27.475, chapters:[
    {time:0,title:'Overview',text:'RiskSight. A credit risk model built from first principles.'},
    {time:4.99,title:'The problem',text:'Loan defaults are rare, so accuracy alone can hide whether a model catches the cases that matter.'},
    {time:10.66,title:'The approach',text:'Logistic regression, gradient descent, regularization, and class weighting with NumPy, compared against scikit-learn.'},
    {time:18.45,title:'The result',text:'Held-out evaluation, threshold analysis tied to a simple profit model, and a FastAPI web interface for exploring predictions.'}
  ]},
  pyro: {duration:25.675, chapters:[
    {time:0,title:'Overview',text:'Pyrograph. A Jaipur heatwave early warning pipeline.'},
    {time:4.94,title:'The problem',text:'A daily alert needs a local baseline, recent context, and a clear definition of severe heat.'},
    {time:10.79,title:'The approach',text:'Calendar-based climatology labels, lag features, Random Forest, and XGBoost tested on later years.'},
    {time:18.37,title:'The result',text:'Saved feature contracts and evaluation metrics, plus a five-day outlook with a persistence check for alerts.'}
  ]},
  miku: {duration:23.675, chapters:[
    {time:0,title:'Overview',text:'Miku Desktop Companion. An interactive macOS companion built with Electron and a Live2D character.'},
    {time:7.18,title:'How it works',text:'The project combines character interactions, a menu-bar controller, local memory, and optional voice chat.'},
    {time:13.86,title:'Privacy',text:'Screen and project observation are opt-in.'},
    {time:16.95,title:'Repository',text:'The public repository includes the Electron app, observer helpers, privacy controls, and development tests.'}
  ]},
  notes: {duration:25, chapters:[
    {time:0,title:'Overview',text:'Fieldnotes. A shared research log for findings, phases, and responsibilities.'},
    {time:5.53,title:'The problem',text:'Research decisions and implementation notes are easy to lose across chats and personal files.'},
    {time:12.01,title:'The approach',text:'A React frontend with an Express and SQLite API, organized around research phases.'},
    {time:18.92,title:'The result',text:'Working routes for reading and adding findings, with a deployment path for persistent storage.'}
  ]}
};

const demoTemplates = {
  risk: `<div class="experience-header"><div><span class="experience-kicker">Try the idea · 01</span><h3>Explore a sample risk decision</h3><p>Move the inputs to see why a decision threshold matters.</p></div><span class="experience-note">Illustrative calculation; not a prediction from the trained RiskSight model.</span></div>
    <div class="demo-grid"><div class="demo-controls">
      <label><span>Annual income <output id="risk-income-value"></output></span><input id="risk-income" type="range" min="20000" max="180000" step="5000" value="70000"></label>
      <label><span>Existing monthly debt <output id="risk-debt-value"></output></span><input id="risk-debt" type="range" min="0" max="5000" step="100" value="1400"></label>
      <label><span>Requested loan <output id="risk-loan-value"></output></span><input id="risk-loan" type="range" min="1000" max="80000" step="1000" value="25000"></label>
      <label><span>Review threshold <output id="risk-threshold-value"></output></span><input id="risk-threshold" type="range" min="15" max="70" step="5" value="40"></label>
    </div><div class="demo-result" aria-live="polite"><h4>Illustrative risk index</h4><strong id="risk-score"></strong><div class="demo-meter"><span id="risk-meter"></span></div><p id="risk-decision"></p></div></div>
    <a class="demo-link" href="https://frontend-rose-eight-31.vercel.app" target="_blank" rel="noopener noreferrer">Try the actual RiskSight interface ↗</a>`,
  pyro: `<div class="experience-header"><div><span class="experience-kicker">Try the idea · 02</span><h3>Build a five-day heat outlook</h3><p>Adjust conditions and see how a persistent heat alert differs from a single hot day.</p></div><span class="experience-note">Illustrative weather values and alert rule; the real Pyrograph app uses its own model and data.</span></div>
    <div class="demo-grid"><div class="demo-controls"><label><span>Base daytime high <output id="pyro-temp-value"></output></span><input id="pyro-temp" type="range" min="34" max="47" step="1" value="39"></label><label><span>Humidity <output id="pyro-humidity-value"></output></span><input id="pyro-humidity" type="range" min="10" max="75" step="5" value="30"></label></div><div class="demo-result" aria-live="polite"><h4>Sample alert</h4><strong id="pyro-alert"></strong><p id="pyro-explanation"></p></div></div><div class="forecast" id="pyro-forecast" aria-label="Sample five-day forecast"></div><a class="demo-link" href="https://heatshield-jaipur.vercel.app" target="_blank" rel="noopener noreferrer">Open the real Pyrograph app ↗</a>`,
  miku: `<div class="experience-header"><div><span class="experience-kicker">Try the idea · 03</span><h3>Meet the desktop companion</h3><p>Try a tiny browser preview of the interaction and privacy controls.</p></div><span class="experience-note">Concept preview; the actual Live2D companion runs on macOS.</span></div>
    <div class="demo-grid"><div><div class="companion" id="companion" data-mood="idle" role="img" aria-label="Smiling companion preview"><div class="companion-face" aria-hidden="true">✦‿✦</div><p id="companion-message">Ready when you are.</p></div><div class="demo-buttons" style="margin-top:13px"><button type="button" data-miku-action="wave">Say hello</button><button type="button" data-miku-action="think">Ask for a nudge</button></div></div><div class="demo-result"><h4>Privacy state</h4><p>Optional features start off. These switches only update this preview.</p><div class="privacy-list"><label><input id="miku-voice" type="checkbox"> Voice chat preview</label><label><input id="miku-observe" type="checkbox"> Screen observation preview</label></div><p id="miku-privacy" aria-live="polite">Voice and observation are off.</p></div></div><a class="demo-link" href="https://github.com/rexyrocks/Electron" target="_blank" rel="noopener noreferrer">Explore the Electron app ↗</a>`,
  notes: `<div class="experience-header"><div><span class="experience-kicker">Try the idea · 04</span><h3>Browse a sample research log</h3><p>See how a team could keep its questions, phases, and responsibilities together.</p></div><span class="experience-note">Sample entries for the portfolio; no connection to the live research database.</span></div><div class="demo-tabs" role="tablist" aria-label="Research log views"><button type="button" role="tab" data-note-tab="findings" aria-selected="true">Findings</button><button type="button" role="tab" data-note-tab="phases" aria-selected="false">Phases</button><button type="button" role="tab" data-note-tab="roles" aria-selected="false">Roles</button></div><div class="note-card" id="note-card" role="tabpanel" aria-live="polite"></div><a class="demo-link" href="https://github.com/rexyrocks/the-log" target="_blank" rel="noopener noreferrer">Explore the Fieldnotes source ↗</a>`
};

const noteViews = {
  findings: ['Finding · heatwave definition','Question: should an alert depend on temperature alone, or on a local seasonal baseline and recent conditions?'],
  phases: ['Phase · evaluate and refine','Define labels → build lag features → evaluate on later years → review warning behavior.'],
  roles: ['Roles · shared ownership','Research, model evaluation, interface, and deployment tasks stay visible to the team.']
};

function renderExperience(id) {
  const root = document.getElementById('experience');
  root.innerHTML = demoTemplates[id];
  if (id === 'risk') updateRisk();
  if (id === 'pyro') updatePyro();
  if (id === 'notes') updateNotes('findings');
}

function updateRisk() {
  const income=Number(document.getElementById('risk-income').value),debt=Number(document.getElementById('risk-debt').value),loan=Number(document.getElementById('risk-loan').value),threshold=Number(document.getElementById('risk-threshold').value);
  const ratio=debt*12/income;
  const score=Math.round(Math.max(5,Math.min(92,8+ratio*68+(loan/income)*25)));
  const money=value=>'$'+value.toLocaleString('en-US');
  document.getElementById('risk-income-value').textContent=money(income);
  document.getElementById('risk-debt-value').textContent=money(debt);
  document.getElementById('risk-loan-value').textContent=money(loan);
  document.getElementById('risk-threshold-value').textContent=threshold+'/100';
  document.getElementById('risk-score').textContent=score+'/100';
  document.getElementById('risk-meter').style.setProperty('--meter',score+'%');
  document.getElementById('risk-decision').textContent=score>=threshold?'Above the chosen threshold: flag for review.':'Below the chosen threshold: no review flag.';
}

function updatePyro() {
  const base=Number(document.getElementById('pyro-temp').value),humidity=Number(document.getElementById('pyro-humidity').value);
  document.getElementById('pyro-temp-value').textContent=base+'°C';
  document.getElementById('pyro-humidity-value').textContent=humidity+'%';
  const offsets=[0,2,3,1,-1],days=offsets.map(offset=>base+offset),hot=days.map(temp=>temp>=42||temp>=40&&humidity>=50);
  const persistent=hot.some((value,index)=>value&&hot[index+1]);
  document.getElementById('pyro-forecast').innerHTML=days.map((temp,index)=>`<div class="forecast-day ${hot[index]?'alert':''}"><span>Day ${index+1}</span><strong>${temp}°</strong><span>${hot[index]?'Hot day':'Normal'}</span></div>`).join('');
  document.getElementById('pyro-alert').textContent=persistent?'Heat alert':'Watch conditions';
  document.getElementById('pyro-explanation').textContent=persistent?'At least two consecutive days meet this preview’s heat rule.':'No consecutive pair meets this preview’s heat rule.';
}

function updateNotes(tab) {
  const [heading,body]=noteViews[tab];
  document.querySelectorAll('[data-note-tab]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.noteTab===tab)));
  document.getElementById('note-card').innerHTML='<h4>'+heading+'</h4><p>'+body+'</p>';
}

document.getElementById('experience').addEventListener('input',event=>{
  if(event.target.id.startsWith('risk-'))updateRisk();
  if(event.target.id.startsWith('pyro-'))updatePyro();
  if(event.target.id==='miku-voice'||event.target.id==='miku-observe'){
    const voice=document.getElementById('miku-voice').checked,observe=document.getElementById('miku-observe').checked;
    document.getElementById('miku-privacy').textContent='Voice '+(voice?'on':'off')+' · observation '+(observe?'on':'off')+'. Preview only.';
  }
});
document.getElementById('experience').addEventListener('click',event=>{
  const action=event.target.closest('[data-miku-action]');
  if(action){
    const mood=action.dataset.mikuAction;
    document.getElementById('companion').dataset.mood=mood;
    document.getElementById('companion-message').textContent=mood==='wave'?'Hey! Glad you stopped by.':'Try one small step, then check what changed.';
  }
  const tab=event.target.closest('[data-note-tab]');
  if(tab)updateNotes(tab.dataset.noteTab);
});
