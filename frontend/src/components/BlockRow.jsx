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
      className="relative flex items-start gap-2 group cursor-move"
    >
      <span className="text-gray-300 group-hover:text-gray-500 cursor-grab select-none">⠿</span>

      <select
        value={block.type}
        onChange={(e) => onTypeChange(block, e.target.value)}
        className="text-xs border rounded px-1 py-1 text-gray-500"
      >
        {['text', 'heading', 'todo', 'image'].map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="flex-1 relative">
        {block.type === 'heading' ? (
          <input {...sharedProps} className="w-full text-xl font-semibold outline-none border-b" placeholder="Heading..." />
        ) : block.type === 'todo' ? (
          <div className="flex items-center gap-2">
            <input type="checkbox" />
            <input {...sharedProps} className="flex-1 outline-none" placeholder="To-do..." />
          </div>
        ) : block.type === 'image' ? (
          <input {...sharedProps} className="w-full outline-none border-b" placeholder="Image URL..." />
        ) : (
          <textarea {...sharedProps} className="w-full outline-none resize-none" placeholder="Type '/' for commands..." rows={1} />
        )}

        {slashMenuOpen && <SlashMenu onSelect={onSlashSelect} onClose={onSlashClose} />}
      </div>

      <button
        onClick={() => onDelete(block._id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs"
      >
        ✕
      </button>
    </div>
  )
}

export default BlockRow
import SlashMenu from './SlashMenu'
