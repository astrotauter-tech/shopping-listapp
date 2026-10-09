const STORAGE_KEY = 'shopping-list-items';

const form = document.getElementById('add-form');
const input = document.getElementById('item-input');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const summary = document.getElementById('summary');
const clearDone = document.getElementById('clear-done');

let items = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 메모리에서만 동작
  }
}

function render() {
  list.innerHTML = '';

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'item' + (item.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.done;
    checkbox.setAttribute('aria-label', `${item.name} 구매 완료`);
    checkbox.addEventListener('change', () => toggleItem(item.id));

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = item.name;

    const del = document.createElement('button');
    del.className = 'delete';
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `${item.name} 삭제`);
    del.addEventListener('click', () => deleteItem(item.id));

    li.append(checkbox, name, del);
    list.appendChild(li);
  }

  const doneCount = items.filter((i) => i.done).length;
  summary.textContent = items.length
    ? `전체 ${items.length}개 · 구매 완료 ${doneCount}개`
    : '';
  empty.hidden = items.length > 0;
  clearDone.hidden = doneCount === 0;
}

function addItem(name) {
  items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), name, done: false });
  save();
  render();
}

function toggleItem(id) {
  const item = items.find((i) => i.id === id);
  if (item) item.done = !item.done;
  save();
  render();
}

function deleteItem(id) {
  items = items.filter((i) => i.id !== id);
  save();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;
  addItem(name);
  input.value = '';
  input.focus();
});

clearDone.addEventListener('click', () => {
  items = items.filter((i) => !i.done);
  save();
  render();
});

render();
