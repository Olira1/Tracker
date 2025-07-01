document.addEventListener('DOMContentLoaded', function() {
// --- Data Model ---
const TRACKS = {
  python: { name: 'Python 30-Day', days: 30, checklistId: 'python-checklist', progressId: 'python-progress', startId: 'python-start', endId: 'python-end', tips: [
    'Practice daily, even if just 20 minutes.',
    'Try to build a mini-project every week.',
    'Review yesterday\'s code before starting new tasks.'
  ], codeLinks: [
    'https://www.hackerrank.com/domains/tutorials/10-days-of-python',
    'https://leetcode.com/problemset/all/?difficulty=EASY&tags=python'
  ] },
  javascript: { name: 'JavaScript 30-Day', days: 30, checklistId: 'javascript-checklist', progressId: 'javascript-progress', startId: 'javascript-start', endId: 'javascript-end', tips: [
    'Focus on understanding closures and async.',
    'Build a simple game or interactive UI.',
    'Practice DOM manipulation.'
  ], codeLinks: [
    'https://www.frontendmentor.io/challenges',
    'https://www.jschallenger.com/'
  ] },
  react: { name: 'React 30-Day', days: 30, checklistId: 'react-checklist', progressId: 'react-progress', startId: 'react-start', endId: 'react-end', tips: [
    'Understand component lifecycle and hooks.',
    'Build a CRUD app.',
    'Read React docs daily.'
  ], codeLinks: [
    'https://react.dev/learn',
    'https://www.frontendmentor.io/challenges?technologies=react'
  ] },
  'python-oop': { name: 'Python OOP 7-Day', days: 7, checklistId: 'python-oop-checklist', progressId: 'python-oop-progress', startId: 'python-oop-start', endId: 'python-oop-end', tips: [
    'Draw class diagrams before coding.',
    'Practice inheritance and polymorphism.',
    'Refactor code to use OOP principles.'
  ], codeLinks: [
    'https://realpython.com/python3-object-oriented-programming/',
    'https://www.hackerrank.com/domains/tutorials/10-days-of-python'
  ] },
  ielts: { name: 'IELTS 60-Day', days: 60, checklistId: 'ielts', progressId: 'ielts-progress', startId: 'ielts-start', endId: 'ielts-end', tips: [
    'Practice each section daily.',
    'Record yourself for speaking practice.',
    'Read news articles for reading practice.'
  ], sections: ['reading', 'writing', 'listening', 'speaking'] }
};

const MOTIVATION = [
  'Every step counts. Keep going! 🚀',
  'Progress, not perfection.',
  'You are closer to your goal than you think.',
  'Consistency beats intensity.',
  'Celebrate small wins!'
];

// --- Utility Functions ---
function saveProgress(track, data) {
  localStorage.setItem('progress_' + track, JSON.stringify(data));
}
function loadProgress(track, fallback) {
  return JSON.parse(localStorage.getItem('progress_' + track)) || fallback;
}
function saveDates(track, start, end) {
  localStorage.setItem('dates_' + track, JSON.stringify({start, end}));
}
function loadDates(track) {
  return JSON.parse(localStorage.getItem('dates_' + track)) || {start: '', end: ''};
}

// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// --- Tab Navigation ---
const navItems = document.querySelectorAll('nav li');
const sections = document.querySelectorAll('.section');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(item.dataset.section).classList.add('active');
    if (item.dataset.section !== 'dashboard') renderSection(item.dataset.section);
    if (item.dataset.section === 'dashboard') renderDashboard();
  });
});

// --- Checklist Rendering & Logic ---
function renderChecklist(trackKey) {
  const track = TRACKS[trackKey];
  let checklist, checklistElem;
  if (trackKey === 'ielts') {
    track.sections.forEach(section => {
      checklist = loadProgress('ielts-' + section, Array(track.days/track.sections.length).fill('').map((_,i)=>({text:`Day ${i+1} task`, done:false})));
      checklistElem = document.getElementById(`ielts-${section}`);
      checklistElem.innerHTML = '';
      checklist.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = item.done ? 'completed' : '';
        li.innerHTML = `<input type="checkbox" ${item.done?'checked':''}> <span contenteditable="true">${item.text}</span> <button class="edit-task" title="Edit">✏️</button>`;
        li.querySelector('input').addEventListener('change', e => {
          checklist[idx].done = e.target.checked;
          saveProgress('ielts-' + section, checklist);
          renderProgress('ielts');
        });
        li.querySelector('span').addEventListener('blur', e => {
          checklist[idx].text = e.target.textContent;
          saveProgress('ielts-' + section, checklist);
        });
        li.querySelector('.edit-task').addEventListener('click', () => {
          li.querySelector('span').focus();
        });
        checklistElem.appendChild(li);
      });
    });
  } else {
    checklist = loadProgress(trackKey, Array(track.days).fill('').map((_,i)=>({text:`Day ${i+1} task`, done:false})));
    checklistElem = document.getElementById(track.checklistId);
    checklistElem.innerHTML = '';
    checklist.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = item.done ? 'completed' : '';
      li.innerHTML = `<input type="checkbox" ${item.done?'checked':''}> <span contenteditable="true">${item.text}</span> <button class="edit-task" title="Edit">✏️</button>`;
      li.querySelector('input').addEventListener('change', e => {
        checklist[idx].done = e.target.checked;
        saveProgress(trackKey, checklist);
        renderProgress(trackKey);
      });
      li.querySelector('span').addEventListener('blur', e => {
        checklist[idx].text = e.target.textContent;
        saveProgress(trackKey, checklist);
      });
      li.querySelector('.edit-task').addEventListener('click', () => {
        li.querySelector('span').focus();
      });
      checklistElem.appendChild(li);
    });
  }
}

