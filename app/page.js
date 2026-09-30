"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import NoteItem from "./note-item";

const STORAGE_KEY = "little-notes";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [duplicateTitle, setDuplicateTitle] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    let initialNotes = [];
    try {
      const savedNotes = window.localStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        if (Array.isArray(parsedNotes)) initialNotes = parsedNotes;
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    startTransition(() => {
      setNotes(initialNotes);
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (storageReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, storageReady]);

  useEffect(() => {
    const normalizedTitle = title.trim().toLocaleLowerCase();
    const alreadyExists = Boolean(
      normalizedTitle &&
        notes.some(
          (note) =>
            note.id !== editingId &&
            note.title.trim().toLocaleLowerCase() === normalizedTitle,
        ),
    );
    startTransition(() => setDuplicateTitle(alreadyExists));
  }, [title, notes, editingId]);

  useEffect(() => {
    titleInputRef.current?.setCustomValidity(
      duplicateTitle ? "A note with this title already exists." : "",
    );
  }, [duplicateTitle]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  function saveNote(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const alreadyExists = notes.some(
      (note) =>
        note.id !== editingId &&
        note.title.trim().toLocaleLowerCase() === cleanTitle.toLocaleLowerCase(),
    );
    if (!cleanTitle || !cleanDescription || duplicateTitle || alreadyExists) return;

    if (editingId) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === editingId
            ? { ...note, title: cleanTitle, description: cleanDescription }
            : note,
        ),
      );
    } else {
      setNotes((currentNotes) => [
        {
          id: crypto.randomUUID(),
          title: cleanTitle,
          description: cleanDescription,
          createdAt: new Date().toISOString(),
        },
        ...currentNotes,
      ]);
    }
    resetForm();
  }

  function editNote(note) {
    setTitle(note.title);
    setDescription(note.description);
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteNote(id) {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    if (editingId === id) resetForm();
  }

  const filteredNotes = notes.filter((note) => {
    const query = search.trim().toLocaleLowerCase();
    return (
      !query ||
      note.title.toLocaleLowerCase().includes(query) ||
      note.description.toLocaleLowerCase().includes(query)
    );
  });

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Little Notes home">
          <span className="brand-mark" aria-hidden="true">n.</span>
          <span>little notes</span>
        </a>
        <div className="sidebar-rule" />
        <p className="sidebar-label">YOUR SPACE</p>
        <div className="nav-item nav-item-active">
          <span className="nav-icon" aria-hidden="true">▤</span>
          <span>All notes</span>
          <span className="nav-count">{notes.length}</span>
        </div>
        <div className="sidebar-bottom">
          <span className="sidebar-spark" aria-hidden="true">✳</span>
          <p>A little room for<br />your big thoughts.</p>
        </div>
      </aside>

      <section className="workspace" id="top">
        <header className="topbar">
          <span className="breadcrumb">My workspace <span>/</span> Notes</span>
          <span className="save-indicator"><span /> Saved on this device</span>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div>
              <p className="eyebrow">A PLACE TO PUT IT DOWN</p>
              <h1>Your notes<span className="heading-period">.</span></h1>
              <p className="heading-copy">Catch a thought before it wanders off.</p>
            </div>
            <div className="note-total">
              <span className="total-number">{notes.length.toString().padStart(2, "0")}</span>
              <span className="total-label">{notes.length === 1 ? "NOTE" : "NOTES"}</span>
            </div>
          </section>

          <div className="notes-layout">
            <section className="editor-panel" aria-labelledby="editor-heading">
              <div className="section-heading">
                <span className="section-marker">01</span>
                <h2 id="editor-heading">{editingId ? "Edit a note" : "New note"}</h2>
              </div>
              <form className="note-form" onSubmit={saveNote}>
                <label htmlFor="note-title">TITLE</label>
                <input
                  id="note-title"
                  ref={titleInputRef}
                  name="title"
                  type="text"
                  placeholder="Give it a name"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={80}
                  required
                />
                {duplicateTitle && (
                  <p className="field-message" role="status">A note with this title already exists.</p>
                )}
                <label htmlFor="note-description">YOUR THOUGHT</label>
                <textarea
                  id="note-description"
                  name="description"
                  placeholder="Start writing here..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={7}
                  maxLength={2000}
                  required
                />
                <div className="form-footer">
                  <span className="character-count">{description.length} / 2000</span>
                  <div className="form-actions">
                    {editingId && (
                      <button className="text-button" type="button" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                    <button className="save-button" type="submit" disabled={duplicateTitle}>
                      <span aria-hidden="true">{editingId ? "↻" : "+"}</span>
                      {editingId ? "Update note" : "Add note"}
                    </button>
                  </div>
                </div>
              </form>
              <div className="editor-footnote"><span>↳</span> Your notes stay on this device.</div>
            </section>

            <section className="notes-section" aria-labelledby="notes-heading">
              <div className="notes-heading-row">
                <div className="section-heading">
                  <span className="section-marker">02</span>
                  <h2 id="notes-heading">All notes</h2>
                </div>
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    placeholder="Search notes"
                    aria-label="Search notes"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <kbd>/</kbd>
                </label>
              </div>

              {filteredNotes.length > 0 ? (
                <div className="note-list">
                  {filteredNotes.map((note, index) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      index={index}
                      onEdit={editNote}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-illustration" aria-hidden="true">
                    <span className="paper-back" />
                    <span className="paper-front"><i /><i /><i /></span>
                    <span className="empty-star">✳</span>
                  </div>
                  <h3>{search ? "No notes found" : "Nothing here just yet"}</h3>
                  <p>{search ? "Try another word or phrase." : "Your next good thought can start on the left."}</p>
                </div>
              )}
            </section>
          </div>
          <footer className="page-footer"><span>TAKE A BREATH.</span><span>YOU CAN COME BACK TO THIS.</span></footer>
        </div>
      </section>
    </main>
  );
}
