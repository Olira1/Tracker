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
const tagsInput = document.getElementById('tags');
const noteInput = document.getElementById('note');
const learnedInput = document.getElementById('learned');
const learnedBar = document.getElementById('learned-progress-bar');
const learnedLabel = document.getElementById('learned-progress-label');
const synonymsInput = document.getElementById('synonyms');
const antonymsInput = document.getElementById('antonyms');
const translationsInput = document.getElementById('translations');
const sortSelect = document.getElementById('sort-select');
const dailyWordBox = document.getElementById('daily-word-box');

function loadVocab() {
  const data = localStorage.getItem(STORAGE_KEY);
  vocabList = data ? JSON.parse(data) : [];
}
function saveVocab() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabList));
  updateProgress();
  updateLearnedProgress();
}
function updateProgress() {
  progressBar.textContent = `${vocabList.length} word${vocabList.length!==1?'s':''} saved`;
}
function updateLearnedProgress() {
  const learned = vocabList.filter(v => v.learned).length;
  const total = vocabList.length;
  const percent = total ? Math.round((learned/total)*100) : 0;
  learnedBar.style.width = percent + '%';
  learnedLabel.textContent = `${learned} learned / ${total} total (${percent}%)`;
}
function renderTable(filter = '') {
  let filtered = vocabList;
  if (filter) {
    filtered = vocabList.filter(v =>
      v.word.toLowerCase().includes(filter.toLowerCase()) ||
      (v.tags||[]).join(',').toLowerCase().includes(filter.toLowerCase()) ||
      (v.meaning||'').toLowerCase().includes(filter.toLowerCase()) ||
      (v.example||'').toLowerCase().includes(filter.toLowerCase()) ||
      (v.note||'').toLowerCase().includes(filter.toLowerCase()) ||
      (v.synonyms||[]).join(',').toLowerCase().includes(filter.toLowerCase()) ||
      (v.antonyms||[]).join(',').toLowerCase().includes(filter.toLowerCase()) ||
      (v.translationsDisplay||'').toLowerCase().includes(filter.toLowerCase())
    );
  }
  // Sort
  if (sortSelect.value === 'word') {
    filtered = filtered.slice().sort((a, b) => a.word.localeCompare(b.word));
  } else if (sortSelect.value === 'date') {
    // Assume order in vocabList is date added
    filtered = filtered.slice();
  } else if (sortSelect.value === 'learned') {
    filtered = filtered.slice().sort((a, b) => (b.learned?1:0) - (a.learned?1:0));
  }
  tableBody.innerHTML = '';
  filtered.forEach((vocab, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="word">${vocab.word}</span></td>
      <td><button class="audio" title="Play pronunciation">🔊</button></td>
      <td><span class="meaning">${vocab.meaning}</span></td>
      <td><span class="example">${vocab.example}</span></td>
      <td>${(vocab.synonyms||[]).map(s=>`<span class='vocab-synonym'>${s}</span>`).join('')}</td>
      <td>${(vocab.antonyms||[]).map(a=>`<span class='vocab-antonym'>${a}</span>`).join('')}</td>
      <td>${vocab.translationsDisplay||''}</td>
      <td>${(vocab.tags||[]).map(tag=>`<span class='vocab-tag'>${tag}</span>`).join('')}</td>
      <td class="${vocab.learned ? 'learned-yes' : 'learned-no'}">${vocab.learned ? '✔️' : ''}</td>
      <td class="vocab-note">${vocab.note||''}</td>
      <td><button class="edit">Edit</button></td>
      <td><button class="delete">Delete</button></td>
    `;
    // Audio
    tr.querySelector('.audio').onclick = () => {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(vocab.word);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
      } else {
        alert('Audio not supported in this browser.');
      }
    };
    // Edit
    tr.querySelector('.edit').onclick = () => {
      if (tr.classList.contains('editing')) return;
      tr.classList.add('editing');
      tr.innerHTML = `
        <td><input value="${vocab.word}" class="edit-word"></td>
        <td></td>
        <td><input value="${vocab.meaning}" class="edit-meaning"></td>
        <td><input value="${vocab.example}" class="edit-example"></td>
        <td><input value="${(vocab.synonyms||[]).join(', ')}" class="edit-synonyms"></td>
        <td><input value="${(vocab.antonyms||[]).join(', ')}" class="edit-antonyms"></td>
        <td><input value="${vocab.translationsRaw||''}" class="edit-translations"></td>
        <td><input value="${(vocab.tags||[]).join(', ')}" class="edit-tags"></td>
        <td><input type="checkbox" class="edit-learned" ${vocab.learned?'checked':''}></td>
        <td><input value="${vocab.note||''}" class="edit-note"></td>
        <td><button class="save">Save</button></td>
        <td><button class="cancel">Cancel</button></td>
      `;
      tr.querySelector('.save').onclick = () => {
        const newWord = tr.querySelector('.edit-word').value.trim();
        const newMeaning = tr.querySelector('.edit-meaning').value.trim();
        const newExample = tr.querySelector('.edit-example').value.trim();
        const newSynonyms = tr.querySelector('.edit-synonyms').value.split(',').map(s=>s.trim()).filter(Boolean);
        const newAntonyms = tr.querySelector('.edit-antonyms').value.split(',').map(a=>a.trim()).filter(Boolean);
        const newTranslationsRaw = tr.querySelector('.edit-translations').value.trim();
        const newTranslations = parseTranslations(newTranslationsRaw);
        const newTags = tr.querySelector('.edit-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
        const newLearned = tr.querySelector('.edit-learned').checked;
        const newNote = tr.querySelector('.edit-note').value.trim();
        if (!newWord || !newMeaning || !newExample) {
          alert('Word, meaning, and example are required.');
          return;
        }
        vocabList[idx] = { word: newWord, meaning: newMeaning, example: newExample, synonyms: newSynonyms, antonyms: newAntonyms, translations: newTranslations, translationsRaw: newTranslationsRaw, translationsDisplay: translationsToDisplay(newTranslations), tags: newTags, learned: newLearned, note: newNote };
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
  updateLearnedProgress();
}
function parseTranslations(raw) {
  // e.g. fr:mot, es:palabra
  const obj = {};
  raw.split(',').forEach(pair => {
    const [lang, ...rest] = pair.split(':');
    if (lang && rest.length) obj[lang.trim()] = rest.join(':').trim();
  });
  return obj;
}
function translationsToDisplay(obj) {
  if (!obj) return '';
  return Object.entries(obj).map(([lang, val]) => `<span class='vocab-translation'>${lang}: ${val}</span>`).join('');
}
form.onsubmit = e => {
  e.preventDefault();
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  const synonyms = synonymsInput.value.split(',').map(s=>s.trim()).filter(Boolean);
  const antonyms = antonymsInput.value.split(',').map(a=>a.trim()).filter(Boolean);
  const translationsRaw = translationsInput.value.trim();
  const translations = parseTranslations(translationsRaw);
  const tags = tagsInput.value.split(',').map(t=>t.trim()).filter(Boolean);
  const note = noteInput.value.trim();
  const learned = learnedInput.checked;
  if (!word || !meaning || !example) {
    alert('Word, meaning, and example are required.');
    return;
  }
  vocabList.push({ word, meaning, example, synonyms, antonyms, translations, translationsRaw, translationsDisplay: translationsToDisplay(translations), tags, learned, note });
  saveVocab();
  renderTable(searchInput.value);
  form.reset();
};
searchInput.oninput = () => { renderTable(searchInput.value); showDailyWord(); showAnalytics(); };
sortSelect.onchange = () => { renderTable(searchInput.value); showDailyWord(); showAnalytics(); };
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
// SheetJS and QRCode CDN
const sheetjsScript = document.createElement('script');
sheetjsScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
document.head.appendChild(sheetjsScript);
const qrScript = document.createElement('script');
qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js';
document.head.appendChild(qrScript);
// --- Flashcard Random/Quiz Mode ---
const randomBtn = document.getElementById('flashcard-random');
const quizBtn = document.getElementById('flashcard-quiz');
let flashcardOrder = [];
let quizMode = false;
randomBtn.onclick = () => {
  if (!vocabList.length) return;
  flashcardOrder = Array.from({length: vocabList.length}, (_,i)=>i);
  for (let i = flashcardOrder.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [flashcardOrder[i], flashcardOrder[j]] = [flashcardOrder[j], flashcardOrder[i]];
  }
  setMode(true);
};
quizBtn.onclick = () => {
  quizMode = true;
  setMode(true);
};
function showFlashcard(idx) {
  if (!vocabList.length) {
    flashcardContainer.innerHTML = '<div style="padding:2rem;">No words yet.</div>';
    return;
  }
  let v, realIdx;
  if (flashcardOrder.length) {
    realIdx = flashcardOrder[idx];
    v = vocabList[realIdx];
  } else {
    realIdx = idx;
    v = vocabList[idx];
  }
  if (quizMode) {
    flashcardContainer.innerHTML = `
      <div class="flashcard">
        <div class="flashcard-word">${v.word}</div>
        <input id="quiz-answer" placeholder="Type the meaning..." style="width:90%;margin:1rem 0;">
        <button id="check-quiz">Check</button>
        <div id="quiz-feedback"></div>
        <div class="flashcard-controls">
          <button id="prev-card">Previous</button>
          <span>${idx+1} / ${vocabList.length}</span>
          <button id="next-card">Next</button>
        </div>
      </div>
    `;
    document.getElementById('check-quiz').onclick = () => {
      const ans = document.getElementById('quiz-answer').value.trim().toLowerCase();
      const correct = v.meaning.trim().toLowerCase();
      document.getElementById('quiz-feedback').textContent = ans === correct ? '✅ Correct!' : `❌ Correct: ${v.meaning}`;
    };
  } else {
    flashcardContainer.innerHTML = `
      <div class="flashcard">
        <div class="flashcard-front" style="${flashcardShowAnswer?'display:none;':''}">
          <div class="flashcard-word">${v.word} <button class="audio" title="Play pronunciation">🔊</button></div>
          <button id="show-answer">Show Answer</button>
        </div>
        <div class="flashcard-back" style="${flashcardShowAnswer?'':'display:none;'}">
          <div><b>Meaning:</b> ${v.meaning}</div>
          <div><b>Example:</b> ${v.example}</div>
          <div><b>Synonyms:</b> ${(v.synonyms||[]).map(s=>`<span class='vocab-synonym'>${s}</span>`).join('')}</div>
          <div><b>Antonyms:</b> ${(v.antonyms||[]).map(a=>`<span class='vocab-antonym'>${a}</span>`).join('')}</div>
          <div><b>Translations:</b> ${v.translationsDisplay||''}</div>
          <div><b>Tags:</b> ${(v.tags||[]).map(tag=>`<span class='vocab-tag'>${tag}</span>`).join('')}</div>
          <div><b>Learned:</b> ${v.learned ? '✔️' : '❌'}</div>
          <div><b>Note:</b> <span class="vocab-note">${v.note||''}</span></div>
          <button id="hide-answer">Hide</button>
        </div>
        <div class="flashcard-controls">
          <button id="prev-card">Previous</button>
          <span>${idx+1} / ${vocabList.length}</span>
          <button id="next-card">Next</button>
        </div>
      </div>
    `;
    flashcardContainer.querySelector('.audio').onclick = () => {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(v.word);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
      } else {
        alert('Audio not supported in this browser.');
      }
    };
    document.getElementById('show-answer').onclick = () => { flashcardShowAnswer = true; showFlashcard(idx); };
    document.getElementById('hide-answer').onclick = () => { flashcardShowAnswer = false; showFlashcard(idx); };
  }
  document.getElementById('prev-card').onclick = () => {
    if (flashcardOrder.length) {
      flashcardIdx = (flashcardIdx-1+flashcardOrder.length)%flashcardOrder.length;
    } else {
      flashcardIdx = (flashcardIdx-1+vocabList.length)%vocabList.length;
    }
    flashcardShowAnswer=false; showFlashcard(flashcardIdx);
  };
  document.getElementById('next-card').onclick = () => {
    if (flashcardOrder.length) {
      flashcardIdx = (flashcardIdx+1)%flashcardOrder.length;
    } else {
      flashcardIdx = (flashcardIdx+1)%vocabList.length;
    }
    flashcardShowAnswer=false; showFlashcard(flashcardIdx);
  };
}
let inFlashcardMode = false;
function setMode(flashcard) {
  inFlashcardMode = flashcard;
  quizMode = false;
  flashcardOrder = [];
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

// --- Daily/Random Word ---
function showDailyWord() {
  if (!vocabList.length) {
    dailyWordBox.innerHTML = '';
    return;
  }
  // Word of the Day: rotate by day of year
  const idx = (new Date().getDate() + new Date().getMonth()*31) % vocabList.length;
  const v = vocabList[idx];
  dailyWordBox.innerHTML = `
    <b>Word of the Day:</b> <span class="word">${v.word}</span> <button class="audio" title="Play pronunciation">🔊</button><br>
    <span><b>Meaning:</b> ${v.meaning}</span><br>
    <span><b>Example:</b> ${v.example}</span><br>
    <span><b>Synonyms:</b> ${(v.synonyms||[]).map(s=>`<span class='vocab-synonym'>${s}</span>`).join('')}</span><br>
    <span><b>Antonyms:</b> ${(v.antonyms||[]).map(a=>`<span class='vocab-antonym'>${a}</span>`).join('')}</span><br>
    <span><b>Translations:</b> ${v.translationsDisplay||''}</span><br>
    <span><b>Note:</b> <span class="vocab-note">${v.note||''}</span></span>
  `;
  dailyWordBox.querySelector('.audio').onclick = () => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(v.word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    } else {
      alert('Audio not supported in this browser.');
    }
  };
}

// --- Import/Export Excel ---
const exportXlsxBtn = document.getElementById('export-xlsx');
const importXlsxBtn = document.getElementById('import-xlsx-btn');
const importXlsxInput = document.getElementById('import-xlsx');
exportXlsxBtn.onclick = () => {
  if (!window.XLSX) return alert('Excel library not loaded yet.');
  const ws = XLSX.utils.json_to_sheet(vocabList.map(v => ({
    Word: v.word,
    Meaning: v.meaning,
    Example: v.example,
    Synonyms: (v.synonyms||[]).join(', '),
    Antonyms: (v.antonyms||[]).join(', '),
    Translations: v.translationsRaw||'',
    Tags: (v.tags||[]).join(', '),
    Learned: v.learned ? 'Yes' : '',
    Note: v.note||''
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vocabulary');
  XLSX.writeFile(wb, 'vocabulary.xlsx');
};
importXlsxBtn.onclick = () => importXlsxInput.click();
importXlsxInput.onchange = e => {
  if (!window.XLSX) return alert('Excel library not loaded yet.');
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    rows.forEach(row => {
      vocabList.push({
        word: row.Word,
        meaning: row.Meaning,
        example: row.Example,
        synonyms: (row.Synonyms||'').split(',').map(s=>s.trim()).filter(Boolean),
        antonyms: (row.Antonyms||'').split(',').map(a=>a.trim()).filter(Boolean),
        translations: parseTranslations(row.Translations||''),
        translationsRaw: row.Translations||'',
        translationsDisplay: translationsToDisplay(parseTranslations(row.Translations||'')),
        tags: (row.Tags||'').split(',').map(t=>t.trim()).filter(Boolean),
        learned: (row.Learned||'').toLowerCase().startsWith('y'),
        note: row.Note||''
      });
    });
    saveVocab();
    renderTable(searchInput.value);
    showDailyWord();
    alert('Import successful!');
  };
  reader.readAsArrayBuffer(file);
};
// --- Backup/Restore ---
const backupBtn = document.getElementById('backup-btn');
const restoreBtn = document.getElementById('restore-btn');
backupBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(vocabList, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocab-backup.json';
  a.click();
  URL.revokeObjectURL(url);
};
restoreBtn.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        vocabList = imported;
        saveVocab();
        renderTable(searchInput.value);
        showDailyWord();
        alert('Restore successful!');
      } catch (err) {
        alert('Restore failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
};
// --- QR Code ---
const qrBtn = document.getElementById('qr-btn');
const qrModal = document.getElementById('qr-modal');
const qrCodeDiv = document.getElementById('qr-code');
const closeQrBtn = document.getElementById('close-qr');
qrBtn.onclick = () => {
  qrModal.style.display = 'flex';
  qrCodeDiv.innerHTML = '';
  if (window.QRCode) {
    new QRCode(qrCodeDiv, {
      text: JSON.stringify(vocabList),
      width: 220,
      height: 220
    });
  } else {
    qrCodeDiv.textContent = 'QR library not loaded yet.';
  }
};
closeQrBtn.onclick = () => { qrModal.style.display = 'none'; };
// --- Analytics ---
const analyticsPanel = document.getElementById('analytics-panel');
function showAnalytics() {
  if (!vocabList.length) { analyticsPanel.innerHTML = ''; return; }
  // Most frequent tags
  const tagCounts = {};
  vocabList.forEach(v => (v.tags||[]).forEach(t => tagCounts[t] = (tagCounts[t]||0)+1));
  const topTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  // Average word length
  const avgLen = (vocabList.reduce((sum,v)=>sum+v.word.length,0)/vocabList.length).toFixed(2);
  // Days active
  let days = 0;
  try {
    const first = JSON.parse(localStorage.getItem('vocab_first_date'));
    if (first) {
      const diff = (Date.now() - new Date(first))/86400000;
      days = Math.max(1, Math.round(diff));
    }
  } catch(e){}
  if (!localStorage.getItem('vocab_first_date') && vocabList.length) {
    localStorage.setItem('vocab_first_date', new Date().toISOString());
    days = 1;
  }
  analyticsPanel.innerHTML = `
    <b>Analytics:</b><br>
    <b>Most Frequent Tags:</b> ${topTags.map(([t,c])=>`<span class='vocab-tag'>${t} (${c})</span>`).join(' ')}<br>
    <b>Average Word Length:</b> ${avgLen}<br>
    <b>Days Active:</b> ${days}<br>
    <b>Total Words:</b> ${vocabList.length}
  `;
}

// Initial load
loadVocab();
renderTable();
updateProgress();
updateLearnedProgress();
showDailyWord();
showAnalytics();
 