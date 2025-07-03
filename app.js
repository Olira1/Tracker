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
  ], sections: ['reading', 'writing', 'listening', 'speaking'] },
  'dsa': { name: 'DSA 60-Day Challenge', days: 60, checklistId: 'dsa-checklist', progressId: 'dsa-progress', startId: 'dsa-start', endId: 'dsa-end', tips: [
    'Practice DSA problems daily.',
    'Focus on understanding algorithms and data structures.',
    'Review and optimize your solutions.'
  ], codeLinks: [
    'https://leetcode.com/problemset/all/',
    'https://www.geeksforgeeks.org/data-structures/'
  ] },
  'smma': { name: 'Social Media Marketing Agency (SMMA) 60-Day Challenge', days: 60, checklistId: 'smma-checklist', progressId: 'smma-progress', startId: 'smma-start', endId: 'smma-end', tips: [
    'Engage with your audience daily.',
    'Analyze campaign performance regularly.',
    'Stay updated with social media trends.'
  ], codeLinks: [
    'https://www.socialmediaexaminer.com/',
    'https://buffer.com/library/social-media-marketing/'
  ] },
  'js-oop': { name: 'JavaScript OOP 7-Day Challenge', days: 7, checklistId: 'js-oop-checklist', progressId: 'js-oop-progress', startId: 'js-oop-start', endId: 'js-oop-end', tips: [
    'Practice creating classes and objects.',
    'Understand prototypal inheritance.',
    'Refactor code to use OOP principles.'
  ], codeLinks: [
    'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_JS',
    'https://www.freecodecamp.org/news/object-oriented-programming-in-javascript/'
  ] },
  'bible-study': { name: 'Bible Study 60-Day', days: 60, checklistId: 'bible-study-checklist', progressId: 'bible-study-progress', startId: 'bible-study-start', endId: 'bible-study-end', tips: [
    'Read a passage daily and reflect on its meaning.',
    'Take notes and journal your thoughts.',
    'Discuss insights with a study group or partner.'
  ], codeLinks: [
    'https://www.bible.com/reading-plans',
    'https://www.biblestudytools.com/bible-reading-plan/'
  ] },
  'ms': { name: 'MS 60-Day Tracker', days: 60, checklistId: 'ms-checklist', progressId: 'ms-progress', startId: 'ms-start', endId: 'ms-end', tips: [
    'Set clear daily goals for your MS journey.',
    'Track your progress and adjust as needed.',
    'Celebrate milestones and stay motivated.'
  ], codeLinks: [
    'https://www.nationalmssociety.org/',
    'https://www.mssociety.org.uk/care-and-support/everyday-living/keeping-active'
  ] },
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
// --- Clear Python OOP Progress Utility ---
function clearPythonOOPProgress() {
  localStorage.removeItem('progress_python-oop');
  renderChecklist('python-oop');
  renderProgress('python-oop');
}
// Add a temporary button for clearing Python OOP progress
if (!document.getElementById('clear-python-oop')) {
  const btn = document.createElement('button');
  btn.id = 'clear-python-oop';
  btn.textContent = 'Reset Python OOP Tracker';
  btn.style.margin = '1rem';
  btn.onclick = clearPythonOOPProgress;
  document.body.insertBefore(btn, document.body.firstChild);
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
    if (item.dataset.section === 'documentation') renderDocumentation();
  });
});

