// ===== Data Structures =====
class Node {
  constructor(song, artist, duration){
    this.song = song;
    this.artist = artist;
    this.duration = duration;
    this.next = null;
  }
}
let head = null;
let current = null;

// ===== Utility UI =====
const el = id => document.getElementById(id);
function step(msg, type='ok'){
  const d = document.createElement('div');
  d.className = 'step ' + (type||'');
  d.textContent = msg;
  el('steps').prepend(d);
}
function render(){
  const wrap = el('list');
  wrap.innerHTML = '';
  let t = head;
  while(t){
    const n = document.createElement('div');
    n.className = 'node' + (t===current?' playing':'');
    n.innerHTML = `<div class="title"><b>${t.song}</b></div>
                   <div class="meta">${t.artist || 'Unknown'} — ${t.duration || '00:00'}</div>`;
    wrap.appendChild(n);
    if(t.next){
      const a = document.createElement('div');
      a.className = 'arrow';
      a.textContent = '➜';
      wrap.appendChild(a);
    }
    t = t.next;
  }
  if(!head){
    const empty = document.createElement('div');
    empty.className = 'step warn';
    empty.textContent = 'Playlist empty — add a song to begin.';
    wrap.appendChild(empty);
  }
  // stats
  el('statCount').textContent = count();
  el('statNow').textContent = current? current.song : '-';
}

function showSyntaxByKey(key){
  el('syntaxCode').textContent = SYNTAX[key] || '// No code loaded';
  el('syntaxSelect').value = key;
}

// ===== Operations =====
function addSong(){
  const s = el('song').value.trim();
  const a = el('artist').value.trim();
  const d = el('duration').value.trim();
  if(!s || !a || !d){ step('Please fill Song, Artist, Duration', 'warn'); return; }
  const node = new Node(s,a,d);
  if(!head){ head = node; current = node; }
  else{
    let t=head; while(t.next) t=t.next; t.next = node;
  }
  step(`Added: ${s}`);
  showSyntaxByKey('add');
  render();
}

function insertAfter(){
  const target = prompt('Insert AFTER which song (exact name)?');
  if(!target) return;
  const ns = prompt('New song name?'); if(!ns) return;
  const na = prompt('Artist?')||'';
  const nd = prompt('Duration (mm:ss)?')||'';
  let t=head;
  while(t && t.song!==target) t=t.next;
  if(!t){ step(`Target "${target}" not found`, 'warn'); render(); return; }
  const node = new Node(ns,na,nd);
  node.next = t.next;
  t.next = node;
  step(`Inserted "${ns}" after "${target}"`);
  showSyntaxByKey('insertAfter');
  render();
}

function insertBefore(){
  const target = prompt('Insert BEFORE which song (exact name)?');
  if(!target) return;
  const ns = prompt('New song name?'); if(!ns) return;
  const na = prompt('Artist?')||'';
  const nd = prompt('Duration (mm:ss)?')||'';
  if(!head){ step('Playlist empty', 'warn'); return; }
  if(head.song===target){
    const node = new Node(ns,na,nd);
    node.next = head; head = node;
    step(`Inserted "${ns}" before "${target}"`);
    showSyntaxByKey('insertBefore');
    render(); return;
  }
  let prev=null, t=head;
  while(t && t.song!==target){ prev=t; t=t.next; }
  if(!t){ step(`Target "${target}" not found`, 'warn'); render(); return; }
  const node = new Node(ns,na,nd);
  node.next = t; prev.next = node;
  step(`Inserted "${ns}" before "${target}"`);
  showSyntaxByKey('insertBefore');
  render();
}

function deleteSong(){
  const target = prompt('Delete which song (exact name)?');
  if(!target) return;
  if(!head){ step('Playlist empty', 'warn'); return; }
  if(head.song===target){
    if(current===head) current = head.next;
    head = head.next;
    step(`Deleted "${target}"`);
    showSyntaxByKey('delete');
    render(); return;
  }
  let prev=null, t=head;
  while(t && t.song!==target){ prev=t; t=t.next; }
  if(!t){ step(`Song "${target}" not found`, 'warn'); render(); return; }
  if(current===t) current = t.next;
  prev.next = t.next;
  step(`Deleted "${target}"`);
  showSyntaxByKey('delete');
  render();
}

function showPlaylist(){
  let t=head, arr=[];
  while(t){ arr.push(t.song); t=t.next; }
  step('Playlist: ' + (arr.join(' → ')||'(empty)'));
  showSyntaxByKey('show');
  render();
}

function playNext(){
  if(!head){ step('Playlist empty', 'warn'); return; }
  current = current? current.next : head;
  step(current? `Now playing: ${current.song}` : 'Reached end of playlist.');
  showSyntaxByKey('next');
  render();
}

function resetPlaylist(){
  head=null; current=null;
  el('steps').innerHTML='';
  step('Playlist reset.');
  showSyntaxByKey('reset');
  render();
}

function count(){
  let c=0,t=head; while(t){ c++; t=t.next; } return c;
}

// ===== Syntax Dictionary =====
const SYNTAX = {
  add:
`function addSong(song, artist, duration) {
  const node = new Node(song, artist, duration);
  if (!head) {
    head = node;            // first node
    current = node;         // start here
  } else {
    let t = head;
    while (t.next) t = t.next;
    t.next = node;          // append
  }
}`,
  insertAfter:
`function insertAfter(targetSong, newSong, artist, duration) {
  let t = head;
  while (t && t.song !== targetSong) t = t.next;
  if (t) {
    const node = new Node(newSong, artist, duration);
    node.next = t.next;
    t.next = node;          // link new after target
  }
}`,
  insertBefore:
`function insertBefore(targetSong, newSong, artist, duration) {
  if (!head) return;
  if (head.song === targetSong) {
    const node = new Node(newSong, artist, duration);
    node.next = head; head = node;
    return;
  }
  let prev = null, t = head;
  while (t && t.song !== targetSong) { prev = t; t = t.next; }
  if (t) {
    const node = new Node(newSong, artist, duration);
    node.next = t; prev.next = node; // link before target
  }
}`,
  delete:
`function deleteSong(song) {
  if (!head) return;
  if (head.song === song) { head = head.next; return; }
  let prev = null, t = head;
  while (t && t.song !== song) { prev = t; t = t.next; }
  if (t) prev.next = t.next; // unlink
}`,
  show:
`function showPlaylist() {
  let t = head, arr = [];
  while (t) { arr.push(t.song); t = t.next; }
  console.log(arr.join(' → ') || '(empty)');
}`,
  next:
`function playNext() {
  if (!head) return;
  current = current ? current.next : head;
  if (current) console.log('Now playing:', current.song);
}`,
  reset:
`function resetPlaylist() { head = null; current = null; }`
};

// ===== Wire up UI =====
window.addEventListener('DOMContentLoaded', () => {
  el('btnAdd').addEventListener('click', addSong);
  el('btnInsAfter').addEventListener('click', insertAfter);
  el('btnInsBefore').addEventListener('click', insertBefore);
  el('btnDelete').addEventListener('click', deleteSong);
  el('btnNext').addEventListener('click', playNext);
  el('btnShow').addEventListener('click', showPlaylist);
  el('btnReset').addEventListener('click', resetPlaylist);

  el('syntaxSelect').addEventListener('change', e => {
    const key = e.target.value;
    showSyntaxByKey(key);
  });

  render(); // initial
});