// --- Add Task Logic ---
document.querySelectorAll('.add-task').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    if (section.startsWith('ielts-')) {
      let checklist = loadProgress(section, []);
      checklist.push({text: `New Task`, done: false});
      saveProgress(section, checklist);
      renderChecklist('ielts');
    } else {
      let checklist = loadProgress(section, []);
      checklist.push({text: `New Task`, done: false});
      saveProgress(section, checklist);
      renderChecklist(section);
    }
  });
});

// --- Progress Bar Logic ---
function renderProgress(trackKey) {
  const track = TRACKS[trackKey];
  let total = 0, done = 0;
  if (trackKey === 'ielts') {
    track.sections.forEach(section => {
      const checklist = loadProgress('ielts-' + section, []);
      total += checklist.length;
      done += checklist.filter(i=>i.done).length;
    });
  } else {
    const checklist = loadProgress(trackKey, []);
    total = checklist.length;
    done = checklist.filter(i=>i.done).length;
  }
  const percent = total ? Math.round((done/total)*100) : 0;
  document.getElementById(track.progressId).style.width = percent + '%';
}

// --- Date Range Logic ---
Object.keys(TRACKS).forEach(trackKey => {
  const track = TRACKS[trackKey];
  if (trackKey === 'ielts') {
    const {start, end} = loadDates('ielts');
    document.getElementById('ielts-start').value = start;
    document.getElementById('ielts-end').value = end;
    document.getElementById('ielts-start').addEventListener('change', e => {
      saveDates('ielts', e.target.value, document.getElementById('ielts-end').value);
    });
    document.getElementById('ielts-end').addEventListener('change', e => {
      saveDates('ielts', document.getElementById('ielts-start').value, e.target.value);
    });
  } else {
    const {start, end} = loadDates(trackKey);
    document.getElementById(track.startId).value = start;
    document.getElementById(track.endId).value = end;
    document.getElementById(track.startId).addEventListener('change', e => {
      saveDates(trackKey, e.target.value, document.getElementById(track.endId).value);
    });
    document.getElementById(track.endId).addEventListener('change', e => {
      saveDates(trackKey, document.getElementById(track.startId).value, e.target.value);
    });
  }
});

// --- Render Section ---
function renderSection(trackKey) {
  renderChecklist(trackKey);
  renderProgress(trackKey);
  // Show motivational tip and code links if coding
  let tip = '';
  let links = '';
  if (TRACKS[trackKey].tips) {
    tip = `<div class="motivation-tip">💡 ${TRACKS[trackKey].tips[Math.floor(Math.random()*TRACKS[trackKey].tips.length)]}</div>`;
  }
  if (TRACKS[trackKey].codeLinks) {
    links = '<div class="code-links">'+TRACKS[trackKey].codeLinks.map(l=>`<a href="${l}" target="_blank">Practice Link</a>`).join(' | ')+'</div>';
  }
  document.getElementById(trackKey).querySelector('h2').insertAdjacentHTML('afterend', tip+links);
}

// --- Dashboard Rendering ---
function renderDashboard() {
  // Progress overview
  let html = '<h3>Overall Progress</h3><ul>';
  Object.keys(TRACKS).forEach(trackKey => {
    let percent = 0;
    const track = TRACKS[trackKey];
    let total = 0, done = 0;
    if (trackKey === 'ielts') {
      track.sections.forEach(section => {
        const checklist = loadProgress('ielts-' + section, []);
        total += checklist.length;
        done += checklist.filter(i=>i.done).length;
      });
    } else {
      const checklist = loadProgress(trackKey, []);
      total = checklist.length;
      done = checklist.filter(i=>i.done).length;
    }
    percent = total ? Math.round((done/total)*100) : 0;
    html += `<li>${track.name}: <b>${percent}%</b></li>`;
  });
  html += '</ul>';
  document.getElementById('dashboard-overview').innerHTML = html;
  // Motivation
  document.getElementById('motivation').innerHTML = '<b>Motivation:</b> ' + MOTIVATION[Math.floor(Math.random()*MOTIVATION.length)];
  // Daily tip
  document.getElementById('daily-tip').innerHTML = '<b>Tip of the Day:</b> ' + TRACKS[Object.keys(TRACKS)[Math.floor(Math.random()*Object.keys(TRACKS).length)]].tips?.[0] || '';
}

// --- Export Logic ---
document.getElementById('export-json').addEventListener('click', () => {
  const data = {};
  Object.keys(TRACKS).forEach(trackKey => {
    if (trackKey === 'ielts') {
      data[trackKey] = {};
      TRACKS[trackKey].sections.forEach(section => {
        data[trackKey][section] = loadProgress('ielts-' + section, []);
      });
    } else {
      data[trackKey] = loadProgress(trackKey, []);
    }
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'progress.json';
  a.click();
  URL.revokeObjectURL(url);
});
// PDF export (simple, prints the page)
document.getElementById('export-pdf').addEventListener('click', () => {
  window.print();
});

// --- Initial Render ---
Object.keys(TRACKS).forEach(renderChecklist);
Object.keys(TRACKS).forEach(renderProgress);
renderDashboard();
}); 