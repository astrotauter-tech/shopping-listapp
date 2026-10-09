// Supabase 연결 정보 (publishable 키는 브라우저 공개용 키이며, 데이터는 RLS로 보호됨)
const SUPABASE_URL = 'https://zmgpcomuuujvsxapebvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ur9f17G8s5WfEJdBWHw-_A_l7IZCF02';
const TABLE = 'shopping_items';
const LEGACY_STORAGE_KEY = 'shopping-list-items';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('add-form');
const input = document.getElementById('item-input');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const summary = document.getElementById('summary');
const status = document.getElementById('status');
const clearDone = document.getElementById('clear-done');

let items = [];

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
  status.hidden = !message;
}

function fail(action, error) {
  console.error(action, error);
  showStatus(`${action}에 실패했어요. 잠시 후 다시 시도해 주세요.`, true);
}

// 방문자마다 익명 사용자로 로그인해서 자기 목록만 보도록 함 (세션은 브라우저에 유지됨)
async function ensureSignedIn() {
  const { data: { session } } = await db.auth.getSession();
  if (session) return true;
  const { error } = await db.auth.signInAnonymously();
  if (error) {
    fail('로그인', error);
    return false;
  }
  return true;
}

// 예전 버전이 localStorage에 저장한 목록이 있으면 한 번만 DB로 옮김
async function migrateLegacyItems() {
  let legacy;
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
  } catch {
    return;
  }
  if (!Array.isArray(legacy) || legacy.length === 0) return;

  const rows = legacy
    .filter((i) => typeof i?.name === 'string' && i.name.trim())
    .map((i) => ({ name: i.name.trim().slice(0, 100), done: Boolean(i.done) }));
  const { error } = rows.length ? await db.from(TABLE).insert(rows) : { error: null };
  if (error) return fail('기존 목록 옮기기', error);
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // 지우지 못해도 다음 실행 때 다시 시도
  }
}

async function loadItems() {
  const { data, error } = await db
    .from(TABLE)
    .select('id, name, done')
    .order('created_at', { ascending: true });
  if (error) return fail('목록 불러오기', error);
  items = data;
  render();
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

async function addItem(name) {
  const { data, error } = await db.from(TABLE).insert({ name }).select('id, name, done').single();
  if (error) return fail('추가', error);
  items.push(data);
  showStatus('');
  render();
}

async function toggleItem(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  const { error } = await db.from(TABLE).update({ done: !item.done }).eq('id', id);
  if (error) {
    render(); // 체크박스를 원래 상태로 되돌림
    return fail('체크', error);
  }
  item.done = !item.done;
  showStatus('');
  render();
}

async function deleteItem(id) {
  const { error } = await db.from(TABLE).delete().eq('id', id);
  if (error) return fail('삭제', error);
  items = items.filter((i) => i.id !== id);
  showStatus('');
  render();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;
  input.value = '';
  input.focus();
  await addItem(name);
});

clearDone.addEventListener('click', async () => {
  const ids = items.filter((i) => i.done).map((i) => i.id);
  const { error } = await db.from(TABLE).delete().in('id', ids);
  if (error) return fail('구매 완료 항목 지우기', error);
  items = items.filter((i) => !i.done);
  showStatus('');
  render();
});

async function init() {
  showStatus('불러오는 중…');
  render();
  if (!(await ensureSignedIn())) return;
  await migrateLegacyItems();
  await loadItems();
  if (!status.classList.contains('error')) showStatus('');
}

init();
