// main.js — client side only. Saves background image in localStorage (private to your browser).
const intro = document.getElementById('intro');
const enterBtn = document.getElementById('enterBtn');
const app = document.getElementById('app');
const fileInput = document.getElementById('fileInput');
const canvasArea = document.getElementById('canvasArea');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const pasteBtn = document.getElementById('pasteBtn');
const backBtn = document.getElementById('backBtn');

const STORAGE_KEY = 'zew0o0_dev_settings_v1';

// show intro or main based on saved flag
function showIntro(show){
  intro.classList.toggle('hidden', !show);
  app.classList.toggle('hidden', show);
}

enterBtn.addEventListener('click', () => showIntro(false));
backBtn.addEventListener('click', () => showIntro(true));

// load settings from localStorage
function loadSettings(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  }catch(e){ return {} }
}
function saveSettings(s){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s||{}));
}

function applySettings(){
  const s = loadSettings();
  if (s.backgroundDataUrl) {
    canvasArea.style.backgroundImage = `url(${s.backgroundDataUrl})`;
  } else {
    canvasArea.style.backgroundImage = '';
  }
}

// handle file upload
fileInput.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const dataUrl = await readFileAsDataURL(f);
  const s = loadSettings();
  s.backgroundDataUrl = dataUrl;
  saveSettings(s);
  applySettings();
});

// helper: file -> dataURL
function readFileAsDataURL(file){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// paste support (Ctrl+V)
pasteBtn.addEventListener('click', () => {
  alert('Now paste an image (Ctrl+V) into the page. If it doesn't work, try using the file picker.');
});
window.addEventListener('paste', async (ev) => {
  const items = ev.clipboardData?.items || [];
  for (let i=0;i<items.length;i++){
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      const dataUrl = await readFileAsDataURL(blob);
      const s = loadSettings();
      s.backgroundDataUrl = dataUrl;
      saveSettings(s);
      applySettings();
      return;
    }
  }
});

// reset
resetBtn.addEventListener('click', () => {
  if (!confirm('Reset your background?')) return;
  const s = loadSettings();
  delete s.backgroundDataUrl;
  saveSettings(s);
  applySettings();
});

// export settings (download JSON)
exportBtn.addEventListener('click', () => {
  const s = loadSettings();
  const blob = new Blob([JSON.stringify(s)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'zew0o0_settings.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// import settings (restore)
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const text = await f.text();
  try{
    const obj = JSON.parse(text);
    saveSettings(obj);
    applySettings();
    alert('Imported settings.');
  }catch(err){
    alert('Invalid file.');
  }
});

// init
applySettings();
