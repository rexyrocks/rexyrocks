const $ = id => document.getElementById(id);
const ids = Object.keys(projects);
const categories = {risk:'Machine learning',pyro:'Climate × ML',miku:'Desktop app',notes:'Full stack'};
const aliases = {risk:'risk',risksight:'risk',pyro:'pyro',pyrograph:'pyro',miku:'miku',electron:'miku',fieldnotes:'notes',notes:'notes'};
const speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let current = 'risk', priorFocus, section = 0, playing = false, speechToken = 0;
let filter = '', query = '', savedOnly = false, favorites = new Set(), historyIndex = 0;
const commands = [];
try { favorites = new Set(JSON.parse(localStorage.getItem('project-radio-saved') || '[]').filter(id => ids.includes(id))); } catch {}
const safe = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scrollTo = el => el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
function notify(text) { $('notice').textContent = text; }
function parts() { const p=projects[current]; return [p.description,p.problem,p.approach,p.outcome]; }
const chapterNames = ['Overview','The problem','The approach','The result'];
function stopNarration() { speechToken++; if(speechAvailable) speechSynthesis.cancel(); playing=false; updatePlayer(); }
function updatePlayer() {
  $('tour-play').textContent=playing?'Ⅱ Pause':'▶ Listen';
  $('tour-play').setAttribute('aria-label',playing?'Pause project narration':'Listen to project narration');
  $('tour-play').setAttribute('aria-pressed',String(playing));
  $('chapter').value=section;
  $('chapter').setAttribute('aria-valuetext',chapterNames[section]);
  $('chapter-label').textContent=chapterNames[section]+' · '+(section+1)+'/4';
  $('player-status').textContent=playing?'Narrating · '+chapterNames[section]:'Project '+projects[current].number+' / '+String(ids.length).padStart(2,'0');
  document.querySelectorAll('.story-card').forEach((el,i)=>el.classList.toggle('narrating',playing&&section===i+1));
}
function narrate() {
  if(!speechAvailable) { notify('Narration is unavailable in this browser. Read the project story below.'); scrollTo($('project-detail')); return; }
  stopNarration(); playing=true; const token=speechToken;
  const utterance=new SpeechSynthesisUtterance(parts()[section]);
  utterance.lang='en-US'; utterance.rate=1;
  utterance.onend=()=>{if(token!==speechToken)return;if(section<3){section++;narrate();}else{playing=false;section=0;updatePlayer();notify('Project narration complete. Explore another track.');}};
  utterance.onerror=e=>{if(token!==speechToken)return;playing=false;updatePlayer();if(e.error!=='canceled'&&e.error!=='interrupted')notify('Your browser could not play narration. The full transcript is in the project story.');};
  speechSynthesis.speak(utterance); updatePlayer();
}
function filterTracks() {
  let count=0;
  document.querySelectorAll('.track').forEach(el=>{const id=el.dataset.project,p=projects[id];const match=(!filter||p.tags.includes(filter))&&(!savedOnly||favorites.has(id))&&[p.short,p.description,categories[id],...p.tags].join(' ').toLowerCase().includes(query.toLowerCase());el.hidden=!match;if(match)count++;});
  $('result-count').textContent=count+' of '+ids.length+' projects';
  $('empty-state').hidden=count!==0;
  $('clear-filters').hidden=!filter&&!query&&!savedOnly;
  $('saved-filter').setAttribute('aria-pressed',String(savedOnly));
  document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(filter===el.dataset.filter)));
}
function allProjects() {filter='';query='';savedOnly=false;$('project-search').value='';filterTracks();document.querySelectorAll('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav==='all'));scrollTo($('library'));}
function selectProject(id,{url=true,listen=false}={}) {
  if(!projects[id])return;
  stopNarration();current=id;section=0;const p=projects[id];
  document.querySelectorAll('.track').forEach(el=>{const on=el.dataset.project===id;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));});
  document.querySelectorAll('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===id));
  $('project-detail').innerHTML='<div><div class="eyebrow">Selected track · '+p.number+' / '+String(ids.length).padStart(2,'0')+'</div><h3>'+safe(p.title)+'</h3><p>'+safe(p.description)+'</p><div class="chips">'+p.tags.map(t=>'<button class="chip" data-tag="'+safe(t)+'" title="Filter projects by '+safe(t)+'">'+safe(t)+'</button>').join('')+'</div></div><div class="detail-links"><a class="detail-link primary" href="'+p.code+'" target="_blank" rel="noopener noreferrer">View code ↗</a>'+(p.demo?'<a class="detail-link" href="'+p.demo+'" target="_blank" rel="noopener noreferrer">'+p.demoLabel+'</a>':'')+'<button class="detail-link" id="save-project" aria-pressed="'+favorites.has(id)+'">'+(favorites.has(id)?'♥ Saved':'♡ Save project')+'</button><button class="detail-link" id="share-project">Copy project link</button></div>';
  $('story-grid').innerHTML=[['The problem',p.problem],['The approach',p.approach],['The result',p.outcome]].map(([name,text],i)=>'<article class="story-card"><h4>'+name+'</h4><p>'+safe(text)+'</p><button class="chapter-listen" data-chapter="'+(i+1)+'">Listen to '+name.toLowerCase()+'</button></article>').join('');
  $('player-title').textContent=p.short;
  $('player-cover').className='cover '+p.coverClass;$('player-cover').textContent=p.cover;
  $('hero-art').className='hero-art '+p.coverClass;$('hero-mark').textContent=p.cover;
  $('hero-volume').textContent='VOL. '+p.number;
  $('hero-eyebrow').textContent='FEATURED TRACK · '+p.number+' / '+String(ids.length).padStart(2,'0');
  $('hero-title').textContent=p.short;$('hero-description').textContent=p.description;
  $('hero-category').textContent=categories[id].toUpperCase();$('hero-code').href=p.code;
  $('hero-format').textContent=p.demo?'CODE + LIVE DEMO':'EXPLORE THE SOURCE';
  if(url){const u=new URL(location.href);u.searchParams.set('project',id);window.history.pushState({project:id},'',u);}
  updatePlayer();if(listen)narrate();
}
function step(direction){selectProject(ids[(ids.indexOf(current)+direction+ids.length)%ids.length],{listen:playing});}
async function shareProject(){const url=new URL(location.href);url.searchParams.set('project',current);url.hash='';try{await navigator.clipboard.writeText(url.href);notify('Project link copied.');}catch{notify('Copy the project link below.');$('share-fallback').hidden=false;$('share-url').value=url.href;$('share-url').focus();$('share-url').select();}}
document.querySelectorAll('.track').forEach(el=>{
  const id=el.dataset.project;
  const play=el.querySelector('.track-play');
  play.textContent='▶';
  play.setAttribute('aria-label','Play '+projects[id].short+' story');
  play.setAttribute('role','button');
  play.addEventListener('click',event=>{event.stopPropagation();selectProject(id,{listen:true});});
  el.addEventListener('click',()=>selectProject(id));
});
document.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.nav==='all')allProjects();else{selectProject(el.dataset.nav);scrollTo($('project-detail'));}}));
document.querySelector('.brand').addEventListener('click',()=>{allProjects();selectProject('risk');});
$('project-search').addEventListener('input',e=>{query=e.target.value;filterTracks();});
$('saved-filter').addEventListener('click',()=>{savedOnly=!savedOnly;filterTracks();});
$('clear-filters').addEventListener('click',allProjects);
document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>{filter=filter===el.dataset.filter?'':el.dataset.filter;filterTracks();}));
$('project-detail').addEventListener('click',e=>{
  const tag=e.target.closest('[data-tag]');if(tag){filter=tag.dataset.tag;filterTracks();scrollTo($('library'));notify('Filtered by '+filter);}
  if(e.target.id==='save-project'){if(favorites.has(current))favorites.delete(current);else favorites.add(current);try{localStorage.setItem('project-radio-saved',JSON.stringify([...favorites]));}catch{notify('Saved for this visit. Browser storage is unavailable.');}e.target.textContent=favorites.has(current)?'♥ Saved':'♡ Save project';e.target.setAttribute('aria-pressed',String(favorites.has(current)));filterTracks();}
  if(e.target.id==='share-project')shareProject();
});
$('story-grid').addEventListener('click',e=>{const button=e.target.closest('[data-chapter]');if(button){section=Number(button.dataset.chapter);narrate();}});
$('tour-play').addEventListener('click',()=>{if(playing){stopNarration();notify('Paused. Listen resumes from the start of this chapter.');}else narrate();});
$('previous-project').addEventListener('click',()=>step(-1));$('next-project').addEventListener('click',()=>step(1));
$('chapter').addEventListener('input',e=>{const resume=playing;stopNarration();section=Number(e.target.value);updatePlayer();if(resume)narrate();});
$('player-track-button').addEventListener('click',()=>scrollTo($('project-detail')));
window.addEventListener('popstate',()=>selectProject(new URLSearchParams(location.search).get('project')||'risk',{url:false}));
window.addEventListener('pagehide',stopNarration);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stopNarration();});
const backdrop=$('terminal-backdrop'),input=$('terminal-input'),output=$('terminal-output');
function openTerminal(){priorFocus=document.activeElement;backdrop.classList.add('open');document.querySelector('.app').inert=true;input.focus();}
function closeTerminal(){backdrop.classList.remove('open');document.querySelector('.app').inert=false;priorFocus?.focus();}
$('terminal-trigger').addEventListener('click',openTerminal);$('nav-terminal').addEventListener('click',openTerminal);$('terminal-close').addEventListener('click',closeTerminal);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeTerminal();});
backdrop.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const first=$('terminal-close');if(e.shiftKey&&document.activeElement===first){e.preventDefault();input.focus();}else if(!e.shiftKey&&document.activeElement===input){e.preventDefault();first.focus();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('open'))closeTerminal();if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(document.activeElement.tagName)||document.activeElement.isContentEditable||e.metaKey||e.ctrlKey||e.altKey)return;if(e.key==='`'||e.key==='~'){e.preventDefault();openTerminal();}else if(e.key==='/'){e.preventDefault();$('project-search').focus();}});
function line(text){const div=document.createElement('div');div.className='terminal-line';div.textContent=text;output.appendChild(div);output.scrollTop=output.scrollHeight;}
function linkLine(text,url){const div=document.createElement('div');div.className='terminal-line';const a=document.createElement('a');a.textContent=text+' ↗';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.style.textDecoration='underline';div.appendChild(a);output.appendChild(div);output.scrollTop=output.scrollHeight;}
input.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.max(0,Math.min(commands.length,historyIndex+(e.key==='ArrowUp'?-1:1)));input.value=commands[historyIndex]||'';}});
$('terminal-form').addEventListener('submit',e=>{e.preventDefault();const raw=input.value.trim();input.value='';if(!raw)return;commands.push(raw);historyIndex=commands.length;line('❯ '+raw);const [cmd,...args]=raw.toLowerCase().split(/\s+/),arg=args.join(' '),id=aliases[arg];
  if(cmd==='help')line('help · ls · about · open <project> · code [project] · demo [project] · search <term> · play · pause · next · prev · github · linkedin · arcade · clear · exit\nProjects: risk, pyrograph, miku, fieldnotes. ↑ / ↓ recall commands.');
  else if(cmd==='clear')output.replaceChildren();
  else if(cmd==='ls')line(ids.map(id=>projects[id].number+'  '+projects[id].short).join('\n'));
  else if(cmd==='about')line(document.querySelector('#about p').textContent);
  else if(cmd==='open'){if(id){selectProject(id);line('Selected '+projects[id].short+'. Type play to hear its story, or exit to explore.');}else line('Choose risk, pyrograph, miku, or fieldnotes.');}
  else if(cmd==='code'||cmd==='demo'){const p=arg?projects[id]:projects[current];if(!p)line('Unknown project. Type ls.');else if(cmd==='code')linkLine(p.short+' source',p.code);else if(p.demo)linkLine(p.short+' demo',p.demo);else line('No public hosted demo for this project. Use code to explore its repository.');}
  else if(cmd==='search'){query=arg;filter='';savedOnly=false;$('project-search').value=arg;filterTracks();line($('result-count').textContent+' match. Type exit to view the library.');}
  else if(cmd==='play'){narrate();line(speechAvailable?'Narrating '+projects[current].short:'Narration unavailable in this browser.');}
  else if(cmd==='pause'){stopNarration();line('Narration paused.');}
  else if(cmd==='next'||cmd==='prev'){step(cmd==='next'?1:-1);line('Selected '+projects[current].short);}
  else if(cmd==='github')linkLine('GitHub profile','https://github.com/rexyrocks');
  else if(cmd==='linkedin')linkLine('LinkedIn profile','https://www.linkedin.com/in/kunal-choudhary-664a373b8/');
  else if(cmd==='arcade')location.assign('/arcade.html');
  else if(cmd==='exit')closeTerminal();
  else line('Command not found. Type help.');
});
const requested=new URLSearchParams(location.search).get('project');selectProject(projects[requested]?requested:'risk',{url:false});filterTracks();
if(!speechAvailable){$('tour-play').disabled=true;document.querySelectorAll('.chapter-listen').forEach(el=>el.disabled=true);notify('Narration is unavailable in this browser; all project stories are readable below.');}
