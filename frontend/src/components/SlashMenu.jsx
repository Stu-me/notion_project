const OPTIONS = [
  { type: 'text', label: 'Text', hint: 'Plain paragraph' },
  { type: 'heading', label: 'Heading', hint: 'Section title' },
  { type: 'todo', label: 'To-do', hint: 'Checklist item' },
  { type: 'image', label: 'Image', hint: 'Embed via URL' },
]

function SlashMenu({ onSelect }) {
  return (
    <div className="absolute z-10 mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden">
      {OPTIONS.map((opt) => (
        <button
          key={opt.type}
          onClick={() => onSelect(opt.type)}
          className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--bg)] flex flex-col transition"
        >
          <span className="font-medium text-[var(--text-primary)]">{opt.label}</span>
          <span className="text-xs text-[var(--text-secondary)]">{opt.hint}</span>
        </button>
      ))}
    </div>
  )
}

export default SlashMenu
