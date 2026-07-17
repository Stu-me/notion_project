function BlockRow({
  block, onContentChange, onTypeChange, onDelete, onDragStart, onDrop,
  registerRef, onAddAfter, onDeleteAndFocusPrevious, onArrowNav,
  slashMenuOpen, onSlashOpen, onSlashClose, onSlashSelect,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && block.type !== 'text') {
      // headings/todos/images: Enter still creates a new block, doesn't add newline
      e.preventDefault()
      onAddAfter(block._id)
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAddAfter(block._id)
      return
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault()
      onDeleteAndFocusPrevious(block._id)
      return
    }
    if (e.key === 'ArrowUp') {
      onArrowNav(block._id, 'up')
    }
    if (e.key === 'ArrowDown') {
      onArrowNav(block._id, 'down')
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    onContentChange(block._id, value)

    if (value === '/') {
      onSlashOpen()
    } else if (slashMenuOpen) {
      onSlashClose()
    }
  }

  const sharedProps = {
    ref: registerRef,
    value: block.content ?? '',
    onChange: handleChange,
    onKeyDown: handleKeyDown,
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', block._id)
        onDragStart(block._id)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(block._id, e.dataTransfer.getData('text/plain'))}
      className="relative flex items-start gap-2 group cursor-move rounded-xl px-2 py-1 hover:bg-[var(--bg)] transition"
    >
      <span className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] cursor-grab select-none transition">⠿</span>

      <select
        value={block.type}
        onChange={(e) => onTypeChange(block, e.target.value)}
        className="text-xs border border-[var(--border)] rounded-lg px-1.5 py-1 text-[var(--text-secondary)] bg-[var(--bg-card)] outline-none focus:border-[var(--accent)] transition"
      >
        {['text', 'heading', 'todo', 'image'].map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="flex-1 relative">
        {block.type === 'heading' ? (
          <input {...sharedProps} className="w-full text-xl font-semibold outline-none border-b border-[var(--border)] focus:border-[var(--accent)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition" placeholder="Heading..." />
        ) : block.type === 'todo' ? (
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-[var(--accent)]" />
            <input {...sharedProps} className="flex-1 outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]" placeholder="To-do..." />
          </div>
        ) : block.type === 'image' ? (
          <input {...sharedProps} className="w-full outline-none border-b border-[var(--border)] focus:border-[var(--accent)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition" placeholder="Image URL..." />
        ) : (
          <textarea {...sharedProps} className="w-full outline-none resize-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]" placeholder="Type '/' for commands..." rows={1} />
        )}

        {slashMenuOpen && <SlashMenu onSelect={onSlashSelect} onClose={onSlashClose} />}
      </div>

      <button
        onClick={() => onDelete(block._id)}
        className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--accent)] text-xs transition"
      >
        ✕
      </button>
    </div>
  )
}

export default BlockRow
import SlashMenu from './SlashMenu'
