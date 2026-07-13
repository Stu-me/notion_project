import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pageService } from '../services/pageService'
import { blockService } from '../services/blockService'
import BlockRow from '../components/BlockRow'
import { useBlocksReducer } from '../hooks/useBlocksReducer'
import { useDebouncedSave } from '../hooks/useDebouncedSave'

const BLOCK_TYPES = ['text', 'heading', 'todo', 'image']

function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useBlocksReducer()
  const { blocks, status } = state
  const blockRefs = useRef({})

  const [page, setPage] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [slashMenuFor, setSlashMenuFor] = useState(null)

  const fetchPage = useCallback(async () => {
    try {
      const [pageRes, blocksRes] = await Promise.all([
        pageService.getById(id),
        blockService.getAllForPage(id),
      ])
      setPage(pageRes.data)
      dispatch({ type: 'SET_BLOCKS', payload: blocksRes.data })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load page')
    } finally {
      setPageLoading(false)
    }
  }, [dispatch, id])

  useEffect(() => {
    // This starts an asynchronous API request; its state updates happen after it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPage()
  }, [fetchPage])

  const persistBlock = useCallback(async (block) => {
    dispatch({ type: 'SET_STATUS', payload: 'saving' })
    try {
      await blockService.update(block._id, {
        content: block.content,
        type: block.type,
      })
      dispatch({ type: 'SET_STATUS', payload: 'idle' })
    } catch (err) {
      dispatch({ type: 'SET_STATUS', payload: 'error' })
      setError(err.response?.data?.message || 'Failed to save block')
    }
  }, [dispatch])

  const { debouncedSave, cancelSave } = useDebouncedSave(persistBlock, 500)

  const handleContentChange = useCallback((blockId, content) => {
    const block = blocks.find((item) => item._id === blockId)
    if (!block) return

    const updatedBlock = { ...block, content }
    dispatch({ type: 'UPDATE_BLOCK_CONTENT', payload: { id: blockId, content } })
    debouncedSave(blockId, updatedBlock)
  }, [blocks, debouncedSave, dispatch])

  const handleAddBlock = async (type = 'text') => {
    try {
      const res = await blockService.create(id, { type, content: '' })
      dispatch({ type: 'ADD_BLOCK', payload: res.data })
      requestAnimationFrame(() => blockRefs.current[res.data._id]?.focus())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add block')
    }
  }

  const saveOrder = useCallback(async (orderedBlocks) => {
    await blockService.reorder(id, orderedBlocks.map((block) => block._id))
  }, [id])

  const handleAddBlockAfter = async (afterId) => {
    try {
      const res = await blockService.create(id, { type: 'text', content: '' })
      const orderedBlocks = [...blocks].sort((a, b) => a.order - b.order)
      const afterIndex = orderedBlocks.findIndex((block) => block._id === afterId)
      orderedBlocks.splice(afterIndex + 1, 0, res.data)
      const nextBlocks = orderedBlocks.map((block, index) => ({ ...block, order: index }))

      dispatch({ type: 'REORDER_BLOCKS', payload: nextBlocks })
      await saveOrder(nextBlocks)
      requestAnimationFrame(() => blockRefs.current[res.data._id]?.focus())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add block')
      void fetchPage()
    }
  }

  const handleTypeChange = (block, type) => {
    const updatedBlock = { ...block, type }
    dispatch({ type: 'UPDATE_BLOCK_TYPE', payload: { id: block._id, type } })
    debouncedSave(block._id, updatedBlock)
  }

  const handleDeleteBlock = async (blockId) => {
    cancelSave(blockId)
    try {
      await blockService.delete(blockId)
      dispatch({ type: 'DELETE_BLOCK', payload: blockId })
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete block')
      return false
    }
  }

  const handleDeleteAndFocusPrevious = async (blockId) => {
    const orderedBlocks = [...blocks].sort((a, b) => a.order - b.order)
    const blockIndex = orderedBlocks.findIndex((block) => block._id === blockId)
    const previousBlock = orderedBlocks[blockIndex - 1]

    if (!previousBlock) return
    if (await handleDeleteBlock(blockId)) {
      requestAnimationFrame(() => blockRefs.current[previousBlock._id]?.focus())
    }
  }

  const handleArrowNav = (blockId, direction) => {
    const orderedBlocks = [...blocks].sort((a, b) => a.order - b.order)
    const blockIndex = orderedBlocks.findIndex((block) => block._id === blockId)
    const targetBlock = orderedBlocks[blockIndex + (direction === 'up' ? -1 : 1)]
    if (targetBlock) blockRefs.current[targetBlock._id]?.focus()
  }

  const handleSlashSelect = (block, type) => {
    const updatedBlock = { ...block, type, content: '' }
    dispatch({ type: 'UPDATE_BLOCK_TYPE', payload: { id: block._id, type } })
    dispatch({ type: 'UPDATE_BLOCK_CONTENT', payload: { id: block._id, content: '' } })
    setSlashMenuFor(null)
    debouncedSave(block._id, updatedBlock)
    requestAnimationFrame(() => blockRefs.current[block._id]?.focus())
  }

  const handleDragStart = (blockId) => {
    dispatch({ type: 'SET_DRAGGED', payload: blockId })
  }

  const handleDrop = async (targetId, draggedId) => {
    if (!draggedId || draggedId === targetId) return

    const orderedBlocks = [...blocks].sort((a, b) => a.order - b.order)
    const draggedIndex = orderedBlocks.findIndex((block) => block._id === draggedId)
    const targetIndex = orderedBlocks.findIndex((block) => block._id === targetId)
    if (draggedIndex < 0 || targetIndex < 0) return

    const [movedBlock] = orderedBlocks.splice(draggedIndex, 1)
    orderedBlocks.splice(targetIndex, 0, movedBlock)
    const nextBlocks = orderedBlocks.map((block, index) => ({ ...block, order: index }))
    dispatch({ type: 'REORDER_BLOCKS', payload: nextBlocks })

    try {
      await saveOrder(nextBlocks)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order')
      void fetchPage()
    }
  }

  const handleTitleBlur = async (title) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || trimmedTitle === page.title) return

    try {
      const res = await pageService.update(id, { title: trimmedTitle })
      setPage(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update title')
    }
  }

  if (pageLoading) return <h1 className="p-6">Loading...</h1>
  if (!page) return <h1 className="p-6">Page not found</h1>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to dashboard
        </button>
        <SaveStatus status={status} />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <input
        defaultValue={page.title}
        onBlur={(event) => handleTitleBlur(event.target.value)}
        className="text-3xl font-bold w-full mb-6 outline-none"
      />

      <div className="space-y-3">
        {[...blocks]
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <BlockRow
              key={block._id}
              block={block}
              registerRef={(node) => {
                if (node) blockRefs.current[block._id] = node
                else delete blockRefs.current[block._id]
              }}
              onContentChange={handleContentChange}
              onTypeChange={handleTypeChange}
              onDelete={handleDeleteBlock}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onAddAfter={handleAddBlockAfter}
              onDeleteAndFocusPrevious={handleDeleteAndFocusPrevious}
              onArrowNav={handleArrowNav}
              slashMenuOpen={slashMenuFor === block._id}
              onSlashOpen={() => setSlashMenuFor(block._id)}
              onSlashClose={() => setSlashMenuFor(null)}
              onSlashSelect={(type) => handleSlashSelect(block, type)}
            />
          ))}
      </div>

      <div className="flex gap-2 mt-6">
        {BLOCK_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleAddBlock(type)}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-100"
          >
            + {type}
          </button>
        ))}
      </div>
    </div>
  )
}

function SaveStatus({ status }) {
  if (status === 'saving') return <span className="text-xs text-gray-400">Saving...</span>
  if (status === 'error') return <span className="text-xs text-red-500">Save failed</span>
  return <span className="text-xs text-gray-300">Saved</span>
}

export default PageEditor
