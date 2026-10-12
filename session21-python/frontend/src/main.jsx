import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STATUSES = [
  { value: 'TODO', label: 'To do', count: 'todo' },
  { value: 'IN_PROGRESS', label: 'In progress', count: 'inProgress' },
  { value: 'DONE', label: 'Done', count: 'done' },
];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const EMPTY_STATS = { total: 0, todo: 0, inProgress: 0, done: 0 };
const priorityLabel = (value) => value[0] + value.slice(1).toLowerCase();
const initials = (name) => (name || 'Unassigned').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
const taskDate = (value) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));

function Icon({ name, size = 18, ...props }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    list: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    board: <><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="11" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    edit: <><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z" /><path d="M13 20h7" /></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    notebook: <><rect x="5" y="3" width="15" height="18" rx="2" /><path d="M9 3v18M3 7h4M3 12h4M3 17h4M13 8h3M13 12h3" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = typeof payload?.detail === 'string' ? payload.detail : null;
    throw new Error(detail || (response.status === 404 ? 'This task no longer exists. Refresh your list.' : 'Something went wrong. Please try again.'));
  }
  return response.status === 204 ? null : response.json();
}

function Dialog({ children, labelledBy, onClose, busy = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    dialog.querySelector('input, textarea, select')?.focus();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby={labelledBy}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget || busy) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>{children}</dialog>;
}

