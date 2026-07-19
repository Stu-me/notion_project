import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { workspaceService } from '../services/workspaceService'
import { pageService } from '../services/pageService'
import ConfirmModal from '../components/ConfirmModal'

function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [pages, setPages] = useState([])

  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newPageTitle, setNewPageTitle] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const selectWorkspace = useCallback(async (workspace) => {
    setActiveWorkspace(workspace)
    try {
      const res = await pageService.getAll(workspace._id)
      setPages(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pages')
    }
  }, [])

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    try {
      const res = await workspaceService.getAll()   // was: api.get('/api/workspaces')
      setWorkspaces(res.data)
      if (res.data.length > 0) {
        await selectWorkspace(res.data[0])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }, [selectWorkspace])

  // NOTE: assumes GET /api/pages returns pages for the logged-in user,
  // and each page has a `workspace` field you can filter on client-side.
  // If your backend supports GET /api/pages?workspace=<id>, swap this to use that instead — cleaner.
  useEffect(() => {
    // This starts an asynchronous API request; its state updates happen after it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return

    try {
      const res = await workspaceService.create({ name: newWorkspaceName })   // was: api.post(...)
      setWorkspaces([...workspaces, res.data])
      setNewWorkspaceName('')
      selectWorkspace(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace')
    }
  }

  const handleDeleteWorkspace = async (id) => {
    try {
      await workspaceService.delete(id)   // was: api.delete(...)
      const updated = workspaces.filter((w) => w._id !== id)
      setWorkspaces(updated)
      if (activeWorkspace?._id === id) {
        setActiveWorkspace(null)
        setPages([])
        if (updated.length > 0) selectWorkspace(updated[0])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workspace')
    }
  }

  const handleCreatePage = async (e) => {
    e.preventDefault()
    if (!newPageTitle.trim() || !activeWorkspace) return

    try {
      const res = await pageService.create({
        title: newPageTitle,
        workspace: activeWorkspace._id,
      })
      setPages([...pages, res.data])
      setNewPageTitle('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create page')
    }
  }

  const handleDeletePage = async (id) => {
    try {
      await pageService.delete(id)
      setPages(pages.filter((p) => p._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete page')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return

    const { type, id } = deleteConfirm
    setDeleteConfirm(null)

    if (type === 'workspace') {
      await handleDeleteWorkspace(id)
      return
    }

    await handleDeletePage(id)
  }

  if (loading) return <h1 className="p-6 text-[var(--text-secondary)]">Loading...</h1>

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      
      <div className="flex min-h-screen">

        {/* Sidebar — workspaces */}
        <div className="w-64 border-r border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="font-semibold mb-3 text-[var(--text-primary)]">Workspaces</h2>

          <form onSubmit={handleCreateWorkspace} className="mb-4">
            <input
              type="text"
              placeholder="New workspace"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="w-full p-2 text-sm border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition mb-2"
            />
            <button type="submit" className="w-full bg-[var(--btn-primary-bg)] text-[var(--text-on-accent)] text-sm py-2 rounded-xl font-semibold hover:bg-[var(--btn-primary-hover)] transition">
              + Add
            </button>
          </form>

          <ul className="space-y-1">
            {workspaces.map((ws) => (
              <li
                key={ws._id}
                className={`flex justify-between items-center px-3 py-2 rounded-xl cursor-pointer text-sm transition ${
                  activeWorkspace?._id === ws._id ? 'bg-[var(--bg)] font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span onClick={() => selectWorkspace(ws)} className="flex-1">
                  {ws.name}
                </span>
                <button
                  onClick={() => setDeleteConfirm({
                    type: 'workspace',
                    id: ws._id,
                    title: 'Delete workspace?',
                    message: 'Delete this workspace? This cannot be undone.',
                    confirmText: 'Delete workspace',
                    variant: 'danger',
                  })}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] text-xs ml-2 transition"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main — pages */}
        <div className="flex-1 p-8">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-end mb-6">
            <Link to="/subscribe" className="text-sm rounded-xl border border-[var(--border)] px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition bg-[var(--bg-card)]">
              Manage subscription
            </Link>
          </div>

          {!activeWorkspace ? (
            <p className="text-[var(--text-secondary)]">Create or select a workspace to get started.</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">{activeWorkspace.name}</h1>

              <form onSubmit={handleCreatePage} className="flex gap-2 mb-8">
                <input
                  type="text"
                  placeholder="New page title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="flex-1 p-2.5 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition bg-[var(--bg-card)]"
                />
                <button type="submit" className="bg-[var(--accent)] text-[var(--text-on-accent)] px-5 rounded-xl text-sm font-semibold hover:bg-[var(--accent-hover)] transition">
                  + Page
                </button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {pages.map((page) => (
                  <div
                    key={page._id}
                    className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] p-5 hover:shadow-[var(--shadow-card)] cursor-pointer relative transition group"
                  >
                    <div onClick={() => navigate(`/page/${page._id}`)}>
                      <p className="font-medium text-[var(--text-primary)]">{page.title}</p>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({
                        type: 'page',
                        id: page._id,
                        title: 'Delete page?',
                        message: 'Delete this page? This cannot be undone.',
                        confirmText: 'Delete page',
                        variant: 'danger',
                      })}
                      className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--accent)] text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {pages.length === 0 && (
                <p className="text-[var(--text-secondary)] text-sm">No pages yet in this workspace.</p>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteConfirm)}
        title={deleteConfirm?.title || 'Confirm action'}
        message={deleteConfirm?.message || ''}
        confirmText={deleteConfirm?.confirmText || 'Confirm'}
        variant={deleteConfirm?.variant || 'danger'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}

export default DashboardPage
