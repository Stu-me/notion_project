import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspaceService } from '../services/workspaceService'
import { pageService } from '../services/pageService'

function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [pages, setPages] = useState([])

  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newPageTitle, setNewPageTitle] = useState('')

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
    if (!confirm('Delete this workspace? This cannot be undone.')) return

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
    if (!confirm('Delete this page?')) return

    try {
      await pageService.delete(id)
      setPages(pages.filter((p) => p._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete page')
    }
  }

  if (loading) return <h1 className="p-6">Loading...</h1>

  return (
    <div>
      
      <div className="flex min-h-screen">

        {/* Sidebar — workspaces */}
        <div className="w-64 border-r bg-gray-50 p-4">
          <h2 className="font-semibold mb-3">Workspaces</h2>

          <form onSubmit={handleCreateWorkspace} className="mb-4">
            <input
              type="text"
              placeholder="New workspace"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="w-full p-1.5 text-sm border rounded mb-2"
            />
            <button type="submit" className="w-full bg-black text-white text-sm py-1.5 rounded">
              + Add
            </button>
          </form>

          <ul className="space-y-1">
            {workspaces.map((ws) => (
              <li
                key={ws._id}
                className={`flex justify-between items-center px-2 py-1.5 rounded cursor-pointer text-sm ${
                  activeWorkspace?._id === ws._id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                }`}
              >
                <span onClick={() => selectWorkspace(ws)} className="flex-1">
                  {ws.name}
                </span>
                <button
                  onClick={() => handleDeleteWorkspace(ws._id)}
                  className="text-red-400 hover:text-red-600 text-xs ml-2"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main — pages */}
        <div className="flex-1 p-6">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {!activeWorkspace ? (
            <p className="text-gray-500">Create or select a workspace to get started.</p>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-4">{activeWorkspace.name}</h1>

              <form onSubmit={handleCreatePage} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="New page title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button type="submit" className="bg-black text-white px-4 rounded text-sm">
                  + Page
                </button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pages.map((page) => (
                  <div
                    key={page._id}
                    className="border rounded p-4 hover:shadow cursor-pointer relative"
                  >
                    <div onClick={() => navigate(`/page/${page._id}`)}>
                      <p className="font-medium">{page.title}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePage(page._id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {pages.length === 0 && (
                <p className="text-gray-400 text-sm">No pages yet in this workspace.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
