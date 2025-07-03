const NOTES_KEY = 'vocab_notes_multi';
const select = document.getElementById('note-select');
const textarea = document.getElementById('notes');
const saveBtn = document.getElementById('save-notes');
const savedMsg = document.getElementById('saved-msg');
const newBtn = document.getElementById('new-note');
const deleteBtn = document.getElementById('delete-note');
const exportBtn = document.getElementById('export-notes');
const preview = document.getElementById('notes-preview');

let notes = [];
let currentIdx = 0;

function loadNotes() {
  const data = localStorage.getItem(NOTES_KEY);
  notes = data ? JSON.parse(data) : [{title: 'Note 1', content: ''}];
  if (!notes.length) notes = [{title: 'Note 1', content: ''}];
}
function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  savedMsg.style.display = 'inline';
  setTimeout(() => savedMsg.style.display = 'none', 1200);
  renderSelect();
}
function renderSelect() {
  select.innerHTML = '';
  notes.forEach((n, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = n.title || `Note ${i+1}`;
    select.appendChild(opt);
  });
  select.value = currentIdx;
}
function renderNote() {
  textarea.value = notes[currentIdx].content;
  renderPreview();
}
function renderPreview() {
  preview.innerHTML = window.marked.parse(textarea.value || '');
}
select.onchange = function() {
  currentIdx = +select.value;
  renderNote();
};
textarea.oninput = function() {
  notes[currentIdx].content = textarea.value;
  renderPreview();
};
saveBtn.onclick = function() {
  notes[currentIdx].content = textarea.value;
  saveNotes();
};
newBtn.onclick = function() {
  const title = prompt('Title for new note?','Note ' + (notes.length+1));
  if (!title) return;
  notes.push({title, content: ''});
  currentIdx = notes.length-1;
  saveNotes();
  renderSelect();
  renderNote();
};
deleteBtn.onclick = function() {
  if (notes.length === 1) { alert('At least one note required.'); return; }
  if (!confirm('Delete this note?')) return;
  notes.splice(currentIdx, 1);
  currentIdx = Math.max(0, currentIdx-1);
  saveNotes();
  renderSelect();
  renderNote();
};
exportBtn.onclick = function() {
  const blob = new Blob([JSON.stringify(notes, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notes.json';
  a.click();
  URL.revokeObjectURL(url);
};
// Initial load
loadNotes();
renderSelect();
renderNote(); 