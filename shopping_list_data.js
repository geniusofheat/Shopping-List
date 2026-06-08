// ── SHOPPING_LIST.JS ────────────────────────────────────────────────────────


// ── SECTION 1: STATE ────────────────────────────────────────────────────────

const STORAGE_KEY = 'shopping_lists';
let lists = [];
let current_list_id = null;


// ── SECTION 2: INIT ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  set_date_display();
  load_lists();
  render_lists_view();

  document.getElementById('item-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') add_item();
  });
});

function set_date_display() {
  const el = document.getElementById('dateDisplay');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}


// ── SECTION 3: STORAGE ──────────────────────────────────────────────────────

function load_lists() {
  const raw = localStorage.getItem(STORAGE_KEY);
  lists = raw ? JSON.parse(raw) : [];
}

function save_lists() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}


// ── SECTION 4: RENDER LISTS VIEW ────────────────────────────────────────────

function render_lists_view() {
  const container = document.getElementById('lists-container');
  const blank_count = Math.max(0, 12 - lists.length);
  const blanks = Array(blank_count)
    .fill('<div class="notepad-row blank"></div>')
    .join('');

  if (lists.length === 0) {
    container.innerHTML =
      '<div class="notepad-placeholder">No lists yet. Tap ＋ above to create one.</div>' +
      blanks;
    return;
  }

  container.innerHTML =
    lists.map(list => `
      <div class="notepad-row note-list-item">
        <span class="note-list-title" onclick="open_list('${list.id}')">${list.name}</span>
        <span class="list-item-count">${list.items.length} item${list.items.length !== 1 ? 's' : ''}</span>
        <button class="orange-btn" onclick="delete_list('${list.id}')">✕</button>
      </div>
    `).join('') +
    blanks;
}


// ── SECTION 5: CREATE LIST ───────────────────────────────────────────────────

function create_new_list() {
  const name = prompt('List name:');
  if (!name || !name.trim()) return;

  const list = {
    id: Date.now().toString(),
    name: name.trim(),
    items: [],
    created: new Date().toISOString()
  };

  lists.unshift(list);
  save_lists();
  open_list(list.id);
}
window.create_new_list = create_new_list;


// ── SECTION 6: DELETE LIST ───────────────────────────────────────────────────

function delete_list(id) {
  const list = lists.find(l => l.id === id);
  if (!list) return;
  if (!confirm(`Delete "${list.name}"?`)) return;
  lists = lists.filter(l => l.id !== id);
  save_lists();
  render_lists_view();
}
window.delete_list = delete_list;


// ── SECTION 7: OPEN LIST ────────────────────────────────────────────────────

function open_list(id) {
  const list = lists.find(l => l.id === id);
  if (!list) return;

  current_list_id = id;

  document.getElementById('lists-view').style.display = 'none';
  document.getElementById('list-items-view').style.display = 'block';
  document.getElementById('item-add-row').style.display = 'flex';
  document.getElementById('list-title-display').textContent = list.name;
  document.getElementById('header-title').textContent = '🛒 Shopping:';

  render_items();
}
window.open_list = open_list;

function back_to_lists() {
  current_list_id = null;

  document.getElementById('list-items-view').style.display = 'none';
  document.getElementById('item-add-row').style.display = 'none';
  document.getElementById('lists-view').style.display = 'block';
  document.getElementById('header-title').textContent = '🛒 Shopping Lists';

  render_lists_view();
}
window.back_to_lists = back_to_lists;


// ── SECTION 8: RENDER ITEMS ─────────────────────────────────────────────────

function render_items() {
  const list = lists.find(l => l.id === current_list_id);
  if (!list) return;

  const container = document.getElementById('items-container');
  const blank_count = Math.max(0, 6 - list.items.length);
  const blanks = Array(blank_count)
    .fill('<div class="notepad-row blank"></div>')
    .join('');

  if (list.items.length === 0) {
    container.innerHTML =
      '<div class="notepad-placeholder">No items yet. Add one below.</div>' +
      blanks;
    return;
  }

  container.innerHTML =
    list.items.map(item => `
      <div class="notepad-row">
        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggle_item('${item.id}')">
        <label class="${item.checked ? 'crossed' : ''}" onclick="toggle_item('${item.id}')">${item.name}</label>
        <button class="remove-btn" onclick="remove_item('${item.id}')">✕</button>
      </div>
    `).join('') +
    blanks;
}


// ── SECTION 9: ADD ITEM ─────────────────────────────────────────────────────

function add_item() {
  const input = document.getElementById('item-input');
  const name = input.value.trim();
  if (!name || !current_list_id) return;

  const list = lists.find(l => l.id === current_list_id);
  if (!list) return;

  list.items.push({
    id: Date.now().toString(),
    name,
    checked: false
  });

  save_lists();
  input.value = '';
  render_items();
}
window.add_item = add_item;


// ── SECTION 10: VOICE INPUT ──────────────────────────────────────────────────

function voiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('item-input');
    input.value = transcript;
    input.focus();
  };

  recognition.onerror = function(event) {
    console.error('Voice error:', event.error);
  };
}
window.voiceInput = voiceInput;


// ── SECTION 11: TOGGLE / REMOVE ITEM ────────────────────────────────────────

function toggle_item(id) {
  const list = lists.find(l => l.id === current_list_id);
  if (!list) return;
  const item = list.items.find(i => i.id === id);
  if (!item) return;
  item.checked = !item.checked;
  save_lists();
  render_items();
}
window.toggle_item = toggle_item;

function remove_item(id) {
  const list = lists.find(l => l.id === current_list_id);
  if (!list) return;
  list.items = list.items.filter(i => i.id !== id);
  save_lists();
  render_items();
}
window.remove_item = remove_item;


// ── SECTION 12: NAVIGATION ───────────────────────────────────────────────────

function handleBack() {
  window.history.back();
}
window.handleBack = handleBack;
