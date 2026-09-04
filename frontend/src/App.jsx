import { useState, useEffect, useCallback } from 'react';
import './App.css';

import { getAllStudents, createStudent, updateStudent, softDelete, hardDelete } from './api/studentApi';
import StatsBar       from './components/StatsBar';
import StudentTable   from './components/StudentTable';
import StudentModal   from './components/StudentModal';
import ConfirmDialog  from './components/ConfirmDialog';
import Toast          from './components/Toast';

let toastId = 0;

export default function App() {
  // ── Data state ────────────────────────────────────────────────────────────
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showModal,      setShowModal]      = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);   // null = add mode
  const [saving,         setSaving]         = useState(false);

  // ── Confirm dialog state ──────────────────────────────────────────────────
  const [confirm, setConfirm] = useState(null);
  // { type: 'archive'|'delete', student: {...} }
  const [confirming, setConfirming] = useState(false);

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Load students ─────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllStudents();
      setStudents(data);
    } catch {
      addToast('Failed to load students. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Filtered list (client-side search) ───────────────────────────────────
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  // ── Add / Edit ────────────────────────────────────────────────────────────
  const openAdd  = ()       => { setEditingStudent(null); setShowModal(true); };
  const openEdit = (student)=> { setEditingStudent(student); setShowModal(true); };
  const closeModal = ()     => { setShowModal(false); setEditingStudent(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, data);
        addToast(`"${data.name}" updated successfully!`);
      } else {
        await createStudent(data);
        addToast(`"${data.name}" added successfully!`);
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong.';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Soft delete (archive) ─────────────────────────────────────────────────
  const promptSoftDelete = (student) => setConfirm({ type: 'archive', student });

  // ── Hard delete (permanent) ───────────────────────────────────────────────
  const promptHardDelete = (student) => setConfirm({ type: 'delete',  student });

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirming(true);
    const { type, student } = confirm;
    try {
      if (type === 'archive') {
        await softDelete(student.id);
        addToast(`"${student.name}" archived.`, 'info');
      } else {
        await hardDelete(student.id);
        addToast(`"${student.name}" permanently deleted.`, 'info');
      }
      setConfirm(null);
      fetchStudents();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Action failed.';
      addToast(msg, 'error');
    } finally {
      setConfirming(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="app-inner">

        {/* ── Header ── */}
        <header className="header">
          <div className="header-brand">
            <div className="header-icon">🎓</div>
            <div>
              <div className="header-title">Student Management System</div>
              <div className="header-subtitle">Spring Boot + React · REST API</div>
            </div>
          </div>
          <button className="btn btn-primary" id="add-student-btn" onClick={openAdd}>
            ＋ Add Student
          </button>
        </header>

        {/* ── Stats ── */}
        <StatsBar students={students} />

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              id="search-input"
              type="search"
              className="search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search students"
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchStudents} title="Refresh">
            ↺ Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <StudentTable
          students={filtered}
          loading={loading}
          onEdit={openEdit}
          onSoftDelete={promptSoftDelete}
          onHardDelete={promptHardDelete}
        />

      </div>

      {/* ── Modals ── */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}

      {confirm && (
        <ConfirmDialog
          type={confirm.type}
          studentName={confirm.student.name}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={confirming}
        />
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
