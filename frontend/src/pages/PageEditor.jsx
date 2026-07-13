import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { pageService } from '../services/pageService'
import { blockService } from '../services/blockService'

const BLOCK_TYPES = ['text', 'heading', 'todo', 'image']

function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [page, setPage] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPage()
  }, [id])

  const fetchPage = async () => {
    setLoading(true)
    try {
      const pageRes = await pageService.getById(id)
      setPage(pageRes.data)

      const blocksRes = await blockService.getAllForPage(id)
      setBlocks(blocksRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBlock = async (type = 'text') => {
    try {
      const res = await blockService.create(id, {
        type,
        content: '',
      })
      setBlocks([...blocks, res.data])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add block')
    }
  }

  // Local update only — fires on every keystroke, doesn't hit the API yet
  const handleContentChange = (blockId, newContent) => {
    setBlocks(
      blocks.map((b) => (b._id === blockId ? { ...b, content: newContent } : b))
    )
  }

  // Fires on blur — this is when we actually save to backend
  const handleBlockSave = async (block) => {
    try {
      await blockService.update(block._id, {
        content: block.content,
        type: block.type,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save block')
    }
  }

  const handleTypeChange = async (block, newType) => {
    const updated = { ...block, type: newType }
    setBlocks(blocks.map((b) => (b._id === block._id ? updated : b)))
    try {
      await blockService.update(block._id, {
        content: block.content,
        type: newType,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update block type')
    }
  }

  const handleDeleteBlock = async (blockId) => {
    try {
      await blockService.delete(blockId)
      setBlocks(blocks.filter((b) => b._id !== blockId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete block')
    }
  }

  const handleTitleBlur = async (newTitle) => {
    if (newTitle === page.title) return
    try {
      const res = await pageService.update(id, { title: newTitle })
      setPage(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update title')
    }
  }

  if (loading) return <h1 className="p-6">Loading...</h1>
  if (!page) return <h1 className="p-6">Page not found</h1>

  return (
    <div>
      
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-500 mb-4 hover:underline"
        >
          ← Back to dashboard
        </button>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          defaultValue={page.title}
          onBlur={(e) => handleTitleBlur(e.target.value)}
          className="text-3xl font-bold w-full mb-6 outline-none"
        />

        <div className="space-y-3">
          {blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <div key={block._id} className="flex items-start gap-2 group">
                <select
                  value={block.type}
                  onChange={(e) => handleTypeChange(block, e.target.value)}
                  className="text-xs border rounded px-1 py-1 text-gray-500"
                >
                  {BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {block.type === 'heading' ? (
                  <input
                    value={block.content}
                    onChange={(e) => handleContentChange(block._id, e.target.value)}
                    onBlur={() => handleBlockSave(block)}
                    className="flex-1 text-xl font-semibold outline-none border-b"
                    placeholder="Heading..."
                  />
                ) : block.type === 'todo' ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input type="checkbox" />
                    <input
                      value={block.content}
                      onChange={(e) => handleContentChange(block._id, e.target.value)}
                      onBlur={() => handleBlockSave(block)}
                      className="flex-1 outline-none"
                      placeholder="To-do..."
                    />
                  </div>
                ) : block.type === 'image' ? (
                  <input
                    value={block.content}
                    onChange={(e) => handleContentChange(block._id, e.target.value)}
                    onBlur={() => handleBlockSave(block)}
                    className="flex-1 outline-none border-b"
                    placeholder="Image URL..."
                  />
                ) : (
                  <textarea
                    value={block.content}
                    onChange={(e) => handleContentChange(block._id, e.target.value)}
                    onBlur={() => handleBlockSave(block)}
                    className="flex-1 outline-none resize-none"
                    placeholder="Type something..."
                    rows={1}
                  />
                )}

                <button
                  onClick={() => handleDeleteBlock(block._id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>

        <div className="flex gap-2 mt-6">
          {BLOCK_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => handleAddBlock(t)}
              className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PageEditor