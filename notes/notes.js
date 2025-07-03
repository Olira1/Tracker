const NOTES_KEY = 'vocab_notes_multi';
const select = document.getElementById('note-select');
const textarea = document.getElementById('notes');
const saveBtn = document.getElementById('save-notes');
const savedMsg = document.getElementById('saved-msg');
const newBtn = document.getElementById('new-note');
const deleteBtn = document.getElementById('delete-note');
const exportBtn = document.getElementById('export-notes');
const preview = document.getElementById('notes-preview');

// Formatting buttons
const h1Btn = document.getElementById('h1-btn');
const h2Btn = document.getElementById('h2-btn');
const fontIncBtn = document.getElementById('font-inc');
const fontDecBtn = document.getElementById('font-dec');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
let fontSize = 1.1;

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
function setCurrentIdx(idx) {
  currentIdx = idx;
  localStorage.setItem('vocab_notes_current_idx', currentIdx);
}
select.onchange = function() {
  setCurrentIdx(+select.value);
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
  setCurrentIdx(notes.length-1);
  saveNotes();
  renderSelect();
  renderNote();
};
deleteBtn.onclick = function() {
  if (notes.length === 1) { alert('At least one note required.'); return; }
  if (!confirm('Delete this note?')) return;
  notes.splice(currentIdx, 1);
  setCurrentIdx(Math.max(0, currentIdx-1));
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

function insertAtCursor(text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
  notes[currentIdx].content = textarea.value;
}
h1Btn.onclick = function() { insertAtCursor('\n# '); };
h2Btn.onclick = function() { insertAtCursor('\n## '); };
fontIncBtn.onclick = function() { fontSize = Math.min(fontSize + 0.1, 2.5); textarea.style.fontSize = fontSize + 'rem'; };
fontDecBtn.onclick = function() { fontSize = Math.max(fontSize - 0.1, 0.7); textarea.style.fontSize = fontSize + 'rem'; };
emojiBtn.onclick = function(e) {
  // Position picker below the button
  const rect = emojiBtn.getBoundingClientRect();
  emojiPicker.style.display = 'block';
  emojiPicker.style.left = rect.left + 'px';
  emojiPicker.style.top = (rect.bottom + window.scrollY + 8) + 'px';
};
emojiPicker.addEventListener('emoji-click', event => {
  insertAtCursor(event.detail.unicode);
  emojiPicker.style.display = 'none';
});
// Hide picker on outside click
document.addEventListener('mousedown', function(e) {
  if (emojiPicker.style.display === 'block' && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.style.display = 'none';
  }
});

// Initial load
loadNotes();
renderSelect();
renderNote(); 