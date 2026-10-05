const $ = id => document.getElementById(id);
const ids = Object.keys(projects);
const categories = {risk:'Machine learning',pyro:'Climate × ML',miku:'Desktop app',notes:'Full stack'};
const aliases = {risk:'risk',risksight:'risk',pyro:'pyro',pyrograph:'pyro',miku:'miku',electron:'miku',fieldnotes:'notes',notes:'notes'};
const narrationAudio = new Audio();
narrationAudio.preload = 'metadata';
let audioProject = null;
let current = 'risk', priorFocus, section = 0, playing = false;
let waveformPeaks = {};
let filter = '', query = '', savedOnly = false, favorites = new Set(), historyIndex = 0;
const commands = [];
try { favorites = new Set(JSON.parse(localStorage.getItem('project-radio-saved') || '[]').filter(id => ids.includes(id))); } catch {}
const safe = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scrollTo = el => el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
function notify(text) { $('notice').textContent = text; }
const chapterNames = () => narrationMeta[current].chapters.map(chapter => chapter.title);
const formatTime = seconds => Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');
function stopNarration() { narrationAudio.pause(); playing=false; updatePlayer(); }
function renderWaveform() {
  const peaks=waveformPeaks[current]||Array(72).fill(30);
  $('waveform').innerHTML=peaks.map(peak=>'<i style="--height:'+Math.max(12,peak)+'%"></i>').join('');
  updateSeek();
}
function updateSeek() {
  const duration=Number.isFinite(narrationAudio.duration)?narrationAudio.duration:narrationMeta[current].duration;
  const position=audioProject===current?narrationAudio.currentTime:0;
  $('seek').max=duration;
  $('seek').value=Math.min(duration,position);
  $('audio-current').textContent=formatTime(position);
  $('audio-duration').textContent=formatTime(duration);
  const played=Math.floor((position/duration)*$('waveform').children.length);
  [...$('waveform').children].forEach((bar,index)=>bar.classList.toggle('played',index<played));
}
function updateTranscript() {
  document.querySelectorAll('[data-transcript-chapter]').forEach((el,index)=>el.classList.toggle('active',index===section));
}
function renderTranscript() {
  $('transcript').innerHTML='<span class="experience-kicker">Read along</span><h3>'+safe(projects[current].short)+'</h3><div class="transcript-list">'+narrationMeta[current].chapters.map((chapter,index)=>'<button type="button" data-transcript-chapter="'+index+'"><span>'+safe(chapter.title)+' · '+formatTime(chapter.time)+'</span>'+safe(chapter.text)+'</button>').join('')+'</div>';
  updateTranscript();
}
function updatePlayer() {
  $('tour-play').textContent=playing?'Ⅱ Pause':'▶ Listen';
  $('tour-play').setAttribute('aria-label',playing?'Pause project narration':'Listen to project narration');
  $('tour-play').setAttribute('aria-pressed',String(playing));
  $('chapter').value=section;
  $('chapter').setAttribute('aria-valuetext',chapterNames()[section]);
  $('chapter-label').textContent=chapterNames()[section]+' · '+(section+1)+'/4';
  $('player-status').textContent=playing?'Narrating · '+chapterNames()[section]:'Project '+projects[current].number+' / '+String(ids.length).padStart(2,'0');
  document.querySelectorAll('.story-card').forEach(el=>el.classList.toggle('narrating',playing&&section===Number(el.querySelector('[data-chapter]').dataset.chapter)));
  updateTranscript();
  updateSeek();
}
function narrate({fromChapter=false}={}) {
  const source='/audio/'+current+'.wav';
  if(audioProject!==current){narrationAudio.src=source;audioProject=current;fromChapter=true;}
  if(narrationAudio.ended)fromChapter=true;
  if(fromChapter)narrationAudio.currentTime=narrationMeta[current].chapters[section].time;
  narrationAudio.play().then(()=>{playing=true;updatePlayer();}).catch(()=>{playing=false;notify('Audio could not start. Check the connection and try Listen again.');updatePlayer();});
}
narrationAudio.addEventListener('pause',()=>{if(!narrationAudio.ended){playing=false;updatePlayer();}});
narrationAudio.addEventListener('ended',()=>{playing=false;section=0;updatePlayer();notify('Project narration complete. Explore another track.');});
narrationAudio.addEventListener('loadedmetadata',updateSeek);
narrationAudio.addEventListener('error',()=>notify('This recording could not load. Please retry after refreshing the page.'));
narrationAudio.addEventListener('timeupdate',()=>{if(audioProject===current){const cues=narrationMeta[current].chapters;const next=cues.reduce((found,cue,index)=>narrationAudio.currentTime>=cue.time?index:found,0);if(next!==section){section=next;updatePlayer();}else updateSeek();}});
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
  const tryDemo=document.createElement('a');tryDemo.className='detail-link';tryDemo.href='#experience';tryDemo.textContent='Try the mini demo ↓';$('project-detail').querySelector('.detail-links').append(tryDemo);
  const storyCues=id==='miku'?[2,1,3]:[1,2,3];
  $('story-grid').innerHTML=[['The problem',p.problem],['The approach',p.approach],['The result',p.outcome]].map(([name,text],i)=>'<article class="story-card"><h4>'+name+'</h4><p>'+safe(text)+'</p><button class="chapter-listen" data-chapter="'+storyCues[i]+'">Listen to '+safe(narrationMeta[id].chapters[storyCues[i]].title.toLowerCase())+'</button></article>').join('');
  $('player-title').textContent=p.short;
  $('player-cover').className='cover '+p.coverClass;$('player-cover').textContent=p.cover;
  $('hero-art').className='hero-art '+p.coverClass;$('hero-mark').textContent=p.cover;
  $('hero-volume').textContent='VOL. '+p.number;
  $('hero-eyebrow').textContent='FEATURED TRACK · '+p.number+' / '+String(ids.length).padStart(2,'0');
  $('hero-title').textContent=p.short;$('hero-description').textContent=p.description;
  $('hero-category').textContent=categories[id].toUpperCase();$('hero-code').href=p.code;
  $('hero-format').textContent=p.demo?'CODE + LIVE DEMO':'EXPLORE THE SOURCE';
  renderExperience(id);renderTranscript();renderWaveform();
  if(url){const u=new URL(location.href);u.searchParams.set('project',id);window.history.pushState({project:id},'',u);}
  updatePlayer();if(listen)narrate();
}
function step(direction){selectProject(ids[(ids.indexOf(current)+direction+ids.length)%ids.length],{listen:playing});}
async function shareProject(){const url=new URL(location.href);url.searchParams.set('project',current);url.hash='';try{await navigator.clipboard.writeText(url.href);notify('Project link copied.');}catch{notify('Copy the project link below.');$('share-fallback').hidden=false;$('share-url').value=url.href;$('share-url').focus();$('share-url').select();}}
document.querySelectorAll('.track').forEach(el=>{
  const id=el.dataset.project;
  const play=el.querySelector('.track-play');
  play.textContent='↗';
  play.title='Open '+projects[id].short+' project';
  play.addEventListener('click',event=>{event.stopPropagation();window.open(projects[id].demo||projects[id].code,'_blank','noopener,noreferrer');});
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
$('story-grid').addEventListener('click',e=>{const button=e.target.closest('[data-chapter]');if(button){section=Number(button.dataset.chapter);narrate({fromChapter:true});}});
$('tour-play').addEventListener('click',()=>{if(playing){stopNarration();notify('Paused. Listen resumes where you left off.');}else narrate();});
$('previous-project').addEventListener('click',()=>step(-1));$('next-project').addEventListener('click',()=>step(1));
$('chapter').addEventListener('input',e=>{const resume=playing;stopNarration();section=Number(e.target.value);if(audioProject!==current){narrationAudio.src='/audio/'+current+'.wav';audioProject=current;}narrationAudio.currentTime=narrationMeta[current].chapters[section].time;updatePlayer();if(resume)narrate();});
$('seek').addEventListener('input',e=>{if(audioProject!==current){narrationAudio.src='/audio/'+current+'.wav';audioProject=current;}narrationAudio.currentTime=Number(e.target.value);updateSeek();});
$('volume').addEventListener('input',e=>{narrationAudio.volume=Number(e.target.value);});
$('transcript-toggle').addEventListener('click',()=>{const open=$('transcript').hidden;$('transcript').hidden=!open;$('transcript-toggle').setAttribute('aria-expanded',String(open));if(open)scrollTo($('transcript'));});
$('transcript').addEventListener('click',e=>{const button=e.target.closest('[data-transcript-chapter]');if(button){section=Number(button.dataset.transcriptChapter);narrate({fromChapter:true});}});
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
  else if(cmd==='play'){narrate();line('Playing '+projects[current].short+' narration.');}
  else if(cmd==='pause'){stopNarration();line('Narration paused.');}
  else if(cmd==='next'||cmd==='prev'){step(cmd==='next'?1:-1);line('Selected '+projects[current].short);}
  else if(cmd==='github')linkLine('GitHub profile','https://github.com/rexyrocks');
  else if(cmd==='linkedin')linkLine('LinkedIn profile','https://www.linkedin.com/in/kunal-choudhary-664a373b8/');
  else if(cmd==='arcade')location.assign('/arcade.html');
  else if(cmd==='exit')closeTerminal();
  else line('Command not found. Type help.');
});
const requested=new URLSearchParams(location.search).get('project');selectProject(projects[requested]?requested:'risk',{url:false});filterTracks();
document.querySelectorAll('.chapter-listen').forEach(el=>el.disabled=false);
fetch('/waveforms.json').then(response=>response.ok?response.json():{}).then(data=>{waveformPeaks=data;renderWaveform();}).catch(()=>{});
