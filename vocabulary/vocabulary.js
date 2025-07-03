// Vocabulary Tracker Logic
const STORAGE_KEY = 'ielts_vocab_list';
let vocabList = [];
const form = document.getElementById('vocabForm');
const wordInput = document.getElementById('word');
const meaningInput = document.getElementById('meaning');
const exampleInput = document.getElementById('example');
const tableBody = document.querySelector('#vocabTable tbody');
const searchInput = document.getElementById('search');
const progressBar = document.getElementById('progress-bar');

function loadVocab() {
  const data = localStorage.getItem(STORAGE_KEY);
  vocabList = data ? JSON.parse(data) : [];
}
function saveVocab() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabList));
  updateProgress();
}
function updateProgress() {
  progressBar.textContent = `${vocabList.length} word${vocabList.length!==1?'s':''} saved`;
}
function renderTable(filter = '') {
  tableBody.innerHTML = '';
  let filtered = vocabList;
  if (filter) {
    filtered = vocabList.filter(v => v.word.toLowerCase().includes(filter.toLowerCase()));
  }
  filtered.forEach((vocab, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="word">${vocab.word}</span></td>
      <td><span class="meaning">${vocab.meaning}</span></td>
      <td><span class="example">${vocab.example}</span></td>
      <td><button class="edit">Edit</button></td>
      <td><button class="delete">Delete</button></td>
    `;
    // Edit
    tr.querySelector('.edit').onclick = () => {
      if (tr.classList.contains('editing')) return;
      tr.classList.add('editing');
      tr.innerHTML = `
        <td><input value="${vocab.word}" class="edit-word"></td>
        <td><input value="${vocab.meaning}" class="edit-meaning"></td>
        <td><input value="${vocab.example}" class="edit-example"></td>
        <td><button class="save">Save</button></td>
        <td><button class="cancel">Cancel</button></td>
      `;
      tr.querySelector('.save').onclick = () => {
        const newWord = tr.querySelector('.edit-word').value.trim();
        const newMeaning = tr.querySelector('.edit-meaning').value.trim();
        const newExample = tr.querySelector('.edit-example').value.trim();
        if (!newWord || !newMeaning || !newExample) {
          alert('All fields are required.');
          return;
        }
        vocabList[idx] = { word: newWord, meaning: newMeaning, example: newExample };
        saveVocab();
        renderTable(searchInput.value);
      };
      tr.querySelector('.cancel').onclick = () => renderTable(searchInput.value);
    };
    // Delete
    tr.querySelector('.delete').onclick = () => {
      if (confirm('Delete this word?')) {
        vocabList.splice(idx, 1);
        saveVocab();
        renderTable(searchInput.value);
      }
    };
    tableBody.appendChild(tr);
  });
  updateProgress();
}
form.onsubmit = e => {
  e.preventDefault();
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  if (!word || !meaning || !example) {
    alert('All fields are required.');
    return;
  }
  vocabList.push({ word, meaning, example });
  saveVocab();
  renderTable(searchInput.value);
  form.reset();
};
searchInput.oninput = () => renderTable(searchInput.value);
// Export JSON
const exportJsonBtn = document.getElementById('export-json');
exportJsonBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(vocabList, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocabulary.json';
  a.click();
  URL.revokeObjectURL(url);
};
// Export CSV
const exportCsvBtn = document.getElementById('export-csv');
exportCsvBtn.onclick = () => {
  let csv = 'Word,Meaning,Example\n';
  vocabList.forEach(v => {
    csv += `"${v.word.replace(/"/g,'""')}","${v.meaning.replace(/"/g,'""')}","${v.example.replace(/"/g,'""')}"\n`;
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocabulary.csv';
  a.click();
  URL.revokeObjectURL(url);
};
// Import JSON
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-json');
importBtn.onclick = () => importInput.click();
importInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      imported.forEach(item => {
        if (!item.word || !item.meaning || !item.example) throw new Error('Missing fields');
      });
      vocabList = imported;
      saveVocab();
      renderTable(searchInput.value);
      alert('Import successful!');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
};
// --- Dark Mode Toggle ---
const darkBtn = document.getElementById('toggle-dark');
function setDarkMode(on) {
  if (on) {
    document.body.classList.add('dark');
    localStorage.setItem('vocab_dark', '1');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('vocab_dark', '0');
  }
}
darkBtn.onclick = () => setDarkMode(!document.body.classList.contains('dark'));
if (localStorage.getItem('vocab_dark') === '1') setDarkMode(true);

// --- Flashcard/Quiz Mode ---
const toggleModeBtn = document.getElementById('toggle-mode');
const flashcardContainer = document.getElementById('flashcard-container');
let flashcardIdx = 0;
let flashcardShowAnswer = false;
function showFlashcard(idx) {
  if (!vocabList.length) {
    flashcardContainer.innerHTML = '<div style="padding:2rem;">No words yet.</div>';
    return;
  }
  const v = vocabList[idx];
  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <div class="flashcard-front" style="${flashcardShowAnswer?'display:none;':''}">
        <div class="flashcard-word">${v.word}</div>
        <button id="show-answer">Show Answer</button>
      </div>
      <div class="flashcard-back" style="${flashcardShowAnswer?'':'display:none;'}">
        <div><b>Meaning:</b> ${v.meaning}</div>
        <div><b>Example:</b> ${v.example}</div>
        <button id="hide-answer">Hide</button>
      </div>
      <div class="flashcard-controls">
        <button id="prev-card">Previous</button>
        <span>${idx+1} / ${vocabList.length}</span>
        <button id="next-card">Next</button>
      </div>
    </div>
  `;
  document.getElementById('show-answer').onclick = () => { flashcardShowAnswer = true; showFlashcard(flashcardIdx); };
  document.getElementById('hide-answer').onclick = () => { flashcardShowAnswer = false; showFlashcard(flashcardIdx); };
  document.getElementById('prev-card').onclick = () => { flashcardIdx = (flashcardIdx-1+vocabList.length)%vocabList.length; flashcardShowAnswer=false; showFlashcard(flashcardIdx); };
  document.getElementById('next-card').onclick = () => { flashcardIdx = (flashcardIdx+1)%vocabList.length; flashcardShowAnswer=false; showFlashcard(flashcardIdx); };
}
let inFlashcardMode = false;
function setMode(flashcard) {
  inFlashcardMode = flashcard;
  document.querySelector('.vocab-table').style.display = flashcard ? 'none' : '';
  document.querySelector('.search-bar').style.display = flashcard ? 'none' : '';
  document.getElementById('vocabForm').parentElement.style.display = flashcard ? 'none' : '';
  flashcardContainer.style.display = flashcard ? '' : 'none';
  toggleModeBtn.textContent = flashcard ? 'Switch to Table Mode' : 'Switch to Flashcard Mode';
  if (flashcard) {
    flashcardIdx = 0;
    flashcardShowAnswer = false;
    showFlashcard(flashcardIdx);
  }
}
toggleModeBtn.onclick = () => setMode(!inFlashcardMode);

// Initial load
loadVocab();
renderTable();
updateProgress(); 