function TaskForm({ task, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = form.get('title').trim();
    if (!title) { setError('Give your task a title.'); return; }
    const values = {
      title,
      description: form.get('description').trim(),
      priority: form.get('priority'),
      status: form.get('status'),
      assignee: form.get('assignee').trim() || 'Unassigned',
    };
    setSaving(true);
    setError('');
    try {
      await onSave(values, task?.id);
    } catch (failure) {
      setError(failure.message === 'Failed to fetch' ? 'Couldn’t save your task. Check your connection and try again.' : failure.message);
      setSaving(false);
    }
  }
  return <Dialog labelledBy="task-dialog-title" onClose={onClose} busy={saving}>
    <form onSubmit={submit}>
      <div className="dialog-heading"><div><span className="overline">{task ? `TASK / ${String(task.id).padStart(3, '0')}` : 'NEW TASK'}</span><h2 id="task-dialog-title">{task ? 'Edit task' : 'What’s next?'}</h2></div><button className="icon-button" type="button" aria-label="Close task form" onClick={onClose} disabled={saving}><Icon name="close" /></button></div>
      <label htmlFor="task-title">Title</label><input id="task-title" name="title" defaultValue={task?.title || ''} placeholder="e.g. Verify the ingress routes" required maxLength={200} disabled={saving} />
      <label htmlFor="task-description">Notes <span className="optional">Optional</span></label><textarea id="task-description" name="description" defaultValue={task?.description || ''} placeholder="Details, a useful link, or the next step…" rows={4} disabled={saving} />
      <div className="form-grid"><div><label htmlFor="task-priority">Priority</label><select id="task-priority" name="priority" defaultValue={task?.priority || 'MEDIUM'} disabled={saving}>{PRIORITIES.map((value) => <option key={value} value={value}>{priorityLabel(value)}</option>)}</select></div><div><label htmlFor="task-status">Status</label><select id="task-status" name="status" defaultValue={task?.status || 'TODO'} disabled={saving}>{STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      <label htmlFor="task-assignee">Assignee</label><input id="task-assignee" name="assignee" defaultValue={task?.assignee || 'Vedanshu Nishad'} maxLength={120} disabled={saving} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="dialog-footer"><button type="button" className="button secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}{!saving && <Icon name="arrow" size={16} />}</button></div>
    </form>
  </Dialog>;
}

function DeleteDialog({ task, onClose, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setBusy(true);
    try { await onDelete(task); } catch (failure) { setError(failure.message === 'Failed to fetch' ? 'Couldn’t delete this task. Please try again.' : failure.message); setBusy(false); }
  }
  return <Dialog labelledBy="delete-dialog-title" onClose={onClose} busy={busy} className="delete-dialog">
    <span className="overline">REMOVE TASK</span><h2 id="delete-dialog-title">Delete this task?</h2><p className="delete-copy">“{task.title}” will be permanently removed.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="dialog-footer"><button className="button secondary" onClick={onClose} disabled={busy}>Keep task</button><button className="button danger" onClick={remove} disabled={busy}>{busy ? 'Deleting…' : 'Delete task'}</button></div>
  </Dialog>;
}

function Priority({ value }) {
  return <span className={`priority priority-${value.toLowerCase()}`}><span className="priority-bars" aria-hidden="true"><i /><i /><i /></span>{priorityLabel(value)}</span>;
}

function StatusSelect({ task, busy, onChange }) {
  return <div className={`status-control status-${task.status.toLowerCase()}`}><span className="status-dot" /><select value={task.status} aria-label={`Status for ${task.title}`} onChange={(event) => onChange(task, event.target.value)} disabled={busy}>{STATUSES.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}</select></div>;
}

function TaskActions({ task, busy, onEdit, onDelete }) {
  return <div className="task-actions"><button className="icon-button" aria-label={`Edit ${task.title}`} title="Edit task" onClick={() => onEdit(task)} disabled={busy}><Icon name="edit" size={16} /></button><button className="icon-button delete-action" aria-label={`Delete ${task.title}`} title="Delete task" onClick={() => onDelete(task)} disabled={busy}><Icon name="trash" size={16} /></button></div>;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [synced, setSynced] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [nextTasks, nextStats] = await Promise.all([request('/tasks'), request('/tasks/stats')]);
      setTasks(nextTasks);
      setStats(nextStats);
      setSynced(new Date());
      setLoaded(true);
      setError('');
    } catch {
      setError('Couldn’t refresh your tasks. Check your connection and try again.');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function save(values, id) {
    await request(id == null ? '/tasks' : `/tasks/${id}`, { method: id == null ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    setEditing(null);
    setNotice(id == null ? 'Task created.' : 'Changes saved.');
    await load();
  }
  async function changeStatus(task, status) {
    setPending(task.id);
    try {
      await request(`/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setNotice(`Moved to ${STATUSES.find((item) => item.value === status).label.toLowerCase()}.`);
      await load();
    } catch (failure) { setError(failure.message === 'Failed to fetch' ? 'Couldn’t update this task. Please try again.' : failure.message); }
    finally { setPending(null); }
  }
  async function remove(task) {
    await request(`/tasks/${task.id}`, { method: 'DELETE' });
    setDeleting(null);
    setNotice('Task deleted.');
    await load();
  }
  function clearFilters() { setFilter('ALL'); setSearch(''); setPriority('ALL'); }

  const query = search.trim().toLowerCase();
  const visible = tasks.filter((task) => (filter === 'ALL' || task.status === filter) && (priority === 'ALL' || task.priority === priority) && (!query || `${task.title} ${task.description} ${task.assignee}`.toLowerCase().includes(query))).sort((a, b) => sort === 'priority' ? PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || b.id - a.id : sort === 'oldest' ? a.id - b.id : b.id - a.id);
  const complete = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  const filtered = filter !== 'ALL' || query || priority !== 'ALL';
  const today = new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'long' }).format(new Date());
  const taskProps = (task) => ({ task, busy: pending === task.id, onEdit: setEditing, onDelete: setDeleting });

  return <div className="workspace">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setView('list'); clearFilters(); }} aria-label="LabBoard home"><span className="brand-mark"><Icon name="notebook" size={23} /></span><span>LabBoard<span className="brand-caption">DevOps lab notebook.</span></span></a>
      <div className="workspace-name"><span className="workspace-monogram">VN</span><div><strong>Vedanshu’s workspace</strong><span>DevOps coursework</span></div></div>
      <span className="nav-label">WORKSPACE</span>
      <nav className="workspace-nav" aria-label="Workspace views">
        <button className={view === 'list' ? 'nav-item active' : 'nav-item'} onClick={() => setView('list')} aria-pressed={view === 'list'}><Icon name="list" /><span>Task list</span><span className="nav-count">{loaded ? stats.total : '—'}</span></button>
        <button className={view === 'board' ? 'nav-item active' : 'nav-item'} onClick={() => setView('board')} aria-pressed={view === 'board'}><Icon name="board" /><span>Board</span></button>
      </nav>
      <div className="sidebar-note"><span className="overline">PROGRESS</span><p>{loaded ? <><strong>{stats.done}</strong> of {stats.total} tasks complete</> : 'Your progress will appear here.'}</p><div className="progress-track" role="progressbar" aria-label="Tasks completed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={complete}><span style={{ width: `${complete}%` }} /></div><span className="progress-caption">{stats.total ? `${stats.total - stats.done} still on the list.` : 'Add your first task to get started.'}</span></div>
      <div className="sidebar-footer"><span className="avatar">VN</span><div><strong>Vedanshu Nishad</strong><span>Personal workspace</span></div></div>
    </aside>
    <main className="main">
      <div className="topline"><span>WORKSPACE <span className="breadcrumb-slash">/</span> DEVOPS LABS</span><time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time></div>
      <header className="page-header"><div><h1>Lab work<span className="heading-period">.</span></h1><p className="page-description">Your DevOps tasks, notes and progress.</p></div><button className="button primary new-task" onClick={() => setEditing({})}><Icon name="plus" size={18} />New task</button></header>
      <section className="work-summary" aria-label="Task summary"><div><span className="summary-number">{loaded ? stats.total : '—'}</span><span>Total tasks</span></div>{STATUSES.map(({ value, label, count }) => <button key={value} className={`summary-item summary-${value.toLowerCase()} ${filter === value ? 'is-current' : ''}`} onClick={() => setFilter(filter === value ? 'ALL' : value)} aria-pressed={filter === value}><span className="summary-number">{loaded ? stats[count] : '—'}</span><span><i className="status-dot" />{label}</span></button>)}<span className="summary-finish">{loaded && stats.total > 0 && <><Icon name="check" size={15} />{complete}% complete</>}</span></section>
      {error && <div className="error-banner" role="alert"><p>{error}</p><button className="text-button" onClick={load} disabled={loading}>Try again</button></div>}
      <section className="task-section" aria-labelledby="tasks-heading">
        <div className="section-heading"><div><h2 id="tasks-heading">{view === 'board' ? 'The board' : 'Your tasks'}</h2><span className="result-count">{loaded ? `${visible.length} ${visible.length === 1 ? 'task' : 'tasks'}${filtered ? ` of ${stats.total}` : ''}` : 'Loading…'}</span></div><div className="view-switch" aria-label="Task view">{['list', 'board'].map((value) => <button key={value} aria-pressed={view === value} className={view === value ? 'selected' : ''} onClick={() => setView(value)}><Icon name={value} size={16} />{value === 'list' ? 'List' : 'Board'}</button>)}</div></div>
        <div className="task-toolbar"><label className="search-field"><Icon name="search" size={17} /><input aria-label="Search tasks" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a task…" />{search && <button className="icon-button" aria-label="Clear search" onClick={() => setSearch('')}><Icon name="close" size={14} /></button>}</label><div className="toolbar-selects"><select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="ALL">All priorities</option>{PRIORITIES.map((value) => <option value={value} key={value}>{priorityLabel(value)} priority</option>)}</select><select aria-label="Sort tasks" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Priority first</option></select></div></div>
        <div className="status-tabs" role="group" aria-label="Filter tasks by status">{[{ value: 'ALL', label: 'All tasks', count: 'total' }, ...STATUSES].map(({ value, label, count }) => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{loaded ? stats[count] : '—'}</span></button>)}</div>
        {loading && !loaded ? <div className="empty-state" role="status"><span className="loading-line" /><h3>Getting your tasks…</h3></div> : !loaded ? <div className="empty-state"><Icon name="notebook" size={30} /><h3>Your tasks couldn’t load</h3><p>Try again when your connection is back.</p><button className="button secondary" onClick={load}>Reload tasks</button></div> : !visible.length ? <div className="empty-state"><span className="empty-icon"><Icon name={filtered ? 'search' : 'notebook'} size={28} /></span><h3>{filtered ? 'Nothing here just yet' : 'A fresh page'}</h3><p>{filtered ? 'Try another search or clear the filters.' : 'Add your first task. Everything starts somewhere.'}</p><button className="button secondary" onClick={filtered ? clearFilters : () => setEditing({})}>{filtered ? 'Clear filters' : 'Add a task'}<Icon name={filtered ? 'close' : 'plus'} size={15} /></button></div> : view === 'list' ? <>
          <div className="list-head" aria-hidden="true"><span>TASK</span><span>PRIORITY</span><span>STATUS</span><span /></div>
          <ul className="task-list">{visible.map((task) => <li className={`task-row ${task.status === 'DONE' ? 'task-complete' : ''}`} key={task.id}><div className="task-details"><span className={`task-marker marker-${task.status.toLowerCase()}`} aria-hidden="true">{task.status === 'DONE' && <Icon name="check" size={11} />}</span><div><button className="task-title" onClick={() => setEditing(task)}>{task.title}</button>{task.description && <p className="task-description">{task.description}</p>}<div className="task-meta"><span>{task.assignee}</span><span className="meta-dot">·</span><time dateTime={task.created_at}>{taskDate(task.created_at)}</time><span className="task-id">#{String(task.id).padStart(3, '0')}</span></div></div></div><Priority value={task.priority} /><StatusSelect task={task} busy={pending === task.id} onChange={changeStatus} /><TaskActions {...taskProps(task)} /></li>)}</ul>
        </> : <div className="board-grid">{STATUSES.map(({ value, label }) => {
          const column = visible.filter((task) => task.status === value);
          return <section className={`board-column column-${value.toLowerCase()}`} key={value} aria-label={`${label} tasks`}><div className="column-heading"><span><i className="status-dot" />{label}</span><span className="column-count">{column.length}</span></div><ul className="board-cards">{column.map((task) => <li className="task-card" key={task.id}><div className="card-top"><span className="task-id">#{String(task.id).padStart(3, '0')}</span><TaskActions {...taskProps(task)} /></div><button className="task-title" onClick={() => setEditing(task)}>{task.title}</button>{task.description && <p className="task-description">{task.description}</p>}<div className="card-person"><span className="avatar small" aria-hidden="true">{initials(task.assignee)}</span><span>{task.assignee}</span></div><div className="card-bottom"><Priority value={task.priority} /><StatusSelect task={task} busy={pending === task.id} onChange={changeStatus} /></div></li>)}</ul>{!column.length && <p className="column-empty">No tasks here.</p>}</section>;
        })}</div>}
        <footer className="list-footer"><span>{synced ? `Last refreshed ${synced.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : 'Waiting for your tasks'}</span><button className="text-button" onClick={load} disabled={loading}><Icon name="refresh" size={14} className={loading ? 'spinning' : ''} />{loading ? 'Refreshing…' : 'Refresh'}</button></footer>
      </section>
      <div className="page-footer"><span>DevOps lab notebook</span><span>LABBOARD <i /> PERSONAL WORKSPACE</span></div>
    </main>
    {editing && <TaskForm key={editing.id ?? 'new'} task={editing.id == null ? null : editing} onClose={() => setEditing(null)} onSave={save} />}
    {deleting && <DeleteDialog task={deleting} onClose={() => setDeleting(null)} onDelete={remove} />}
    <div className="notice-region" role="status" aria-live="polite">{notice && <div className="toast"><Icon name="check" size={16} />{notice}</div>}</div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
