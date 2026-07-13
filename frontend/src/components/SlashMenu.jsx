const OPTIONS = [
  { type: 'text', label: 'Text', hint: 'Plain paragraph' },
  { type: 'heading', label: 'Heading', hint: 'Section title' },
  { type: 'todo', label: 'To-do', hint: 'Checklist item' },
  { type: 'image', label: 'Image', hint: 'Embed via URL' },
]

function SlashMenu({ onSelect }) {
  return (
    <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg overflow-hidden">
      {OPTIONS.map((opt) => (
        <button
          key={opt.type}
          onClick={() => onSelect(opt.type)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex flex-col"
        >
          <span className="font-medium">{opt.label}</span>
          <span className="text-xs text-gray-400">{opt.hint}</span>
        </button>
      ))}
    </div>
  )
}

export default SlashMenu