// --- Schedules for Python OOP and JavaScript ---
const SCHEDULES = {
  'python-oop': [
    {
      day: 1,
      title: 'OOP Basics',
      concept: 'What is OOP, Classes, Objects, __init__ method',
      practice: 'Create a Car class with attributes (make, model, year). Instantiate two objects and print their details.',
      resource: 'https://www.w3schools.com/python/python_classes.asp'
    },
    {
      day: 2,
      title: 'Attributes and Methods',
      concept: 'Instance vs Class attributes, Instance methods',
      practice: 'Add methods like start(), stop(), and display_info() to your Car class.',
      resource: 'https://realpython.com/python3-object-oriented-programming/'
    },
    {
      day: 3,
      title: 'Encapsulation',
      concept: 'Private variables (_ / __), Getters & Setters',
      practice: 'Create a BankAccount class. Use getters and setters to control balance access.',
      resource: 'https://www.geeksforgeeks.org/encapsulation-in-python/'
    },
    {
      day: 4,
      title: 'Inheritance',
      concept: 'Base and Derived Classes, super()',
      practice: 'Create a Person class, then extend it to a Student class with extra attributes.',
      resource: 'https://www.w3schools.com/python/python_inheritance.asp'
    },
    {
      day: 5,
      title: 'Polymorphism',
      concept: 'Method Overriding, Duck Typing',
      practice: 'Create Animal, Dog, and Cat classes with a speak() method. Override speak in Dog and Cat.',
      resource: 'https://www.programiz.com/python-programming/polymorphism'
    },
    {
      day: 6,
      title: 'Abstraction & Magic Methods',
      concept: 'Abstract Classes (abc), Dunder methods (__str__, __len__, etc.)',
      practice: 'Create a Shape abstract class with Circle and Rectangle classes. Use __str__ to print shapes.',
      resource: 'https://www.geeksforgeeks.org/abstract-classes-in-python/'
    },
    {
      day: 7,
      title: 'Mini Project + Review',
      concept: 'Review of all concepts: classes, inheritance, abstraction, etc.',
      practice: 'Build a school management system with Students, Teachers, and Courses. Apply all OOP principles.',
      resource: 'https://realpython.com/python3-object-oriented-programming/#building-a-school-system'
    }
  ],
  'javascript': [
    { day: 1, title: 'Intro to JavaScript', concept: 'What is JS, setup, writing your first script', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction' },
    { day: 2, title: 'Variables & Data Types', concept: 'let, const, var, strings, numbers, booleans', resource: 'https://www.w3schools.com/js/js_variables.asp' },
    { day: 3, title: 'Operators', concept: 'Arithmetic, assignment, comparison, logical', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators' },
    { day: 4, title: 'Conditionals', concept: 'if, else, else if, switch', resource: 'https://www.w3schools.com/js/js_if_else.asp' },
    { day: 5, title: 'Loops', concept: 'for, while, do...while, break, continue', resource: 'https://www.w3schools.com/js/js_loop_for.asp' },
    { day: 6, title: 'Functions', concept: 'Function declaration, expression, arrow functions', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' },
    { day: 7, title: 'Practice Day 1', concept: 'Build a simple calculator', practice: 'Apply concepts from previous lessons.' },
    { day: 8, title: 'Arrays', concept: 'Creating arrays, common methods', resource: 'https://www.w3schools.com/js/js_arrays.asp' },
    { day: 9, title: 'Array Methods', concept: 'map, filter, reduce, forEach, find', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' },
    { day: 10, title: 'Objects', concept: 'Object creation, properties, methods', resource: 'https://www.w3schools.com/js/js_objects.asp' },
    { day: 11, title: 'Object Methods', concept: 'this, constructor functions', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this' },
    { day: 12, title: 'JSON', concept: 'Parse and stringify data', resource: 'https://www.w3schools.com/js/js_json.asp' },
    { day: 13, title: 'Practice Day 2', concept: 'Build a user profile object manager', practice: 'Apply concepts from previous lessons.' },
    { day: 14, title: 'DOM Manipulation', concept: 'getElementById, querySelector, innerHTML', resource: 'https://www.w3schools.com/js/js_htmldom.asp' },
    { day: 15, title: 'Events', concept: 'onClick, addEventListener', resource: 'https://www.w3schools.com/js/js_events.asp' },
    { day: 16, title: 'Forms & Validation', concept: 'form inputs, preventDefault, validation', resource: 'https://www.javascripttutorial.net/javascript-dom/javascript-form-validation/' },
    { day: 17, title: 'Practice Day 3', concept: 'Build an interactive form', practice: 'Apply concepts from previous lessons.' },
    { day: 18, title: 'ES6 Basics', concept: 'let/const, template literals, default params', resource: 'https://www.freecodecamp.org/news/es6-guide/' },
    { day: 19, title: 'Destructuring & Spread', concept: 'Object/Array destructuring, spread/rest', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment' },
    { day: 20, title: 'Modules', concept: 'Import/export syntax', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' },
    { day: 21, title: 'Practice Day 4', concept: 'Create a module-based project', practice: 'Apply concepts from previous lessons.' },
    { day: 22, title: 'OOP in JS - Part 1', concept: 'Object literals, constructor functions', resource: 'https://www.digitalocean.com/community/tutorials/js-object-oriented-programming' },
    { day: 23, title: 'OOP in JS - Part 2', concept: 'ES6 Classes, inheritance', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes' },
    { day: 24, title: 'Error Handling', concept: 'try...catch, throw', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling' },
    { day: 25, title: 'Practice Day 5', concept: 'Create a class-based to-do app', practice: 'Apply concepts from previous lessons.' },
    { day: 26, title: 'Async JS - Part 1', concept: 'setTimeout, setInterval', resource: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Timers' },
    { day: 27, title: 'Async JS - Part 2', concept: 'Promises', resource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises' },
    { day: 28, title: 'Async JS - Part 3', concept: 'Async/Await', resource: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises' },
    { day: 29, title: 'Practice Day 6', concept: 'Build a data-fetching app using async/await', practice: 'Apply concepts from previous lessons.' },
    { day: 30, title: 'Final Project', concept: 'Build a mini web app using everything you\'ve learned', practice: 'Apply concepts from previous lessons.' }
  ]
};

// --- Enhanced Checklist Rendering for Schedules ---
function renderChecklist(trackKey) {
  const track = TRACKS[trackKey];
  let checklist, checklistElem;
  // Use schedule if available
  const schedule = SCHEDULES[trackKey];
  if (schedule) {
    checklist = loadProgress(trackKey, Array(schedule.length).fill('').map((_,i)=>({done:false})));
    checklistElem = document.getElementById(track.checklistId);
    checklistElem.innerHTML = '';
    // Get today's day index (0-based)
    const today = new Date();
    let startDate = loadDates(trackKey).start;
    let todayIdx = null;
    if (startDate) {
      const start = new Date(startDate);
      const diff = Math.floor((today - start) / (1000*60*60*24));
      if (diff >= 0 && diff < schedule.length) todayIdx = diff;
    }
    schedule.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = checklist[idx].done ? 'completed' : '';
      if (todayIdx === idx) li.classList.add('today-task');
      let html = `<input type="checkbox" ${checklist[idx].done?'checked':''}> <b>Day ${item.day}: ${item.title}</b><br>`;
      html += `<span>🧠 <b>Concept:</b> ${item.concept}</span><br>`;
      if (item.practice) html += `<span>📝 <b>Practice:</b> ${item.practice}</span><br>`;
      if (item.resource) html += `<a href="${item.resource}" target="_blank">Resource</a>`;
      li.innerHTML = html;
      li.querySelector('input').addEventListener('change', e => {
        checklist[idx].done = e.target.checked;
        saveProgress(trackKey, checklist);
        renderProgress(trackKey);
      });
      checklistElem.appendChild(li);
    });
    // Show alert/notification for today's task
    if (todayIdx !== null && checklistElem.children[todayIdx]) {
      const todayTask = schedule[todayIdx];
      setTimeout(() => {
        alert(`Today's ${track.name} Task:\nDay ${todayTask.day}: ${todayTask.title}\nConcept: ${todayTask.concept}${todayTask.practice ? '\nPractice: ' + todayTask.practice : ''}`);
        // Optionally, use Notification API
        if (window.Notification && Notification.permission === 'granted') {
          new Notification(`Today's ${track.name} Task`, { body: `Day ${todayTask.day}: ${todayTask.title}` });
        }
      }, 500);
    }
    return;
  }
  // ... fallback to original logic for other tracks ...
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

// --- Documentation Tab Logic ---
function renderDocumentation() {
  let notes = [];
  try {
    notes = JSON.parse(localStorage.getItem('vocab_notes_multi')) || [];
  } catch (e) { notes = []; }
  const docDiv = document.getElementById('documentation-content');
  if (!notes.length) {
    docDiv.textContent = 'No documentation available yet.';
    return;
  }
  let html = '';
  notes.forEach((note, i) => {
    html += `<div style="margin-bottom:2.5rem;">
      <h3 style="margin-bottom:0.5rem;">${note.title ? note.title : 'Note ' + (i+1)}</h3>`;
    if (window.marked) {
      html += window.marked.parse(note.content || '');
    } else {
      html += `<pre>${note.content || ''}</pre>`;
    }
    html += '</div>';
  });
  docDiv.innerHTML = html;
}

// --- Initial Render ---
Object.keys(TRACKS).forEach(renderChecklist);
Object.keys(TRACKS).forEach(renderProgress);
renderDashboard();
}); 