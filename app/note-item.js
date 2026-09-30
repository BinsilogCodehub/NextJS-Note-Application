function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function NoteItem({ note, index, onEdit, onDelete }) {
  return (
    <article className={`note-item note-tone-${index % 3}`}>
      <div className="note-item-topline">
        <span className="note-date">{formatDate(note.createdAt)}</span>
        <span className="note-doodle" aria-hidden="true">{["✳", "⁕", "✦"][index % 3]}</span>
      </div>
      <h3>{note.title}</h3>
      <p className="note-description">{note.description}</p>
      <div className="note-item-footer">
        <span className="note-wordmark">little note <span>·</span></span>
        <div className="note-actions">
          <button type="button" onClick={() => onEdit(note)} aria-label={`Edit ${note.title}`}>
            Edit
          </button>
          <button
            type="button"
            className="delete-action"
            onClick={() => onDelete(note.id)}
            aria-label={`Delete ${note.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}