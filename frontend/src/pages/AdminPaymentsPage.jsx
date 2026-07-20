import { useCallback, useEffect, useState } from 'react'
import { adminService } from '../services/adminService'
import ConfirmModal from '../components/ConfirmModal'

// Turns backend dates into the administrator's local readable date and time.
function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

// Keeps the badge presentation consistent for plans, requests, and presence states.
function Badge({ children, tone = 'gray' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[tone]}`}>{children}</span>
}

// Maps business states to a clear, accessible badge colour.
function getTone(status) {
  if (['active', 'approved', 'online'].includes(status)) return 'green'
  if (status === 'pending') return 'yellow'
  if (['suspended', 'rejected'].includes(status)) return 'red'
  return 'gray'
}

// Renders one reusable high-level metric card for the admin overview.
function MetricCard({ label, value, hint, icon }) {
  return (
    <article className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-medium text-(--text-secondary)">{label}</p><p className="mt-3 text-3xl font-bold text-(--text-primary)">{value}</p></div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/50">{icon}</span>
      </div>
      <p className="mt-3 text-xs text-(--text-secondary)">{hint}</p>
    </article>
  )
}

// Combines the admin metrics, notification queue, and subscription-management table.
function AdminPaymentsPage() {
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Loads the independent dashboard sections together so the screen has one consistent refresh point.
  const loadAdminData = useCallback(async () => {
    setError('')
    try {
      const [overviewRes, usersRes, notificationsRes] = await Promise.all([
        adminService.getOverview(), adminService.getUsers({ limit: 50 }), adminService.getNotifications(),
      ])
      setOverview(overviewRes.data)
      setUsers(usersRes.data.users)
      setNotifications(notificationsRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the admin dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // The request resolves asynchronously; the linter guard documents this intentional initial data load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAdminData()
  }, [loadAdminData])

  // Executes the payment decision selected in the user table, then refreshes affected metrics and notifications.
  const handleAction = async () => {
    if (!confirmAction) return
    const { type, userId } = confirmAction
    setConfirmAction(null)
    setActionLoadingId(userId)
    setError('')
    try {
      await adminService.updateUserSubscriptionStatus(userId, type)
      let displayType = type
      if (type === 'decline') displayType = 'declined'
      if (type === 'approve') displayType = 'approved'
      if (type === 'suspend') displayType = 'suspended'
      setMessage(`Subscription status successfully updated to ${displayType}.`)
      await loadAdminData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete this admin action')
    } finally {
      setActionLoadingId('')
    }
  }

  // Resolves only support-query notifications; payment notifications disappear when approved or declined.
  const handleResolveQuery = async (queryId) => {
    setActionLoadingId(queryId)
    try {
      await adminService.resolveQuery(queryId)
      setMessage('Support query marked as resolved.')
      await loadAdminData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resolve the query')
    } finally {
      setActionLoadingId('')
    }
  }

  if (loading) return <main className="min-h-screen p-6 text-(--text-secondary)">Loading admin dashboard...</main>

  return (
    <main className="min-h-screen bg-(--bg) p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-blue-600">MASTER ADMIN</p><h1 className="mt-1 text-3xl font-bold text-(--text-primary)">Administration overview</h1><p className="mt-1 text-sm text-(--text-secondary)">Manage subscriptions, payment approvals, and user support.</p></div>
          <div className="relative self-start sm:self-auto">
            <button onClick={() => setNotificationsOpen((isOpen) => !isOpen)} className="relative rounded-xl border border-(--border) bg-(--bg-card) px-4 py-2.5 text-sm font-semibold text-(--text-primary) shadow-sm hover:bg-(--bg) transition" aria-expanded={notificationsOpen}>
              🔔 Notifications {notifications.length > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{notifications.length}</span>}
            </button>
            {notificationsOpen && <section className="absolute right-0 z-20 mt-2 w-[min(24rem,90vw)] overflow-hidden rounded-xl border border-(--border) bg-(--bg-card) shadow-xl">
              <div className="border-b border-(--border) px-4 py-3"><h2 className="font-bold text-(--text-primary)">Needs your attention</h2></div>
              {notifications.length === 0 ? <p className="p-4 text-sm text-(--text-secondary)">You are all caught up.</p> : <div className="max-h-96 overflow-y-auto divide-y divide-(--border)">{notifications.map((notice) => <div key={`${notice.type}-${notice.id}`} className="p-4"><p className="text-sm font-semibold text-(--text-primary)">{notice.title}</p><p className="mt-1 text-xs text-(--text-secondary)">{notice.detail}</p><p className="mt-1 text-xs text-(--text-secondary)">{formatDate(notice.createdAt)}</p>{notice.type === 'query' && <button onClick={() => handleResolveQuery(notice.id)} disabled={actionLoadingId === notice.id} className="mt-2 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">Mark resolved</button>}</div>)}</div>}
            </section>}
          </div>
        </header>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Total users" value={overview?.totalUsers ?? 0} hint="Registered customer accounts" icon="👥" />
          <MetricCard label="Active users" value={overview?.activeUsers ?? 0} hint="Active in the last 5 minutes" icon="🟢" />
          <MetricCard label="Subscribed users" value={overview?.subscribedUsers ?? 0} hint="Currently active paid plans" icon="✨" />
          <MetricCard label="Pending approvals" value={overview?.pendingApprovals ?? 0} hint={`${overview?.openQueries ?? 0} open support queries`} icon="⏳" />
          <MetricCard label="Total earnings" value={`₹${(overview?.totalEarnings ?? 0).toLocaleString()}`} hint="Approved manual subscriptions" icon="💰" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) shadow-sm">
          <div className="flex items-center justify-between border-b border-(--border) px-5 py-4"><div><h2 className="font-bold text-(--text-primary)">User subscriptions</h2><p className="mt-1 text-sm text-(--text-secondary)">Approve or decline pending payments, and suspend active paid access.</p></div><span className="text-sm text-(--text-secondary)">{users.length} users</span></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-(--bg)"><tr className="text-xs uppercase tracking-wide text-(--text-secondary)"><th className="px-5 py-3 font-semibold">User</th><th className="px-5 py-3 font-semibold">Subscription</th><th className="px-5 py-3 font-semibold">Payment status</th><th className="px-5 py-3 font-semibold">Activity</th><th className="px-5 py-3 font-semibold text-right">Actions</th></tr></thead><tbody className="divide-y divide-(--border)">{users.map((user) => {
            const payment = user.latestPayment
            const subscription = user.subscription
            const isBusy = actionLoadingId === user._id
            
            // Generate a stable avatar file index 01-37 from the user._id string
            const avatarNum = (user._id.slice(-4).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 37) + 1;
            const avatarPath = `/images/user/user-${String(avatarNum).padStart(2, '0')}.jpg`;

            return <tr key={user._id} className="hover:bg-(--bg) transition"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={avatarPath} alt={user.name} className="h-10 w-10 rounded-full object-cover border border-(--border) bg-(--bg)" /><div className="min-w-0"><p className="font-semibold text-(--text-primary) truncate">{user.name}</p><p className="mt-0.5 text-xs text-(--text-secondary) truncate">{user.email}</p></div></div></td><td className="px-5 py-4"><Badge tone={getTone(subscription?.status)}>{subscription?.plan || 'free'} {subscription?.status ? `· ${subscription.status}` : ''}</Badge></td><td className="px-5 py-4">{payment ? <Badge tone={getTone(payment.status)}>{payment.plan} · {payment.status}</Badge> : <span className="text-(--text-secondary)">No request</span>}</td><td className="px-5 py-4"><Badge tone={getTone(user.presence)}>{user.presence}</Badge><p className="mt-1 text-xs text-(--text-secondary)">Last seen {formatDate(user.lastSeenAt)}</p></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-1.5"><button onClick={() => setConfirmAction({ type: 'pending', userId: user._id, title: 'Set status to pending?', message: `Set ${user.name}'s payment review back to pending. They will revert to free limits.`, confirmText: 'Set Pending', variant: 'warning' })} disabled={isBusy} className="ripple rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Pending</button><button onClick={() => setConfirmAction({ type: 'approve', userId: user._id, title: 'Approve subscription?', message: `Activate/Approve subscription access for ${user.name}.`, confirmText: 'Approve', variant: 'warning' })} disabled={isBusy} className="ripple rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Approve</button><button onClick={() => setConfirmAction({ type: 'decline', userId: user._id, title: 'Decline request?', message: `Decline ${user.name}'s request and expire subscription.`, confirmText: 'Decline', variant: 'danger' })} disabled={isBusy} className="ripple rounded-lg bg-orange-600 hover:bg-orange-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Decline</button><button onClick={() => setConfirmAction({ type: 'suspend', userId: user._id, title: 'Suspend subscription?', message: `Suspend ${user.name}'s active paid access. Their data will be preserved.`, confirmText: 'Suspend', variant: 'danger' })} disabled={isBusy} className="ripple rounded-lg bg-red-600 hover:bg-red-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Suspend</button></div></td></tr>
          })}</tbody></table></div>
          {users.length === 0 && <p className="p-6 text-center text-sm text-(--text-secondary)">No registered users yet.</p>}
        </section>
      </div>
      <ConfirmModal isOpen={Boolean(confirmAction)} title={confirmAction?.title || 'Confirm action'} message={confirmAction?.message || ''} confirmText={confirmAction?.confirmText || 'Confirm'} variant={confirmAction?.variant || 'danger'} onConfirm={handleAction} onCancel={() => setConfirmAction(null)} />
    </main>
  )
}

export default AdminPaymentsPage
