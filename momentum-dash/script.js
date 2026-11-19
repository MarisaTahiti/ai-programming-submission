// ---------- Clock & greeting ----------
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('clock').textContent = `${h}:${m} ${ampm}`;
  document.getElementById('date').textContent = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  const hour = now.getHours();
  const greeting = hour < 5 ? 'Good night'
    : hour < 12 ? 'Good morning'
    : hour < 18 ? 'Good afternoon'
    : 'Good evening';
  document.getElementById('greeting').textContent = greeting;
}
updateClock();
setInterval(updateClock, 1000 * 15);

// ---------- Background photo: French Polynesia, via Wikimedia Commons ----------
// No API key needed. We search Commons (the free media library behind Wikipedia)
// for real photos of specific islands/atolls, then pick one at random.
const FP_SEARCH_TERMS = [
  'Bora Bora lagoon',
  'Moorea island French Polynesia',
  'Tahiti Papeete aerial',
  'Huahine French Polynesia',
  'Rangiroa atoll',
  'Tikehau atoll',
  'Society Islands aerial French Polynesia',
  'Marquesas Islands Nuku Hiva',
  'Raiatea French Polynesia',
  'overwater bungalow French Polynesia'
];

async function fetchFrenchPolynesiaPhoto() {
  const term = FP_SEARCH_TERMS[Math.floor(Math.random() * FP_SEARCH_TERMS.length)];
  const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: '6',
    gsrlimit: '25',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1920',
    format: 'json',
    origin: '*'
  });
  const res = await fetch(api);
  const data = await res.json();
  const pages = data && data.query && data.query.pages;
  if (!pages) throw new Error('No Commons results');

  const candidates = Object.values(pages).filter((p) => {
    const info = p.imageinfo && p.imageinfo[0];
    return info && info.thumburl && /\.(jpe?g|png)/i.test(info.thumburl);
  });
  if (!candidates.length) throw new Error('No usable photos found');

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const info = pick.imageinfo[0];
  const rawAuthor = info.extmetadata && info.extmetadata.Artist && info.extmetadata.Artist.value;
  const author = rawAuthor ? rawAuthor.replace(/<[^>]+>/g, '').trim() : 'Wikimedia Commons';
  const title = pick.title.replace(/^File:/, '').replace(/\.(jpe?g|png)$/i, '');

  return { imageUrl: info.thumburl, credit: `${title} — ${author}` };
}

function applyBackground(photo) {
  const bg = document.getElementById('bg');
  const img = new Image();
  img.onload = () => { bg.style.backgroundImage = `url(${photo.imageUrl})`; };
  img.src = photo.imageUrl;
  document.getElementById('photo-credit').textContent = photo.credit + ' · Wikimedia Commons';
}

async function loadBackground(forceNew = false) {
  if (!forceNew) {
    const cached = await new Promise((resolve) => {
      chrome.storage.local.get(['fpPhoto'], (data) => resolve(data.fpPhoto));
    });
    if (cached) {
      applyBackground(cached);
      return;
    }
  }
  try {
    const photo = await fetchFrenchPolynesiaPhoto();
    chrome.storage.local.set({ fpPhoto: photo });
    applyBackground(photo);
  } catch (err) {
    document.getElementById('photo-credit').textContent = 'Could not load a photo — check your connection';
    console.error(err);
  }
}
loadBackground();
document.getElementById('refresh-photo').addEventListener('click', () => loadBackground(true));

// ---------- Motivational quote ----------
const QUOTES = [
  "Small steps every day add up to big change.",
  "Discipline is choosing what you want most over what you want now.",
  "Progress, not perfection.",
  "You don't have to see the whole staircase, just take the first step.",
  "Focus on what you can control today.",
  "Done is better than perfect.",
  "Every expert was once a beginner.",
  "Consistency beats intensity.",
  "Start where you are. Use what you have. Do what you can.",
  "Hard choices, easy life. Easy choices, hard life.",
  "The best time to start was yesterday. The next best time is now.",
  "You are one decision away from a totally different life.",
  "Slow progress is still progress.",
  "Show up for yourself today.",
  "Growth happens outside your comfort zone.",
  "Nothing changes if nothing changes.",
  "One task at a time.",
  "You've done hard things before — you can do this too.",
  "Momentum builds momentum. Start now.",
  "Confidence comes from doing the thing.",
  "Rest, don't quit.",
  "The work you avoid today waits for you tomorrow, a little bigger.",
  "Trust the process.",
  "Be patient with yourself — you're doing better than you think.",
  "Clarity comes from action, not thought.",
];

function showQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote').textContent = `"${q}"`;
}
showQuote();

// ---------- Ambient sounds (white noise / rain / ocean waves) ----------
// Generated entirely in the browser with the Web Audio API — no external
// files or licensing needed, and it works offline.
let audioCtx = null;
let currentSource = null;
let currentGain = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function makeNoiseBuffer(ctx, seconds = 4) {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function stopSound() {
  if (currentSource) {
    try { currentSource.stop(); } catch (e) {}
    currentSource.disconnect();
    currentSource = null;
  }
  if (currentGain) {
    currentGain.disconnect();
    currentGain = null;
  }
}

function playWhiteNoise(volume) {
  const ctx = getAudioCtx();
  const buffer = makeNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(gain).connect(ctx.destination);
  source.start();
  currentSource = source;
  currentGain = gain;
}

function playRain(volume) {
  const ctx = getAudioCtx();
  const buffer = makeNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 6;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = volume * 0.15;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  currentSource = source;
  currentGain = gain;
}

function playWaves(volume) {
  const ctx = getAudioCtx();
  const buffer = makeNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;

  const gain = ctx.createGain();
  gain.gain.value = volume * 0.3;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = volume * 0.7;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  currentSource = source;
  currentGain = gain;
}

const soundButtons = document.querySelectorAll('.sound-btn');
const volumeSlider = document.getElementById('sound-volume');
let activeSound = 'off';

function startSound(kind, volume) {
  stopSound();
  if (kind === 'white') playWhiteNoise(volume);
  else if (kind === 'rain') playRain(volume);
  else if (kind === 'waves') playWaves(volume);
}

soundButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const kind = btn.dataset.sound;
    activeSound = kind;
    soundButtons.forEach((b) => b.classList.toggle('active', b === btn));
    if (kind === 'off') {
      stopSound();
    } else {
      startSound(kind, parseFloat(volumeSlider.value));
    }
    chrome.storage.local.set({ activeSound: kind });
  });
});

volumeSlider.addEventListener('input', () => {
  const vol = parseFloat(volumeSlider.value);
  chrome.storage.local.set({ soundVolume: vol });
  if (currentGain && activeSound !== 'off') {
    startSound(activeSound, vol);
  }
});

chrome.storage.local.get(['activeSound', 'soundVolume'], (data) => {
  if (data.soundVolume !== undefined) volumeSlider.value = data.soundVolume;
  if (data.activeSound && data.activeSound !== 'off') {
    const btn = document.querySelector(`.sound-btn[data-sound="${data.activeSound}"]`);
    if (btn) btn.classList.add('active');
  } else {
    document.getElementById('sound-off').classList.add('active');
  }
});

// ---------- To-do list ----------
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

function renderTodos(todos) {
  todoList.innerHTML = '';
  todos.forEach((todo, i) => {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(i));

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = todo.text;

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = '✕';
    del.addEventListener('click', () => deleteTodo(i));

    li.append(checkbox, span, del);
    todoList.appendChild(li);
  });
}

function getTodos(cb) {
  chrome.storage.local.get(['todos'], (data) => cb(data.todos || []));
}

function saveTodos(todos) {
  chrome.storage.local.set({ todos }, () => renderTodos(todos));
}

function toggleTodo(index) {
  getTodos((todos) => {
    todos[index].done = !todos[index].done;
    saveTodos(todos);
  });
}

function deleteTodo(index) {
  getTodos((todos) => {
    todos.splice(index, 1);
    saveTodos(todos);
  });
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  getTodos((todos) => {
    todos.push({ text, done: false });
    saveTodos(todos);
  });
  todoInput.value = '';
});

getTodos(renderTodos);
