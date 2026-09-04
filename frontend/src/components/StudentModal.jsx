import { useState, useEffect } from 'react';

const EMPTY = { name: '', email: '', course: '' };

/**
 * StudentModal — Add / Edit form.
 * Props: student (null = add mode), onSave(data), onClose(), saving
 */
function StudentModal({ student, onSave, onClose, saving }) {
  const isEdit = Boolean(student);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(student ? { name: student.name, email: student.email, course: student.course } : EMPTY);
    setErrors({});
  }, [student]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name   = 'Name is required';
    else if (form.name.length > 100)                e.name   = 'Max 100 characters';
    if (!form.email.trim())                         e.email  = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    else if (form.email.length > 255)               e.email  = 'Max 255 characters';
    if (!form.course.trim())                        e.course = 'Course is required';
    else if (form.course.length > 100)              e.course = 'Max 100 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave({ name: form.name.trim(), email: form.email.trim(), course: form.course.trim() });
  };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEdit ? '✎ Edit Student' : '＋ Add Student'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              className={`form-input${errors.name ? ' error' : ''}`}
              placeholder="e.g. Alice Johnson"
              value={form.name}
              onChange={handleChange}
              autoFocus
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="e.g. alice@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="course">Course</label>
            <input
              id="course" name="course" type="text"
              className={`form-input${errors.course ? ' error' : ''}`}
              placeholder="e.g. Computer Science"
              value={form.course}
              onChange={handleChange}
            />
            {errors.course && <p className="form-error">{errors.course}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⟳ Saving…' : isEdit ? '✓ Update Student' : '✓ Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentModal;
